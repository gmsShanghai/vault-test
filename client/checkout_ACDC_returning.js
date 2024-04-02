import {
    print_console_ACDC_btn,
    resultMessage,
} from "./commonFunction.js";

let useVaultCheckBox;

const VAULT_MODEL = document
    .getElementById("VAULT_INFO")
    .getAttribute("VAULT_MODEL");

//merchantID也就是payee已经不起作用了, 被PayPal-Auth-Assertion替代, 在express服务器端实现
const TEST_MERCHANT_ID = document
    .getElementById("VAULT_INFO")
    .getAttribute("TEST_MERCHANT_ID");

const CARD_VAULT_INFO = document
    .getElementById("VAULT_INFO")
    .getAttribute("CARD_VAULT_INFO");
console.log(CARD_VAULT_INFO);

const createOrderRequest = () => {
    const order_amount = document.getElementById("amount_input").value;
    const vault_id = document.getElementById("vault_id_input").value;
    const requestBody = {
        intent: "CAPTURE",
        payment_source: {
            card: {
                vault_id: vault_id,
                experience_context: {
                    shipping_preference: "NO_SHIPPING",
                    return_url: "https://example.com/returnUrl",
                    cancel_url: "https://example.com/cancelUrl",
                },
            },
        },
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: order_amount,
                },
            },
        ],
    };

    return requestBody;
};


//###############################################################

// 去掉PayPal按钮. 体验不好
// function initPayPal() {
//     window.paypal
//         .Buttons({
//             createOrder: () => {
//                 window.alert(
//                     "Do not use Smart Payment Button to PayPal in ACDC page, the button is only for display usage."
//                 );
//             },
//         })
//         .render("#paypal-button-container");
// }

function initCards() {
    const submitBtn = document.getElementById("submit");
    submitBtn.addEventListener("click", async () => {
        print_console_ACDC_btn()
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(createOrderRequest()),
        });

        const transaction = await response.json();
        resultMessage(
            `Transaction ${transaction.status}: ${transaction.id}<br><br>See Server Log for all available details`
        ,transaction);
    });
}

// ###############################下方的代码为页面初始化###############################

function initDom() {
    useVaultCheckBox = document.getElementById("use_vault_checkbox");

    const amount_input = document.getElementById("amount_input");
    let amount = 100 + Math.floor(Math.random() * 100);
    amount_input.value = amount;

    fetch(`/card_vault_info`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // debugger;
            const vaultIDInputBox = document.getElementById("vault_id_input");
            const customerIDSpan = document.getElementById("CUSTOMER_ID");
            const VAULT_ID = data.vault.id;
            const CUSTOMER_ID = data.vault.customer.id;

            if (VAULT_MODEL === "returning") {
                vaultIDInputBox.value = VAULT_ID;
                useVaultCheckBox.checked = true;
                useVaultCheckBox.disabled = true;
                customerIDSpan.value = CUSTOMER_ID;
            }
            document.getElementById("last_digit").innerHTML =
                data["last_digits"];
            document.getElementById("expiry_date").innerHTML = data["expiry"];
            document.getElementById("card_brand").innerHTML = data["brand"];
            document.getElementById("card_type").innerHTML = data["type"];
        });
}

function init() {
    initDom();

    // initPayPal();

    initCards();
}

init();
