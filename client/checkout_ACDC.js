import {
    // createOrderCallback,
    onApproveCallback,
    print_console_ACDC_btn,
    resultMessage,
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

const createOrderRequest = () => {
    const isVault = document.querySelector("#save_2_vault").checked;
    const isWith3DS = document.querySelector("#with3DS").checked;
    // fetch("/api/orders", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },

    //     body: JSON.stringify({
    //         isCard: true,
    //         isVault: isVault,
    //     }),
    // });

    const order_amount = document.getElementById("amount_input").value;

    let payment_source = {};

    const requestBody = {
        intent: "CAPTURE",
        payment_source: payment_source,
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: order_amount,
                },
            },
        ],
    };

    //使用页面上方的PayPal按钮付款, 这个if else分支已经废弃, 其中的代码可能有错误
    //如果要使用SPB付款, 请使用 checkout_PayPal.ejs 和 checkout_PayPal.js中的内容
    // const usePayPal = document.querySelector("#usePayPal").checked;
    const usePayPal = false;
    if (usePayPal) {
        // payment_source = {
        //     paypal: {
        //         attributes: {
        //             customer: {
        //                 id: "customer_100",
        //             },
        //         },
        //         experience_context: {
        //             shipping_preference: "NO_SHIPPING",
        //             return_url: "https://example.com/returnUrl",
        //             cancel_url: "https://example.com/cancelUrl",
        //         },
        //     },
        // };
        // requestBody.payment_source = payment_source;
        // if (isVault) {
        //     requestBody.payment_source.paypal.attributes["vault"] = {
        //         store_in_vault: "ON_SUCCESS",
        //         usage_type: "MERCHANT",
        //     };
        // }
    } else {
        payment_source = {
            card: {
                attributes: {},
                experience_context: {
                    shipping_preference: "NO_SHIPPING",
                    return_url: "https://example.com/returnUrl",
                    cancel_url: "https://example.com/cancelUrl",
                },
            },
        };
        requestBody.payment_source = payment_source;
        if (isVault) {
            requestBody.payment_source.card.attributes["vault"] = {
                store_in_vault: "ON_SUCCESS",
            };
        }
        if (isWith3DS) {
            requestBody.payment_source.card.attributes["verification"] = {
                method: "SCA_ALWAYS",
            };
        }
        const CUSTOMER_ID = document.getElementById("CUSTOMER_ID");
        if (CUSTOMER_ID.value) {
            requestBody.payment_source.card.attributes["customer"] = {
                id: CUSTOMER_ID.value,
            };
        }
    }

    return requestBody;
};

async function createOrderCallback(data) {
    return await createOrderCallbackHandler(createOrderRequest(), data);
}

//###############################################################

function initPayPal() {
    window.paypal
        .Buttons({
            createOrder: () => {
                window.alert(
                    "Do not use Smart Payment Button to PayPal in ACDC page, the button is only for display usage."
                );
            },
        })
        .render("#paypal-button-container");
}

function initCards() {
    const cardField = window.paypal.CardFields({
        createOrder: createOrderCallback,
        onApprove: onApproveCallback,
    });

    let nameField;
    let numberField;
    let cvvField;
    let expiryField;

    let nameField_value;

    // Render each field after checking for eligibility
    if (cardField.isEligible()) {
        nameField = cardField.NameField({
            inputEvents: {
                onChange: (data) => {
                    // debugger;
                    // nameField_value = data;
                },
            },
        });
        nameField.render("#card-name-field-container");

        numberField = cardField.NumberField();
        numberField.render("#card-number-field-container");

        cvvField = cardField.CVVField();
        cvvField.render("#card-cvv-field-container");

        expiryField = cardField.ExpiryField();
        expiryField.render("#card-expiry-field-container");

        // Add click listener to submit button and call the submit function on the CardField component
        document
            .getElementById("multi-card-field-button")
            .addEventListener("click", () => {
                print_console_ACDC_btn();
                cardField.submit().catch((error) => {
                    resultMessage(
                        `Sorry, your transaction could not be processed...<br><br>${error}`,
                        "error"
                    );
                });
            });
    } else {
        // Hides card fields if the merchant isn't eligible
        document.querySelector("#card-form").style = "display: none";
    }
}

// ###############################下方的代码为页面初始化###############################

function initDom() {
    const first_time_result_area = document.getElementById(
        "first_time_result_area"
    );
    first_time_result_area.style.visibility = "hidden";
    const isVault = document.querySelector("#save_2_vault");
    isVault.addEventListener("click", (event) => {
        const first_time_result_area = document.getElementById(
            "first_time_result_area"
        );

        if (event.target.checked) {
            first_time_result_area.style.visibility = "visible";
        } else {
            first_time_result_area.style.visibility = "hidden";
        }
    });
}

function init() {
    initDom();
    initPayPal();
    initCards();
}

init();
