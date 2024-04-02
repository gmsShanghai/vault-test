import fetch from "node-fetch";
import { updateDB,readDB } from "../data/db.js";
import _ from "lodash";

const base = "https://api.sandbox.paypal.com";

let PAYPAL_CLIENT_ID;
let PAYPAL_CLIENT_SECRET;
let access_token;
let VAULT_MODEL;
let VAULT_ID;
let CUSTOMER_ID;
let TEST_MERCHANT_ID;
let is_use_PAYPAL_AUTH_ASSERTION;

const initClientIDSecret = (
    clientID,
    secret,
    merchant_id,
    isUsePAYPAL_AUTH_ASSERTION
) => {
    console.log("\x1B[45m%s\x1B[0m", "[api.js][initClientIDSecret] Init!");
    PAYPAL_CLIENT_ID = clientID;
    PAYPAL_CLIENT_SECRET = secret;
    TEST_MERCHANT_ID = merchant_id;
    is_use_PAYPAL_AUTH_ASSERTION = isUsePAYPAL_AUTH_ASSERTION;
};

const initVaultInfo = (vault_model, vault_id, customer_id) => {
    VAULT_MODEL = vault_model;
    VAULT_ID = vault_id;
    CUSTOMER_ID = customer_id;
};

async function callPayPalAPI(httpMethod, requestBody, endpoint, getPathParam) {
    console.log("\x1B[41m%s\x1B[0m", "Call PayPal API");

    const url = `${base}${endpoint}`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "PayPal-Request-Id": generateRandomPayPalRequestID(),
    };
    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }
    const payload = requestBody;
    let response;
    if (httpMethod === "POST") {
        response = await fetch(url, {
            headers: requestHeaders,
            method: httpMethod,
            body: JSON.stringify(payload),
        });
    }
    if (httpMethod === "GET") {
        const getUrl = `${url}?${getPathParam}`;
        console.log("Retrieve Payment Token:", getUrl);
        response = await fetch(getUrl, {
            headers: requestHeaders,
            method: httpMethod,
        });
    }

    return handleResponse(response);
}

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateToken = async () => {
    console.log("\x1B[45m%s\x1B[0m", "[api.js][generateToken] Requesting!");
    console.log(
        "\x1B[36m%s\x1B[0m",
        `现在使用的/Current ClientID:${PAYPAL_CLIENT_ID}`
    );
    console.log(
        "\x1B[36m%s\x1B[0m",
        `现在使用的/Current Secret:${PAYPAL_CLIENT_SECRET}`
    );
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }

        let requestBody = {
            grant_type: "client_credentials",
            response_type: "id_token",
        };

        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
        ).toString("base64");

        const headers = {
            Authorization: `Basic ${auth}`,
        };

        if (VAULT_MODEL === "returning") {
            requestBody["target_customer_id"] = CUSTOMER_ID;
            if (is_use_PAYPAL_AUTH_ASSERTION) {
                headers["PayPal-Auth-Assertion"] = generatePayPalAuthAssertion(
                    PAYPAL_CLIENT_ID,
                    TEST_MERCHANT_ID
                );
            }
        }
        // if (VAULT_MODEL === "firstTime") {
        // }

        console.log("VAULT_MODEL:", VAULT_MODEL);
        console.log(JSON.stringify(requestBody, null, "  "));

        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams(requestBody),
            headers: headers,
        });

        const data = await response.json();
        access_token = data.access_token;
        console.log("\x1B[35m%s\x1B[0m", "access_token:", data.access_token);
        console.log("\x1B[35m%s\x1B[0m", "id_token:", data.id_token);
        return { access_token: data.access_token, id_token: data.id_token };
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
};

//[2024-03-21 我怀疑这个API过时了, A deprecated API is suspected]
// 参考来自这里: https://developer.paypal.com/docs/multiparty/checkout/advanced/integrate/#link-integratebackend
// 给3rd的文档都是旧的...
const generateClientToken = async () => {
    console.log("(无效的/Deprecated)[api.js][generateClientToken]Request....");
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        // console.log("Client token successfully generate!\n")
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
        ).toString("base64");
        const response = await fetch(`${base}/v1/identity/generate-token`, {
            method: "POST",
            body: JSON.stringify({
                customer_id: CUSTOMER_ID,
            }),
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        // console.log("response body:",JSON.stringify(data,null,"  "))
        ("(无效的/Deprecated)[api.js][generateClientToken]End");
        return data.client_token;
    } catch (error) {
        console.error("Failed to generate data client token:", error);
    }
};

const generatePayPalAuthAssertion = (clientID, merchantID) => {
    let PayPal_Auth_Assertion;
    let to_encode = {
        iss: clientID,
        payer_id: merchantID,
    };

    let to_encode_str = JSON.stringify(to_encode);
    let encoded_str = btoa(to_encode_str);
    PayPal_Auth_Assertion = `eyJhbGciOiJub25lIn0=.${encoded_str}.`;
    console.log("PayPal_Auth_Assertion Created!");
    console.log("clientID:", clientID);
    console.log("merchantID:", merchantID);
    console.log("PayPal_Auth_Assertion:", PayPal_Auth_Assertion);
    return PayPal_Auth_Assertion;
};

const generateRandomPayPalRequestID = () => {
    let PayPal_Request_Id = (Math.random() * 100000000).toString(36);
    PayPal_Request_Id = Date.now().toString(32);
    return PayPal_Request_Id;
};

const createSetupTokenSavePayPal = async () => {
    console.log(
        "\x1B[41m%s\x1B[0m",
        "  [api.js] createSetupTokenSavePayPal #1"
    );
    const url = `${base}/v3/vault/setup-tokens`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "PayPal-Request-Id": generateRandomPayPalRequestID(),
    };
    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }
    const payload = {
        payment_source: {
            paypal: {
                description:
                    "Description for PayPal to be shown to PayPal payer",
                shipping: {
                    name: {
                        full_name: "Firstname Lastname",
                    },
                    address: {
                        address_line_1: "2211 N First Street",
                        address_line_2: "Building 17",
                        admin_area_2: "San Jose",
                        admin_area_1: "CA",
                        postal_code: "95131",
                        country_code: "US",
                    },
                },
                permit_multiple_payment_tokens: false,
                usage_pattern: "IMMEDIATE",
                usage_type: "MERCHANT",
                customer_type: "CONSUMER",
                experience_context: {
                    shipping_preference: "SET_PROVIDED_ADDRESS",
                    payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                    brand_name: "EXAMPLE INC",
                    locale: "en-US",
                    return_url: "https://example.com/returnUrl",
                    cancel_url: "https://example.com/cancelUrl",
                },
            },
        },
    };

    const response = await fetch(url, {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

const createSetupTokenSaveCard = async () => {
    console.log("\x1B[41m%s\x1B[0m", "  [api.js] createSetupTokenSaveCard #1");
    const url = `${base}/v3/vault/setup-tokens`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "PayPal-Request-Id": generateRandomPayPalRequestID(),
    };
    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }
    const payload = {
        payment_source: {
            card: {
                verification_method: "SCA_ALWAYS",
                experience_context: {
                    brand_name: "GMS Rocks",
                    locale: "de-DE",
                    return_url: "https://example.com/returnUrl",
                    cancel_url: "https://example.com/cancelUrl",
                },
            },
        },
    };

    const response = await fetch(url, {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

const createPaymentToken = async (token_id) => {
    console.log("\x1B[41m%s\x1B[0m", "  [api.js] createPaymentToken #1");
    const url = `${base}/v3/vault/payment-tokens`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "PayPal-Request-Id": generateRandomPayPalRequestID(),
    };
    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }
    const payload = {
        payment_source: {
            token: {
                id: token_id,
                type: "SETUP_TOKEN",
            },
        },
    };

    const response = await fetch(url, {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (body) => {
    console.log("\x1B[41m%s\x1B[0m", "<1>[api.js] createOrder #1");

    // const { accessToken } = await generateToken();
    const url = `${base}/v2/checkout/orders`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "PayPal-Request-Id": generateRandomPayPalRequestID(),

        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    };
    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }
    const payload = body;

    const response = await fetch(url, {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Get transaction status to avoid duplicate capture.
 *
 */
const getOrderDetail = async (requestHeaders, orderID) => {
    const url = `${base}/v2/checkout/orders/${orderID}`;
    const response = await fetch(url, {
        method: "GET",
        headers: requestHeaders,
    });
    let result = await handleResponse(response);
    if (result.jsonResponse.status === "COMPLETED") {
        return "ORDER_ALREADY_COMPLETED";
    } else {
        return "ORDER_WAITING_CAPTURE";
    }
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
// export const captureOrder = async (orderID) => {
const captureOrder = async (orderID) => {
    console.log("\r\n\r\n");
    console.log("\x1B[42m%s\x1B[0m", "[api.js] captureOrder #1");

    // const { accessToken } = await generateToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    let requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,

        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    };

    if (is_use_PAYPAL_AUTH_ASSERTION) {
        requestHeaders["Paypal-Auth-Assertion"] = generatePayPalAuthAssertion(
            PAYPAL_CLIENT_ID,
            TEST_MERCHANT_ID
        );
    }

    let orderStatus = await getOrderDetail(requestHeaders, orderID);

    if (orderStatus === "ORDER_ALREADY_COMPLETED") {
        return {
            jsonResponse: {
                status: "ORDER_ALREADY_COMPLETED",
            },
            httpStatusCode: "299",
        };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: requestHeaders,
    });

    const result = await handleResponse(response);
    await dbSaveVaultInfo(result.jsonResponse);
    return result;
};

async function dbSaveVaultInfo(jsonResponse) {
    console.log("[api,js]dbSaveVaultInfo")
    const dbData = await readDB();
    const { is_use_PAYPAL_AUTH_ASSERTION, VAULT_MODEL, isVaultSave, isCard } =
        dbData.currentPageVaultSaveParams;
    //不需要存储vault info
    if (!isVaultSave) return;
    if (VAULT_MODEL === "returning") return;

    let customerID;
    let vaultID;

    let last_digits;
    let expiry;
    let brand;
    if (eval(isCard)) {
        last_digits = _.get(jsonResponse, "payment_source.card.last_digits");
        expiry = _.get(jsonResponse, "payment_source.card.expiry");
        brand = _.get(jsonResponse, "payment_source.card.brand");
        vaultID = _.get(
            jsonResponse,
            "payment_source.card.attributes.vault.id"
        );
        customerID = _.get(
            jsonResponse,
            "payment_source.card.attributes.vault.customer.id"
        );
    } else {
        vaultID = _.get(
            jsonResponse,
            "payment_source.paypal.attributes.vault.id"
        );
        customerID = _.get(
            jsonResponse,
            "payment_source.paypal.attributes.vault.customer.id"
        );
    }
    console.log("[api.js][dbSaveVaultInfo]")
    console.log("vaultID:", vaultID);
    console.log("customerID:", customerID);
    console.log("is_use_PAYPAL_AUTH_ASSERTION:",is_use_PAYPAL_AUTH_ASSERTION)
    if (eval(is_use_PAYPAL_AUTH_ASSERTION)) {
        //3rd party
        console.log("update 3rd party Vault info")
        await updateDB("3rdParty.customerID",customerID);
        await updateDB("3rdParty.vaultID",vaultID);
       
    } else {
        //first party
        console.log("update 1st party Vault info")
        await updateDB("1stParty.customerID",customerID);
        await updateDB("1stParty.vaultID",vaultID);
       
    }
    console.log("[api.js][dbSaveVaultInfo]Save complete")
}

async function handleResponse(response) {
    console.log("\x1B[41m%s\x1B[0m", "  [api.js] handleResponse #1");
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

//要使用export而不是export default
export {
    createOrder,
    captureOrder,
    generateClientToken,
    initClientIDSecret,
    generateToken,
    initVaultInfo,
    callPayPalAPI,
    createSetupTokenSavePayPal,
    createPaymentToken,
    createSetupTokenSaveCard,
};


// 这是commonJS的写法
// module.exports = { createOrder, captureOrder };
