import {
    // createOrderCallback,
    onApproveCallback,
    createOrderCallbackHandler,
} from "./commonFunction.js";

let useVaultCheckBox;
let vaultIDInputBox;
let VAULT_ID;
const VAULT_MODEL = document
    .getElementById("VAULT_INFO")
    .getAttribute("VAULT_MODEL");

//merchantID也就是payee已经不起作用了, 被PayPal-Auth-Assertion替代, 在express服务器端实现
const TEST_MERCHANT_ID = document
    .getElementById("VAULT_INFO")
    .getAttribute("TEST_MERCHANT_ID");

async function createOrderCallback(data) {
    const order_amount = document.getElementById("amount_input").value;

    let requestBody = {
        intent: "CAPTURE",
        payment_source: {
            paypal: {},
        },
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: order_amount,
                },

                shipping: {
                    type: "SHIPPING",
                    method: "DHL",
                    name: {
                        full_name: "Fritz von Berlichingen",
                    },
                    address: {
                        address_line_1: "Albert-Einstein-Ring 2-6",
                        address_line_2: "PayPal",
                        postal_code: "14532",
                        admin_area_2: "Kleinmachnow",
                        country_code: "US",
                        admin_area_1: "Brandenburg",
                    },
                },
            },
        ],
    };
    if (!useVaultCheckBox.checked) {
        //First Time
        requestBody["payment_source"]["paypal"]["attributes"] = {
            vault: {
                store_in_vault: "ON_SUCCESS",
                usage_type: "MERCHANT",

                // usage_type: "PLATFORM" =>仅在CIB中使用
                // usage_type: "PLATFORM",
                customer_type: "CONSUMER",
            },
        };

        requestBody["payment_source"]["paypal"]["experience_context"] = {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "EXAMPLE INC",
            locale: "en-US",
            landing_page: "LOGIN",
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            return_url: "https://example.com/returnUrl",
            cancel_url: "https://example.com/cancelUrl",
        };

        // 不要使用payee, 使用auth比较好
        // requestBody["purchase_units"][0]["payee"] = {
        //     merchant_id: "TEST_MERCHANT_ID",
        // };
    } else {
        //Returning buyer
        VAULT_ID = vaultIDInputBox.value;
        requestBody["payment_source"]["paypal"]["vault_id"] = VAULT_ID;
    }

    return await createOrderCallbackHandler(requestBody, data);
}

// ###############################下方的代码为页面初始化###############################

function initDom() {
    useVaultCheckBox = document.getElementById("use_vault_checkbox");
    vaultIDInputBox = document.getElementById("vault_id_input");
    VAULT_ID = document.getElementById("VAULT_INFO").getAttribute("VAULT_ID");
    if (VAULT_MODEL === "firstTime") {
        useVaultCheckBox.checked = false;
        vaultIDInputBox.value = "";
    }
    if (VAULT_MODEL === "returning") {
        vaultIDInputBox.value = VAULT_ID;
        useVaultCheckBox.checked = true;
    }

}

//Displays PayPal buttons
/**
 * 注意!
 * 如果在vault的情况下, 那么无论这里是否有onApprove回调, 都会报错
 * 提了一个jira https://paypal.atlassian.net/browse/LI-37274
 */
paypal
    .Buttons({
        createOrder: createOrderCallback,
        onApprove: onApproveCallback,
    })
    .render("#paypal-button-container")
    .then(initDom());

// script标签中的 crossorigin="anonymous" 不起作用
window.addEventListener("error", (event) => {
    console.log(event.error);
    console.log(event.message);
    // debugger;
});
