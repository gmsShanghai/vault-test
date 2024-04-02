async function createOrderCallback() {
    try {
        console.log("[Create Order API] - Called!");
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                application_context: {
                    return_url: "https://www.bing.com",
                },
                intent: "CAPTURE",
                shipping_preference: "GET_FROM_FILE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "EUR",
                            value: 100,
                        },
                    },
                ],
            }),
        });

        const orderData = await response.json();

        if (orderData.id) {
            console.log("Create Order Success: orderID:", orderData.id);
            return orderData.id;
        } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(error);
        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
    }
}

async function onApproveCallback(data, actions) {
    // debugger;
    console.log("[checkout.js] onApproveCallback #1");
    try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const orderData = await response.json();

        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
        const errorDetail = orderData?.details?.[0];

        // this actions.restart() behavior only applies to the Buttons component
        if (
            errorDetail?.issue === "INSTRUMENT_DECLINED" &&
            !data.card &&
            actions
        ) {
            // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
            return actions.restart();
        } else if (
            errorDetail ||
            !transaction ||
            transaction.status === "DECLINED"
        ) {
            // (2) Other non-recoverable errors -> Show a failure message
            let errorMessage;
            if (transaction) {
                errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
            } else if (errorDetail) {
                errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
            } else {
                errorMessage = JSON.stringify(orderData);
            }

            throw new Error(errorMessage);
        } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to another URL:  actions.redirect('thank_you.html');
            resultMessage(
                `Order ${transaction.status}: ${transaction.id}<br><br>See console for all available details`,
                orderData
            );
            console.log(
                "Capture result",
                orderData,
                JSON.stringify(orderData, null, 2)
            );
        }
    } catch (error) {
        console.error(error);
        resultMessage(
            `Sorry, your transaction could not be processed...<br><br>${error}`,
            "error"
        );
    }
}

/**
 * 让网页端在ACDC模式下, 打印一个好看的Logo
 */
function print_console_ACDC_btn() {
    console.log(
        `%c
          _____ _____   _____  
    /\\   / ____|  __ \\ / ____| 
   /  \\ | |    | |  | | |      
  / /\\ \\| |    | |  | | |      
 / ____ \\ |____| |__| | |____  
/_/    \\_\\_____|_____/ \\_____| 
  `,
        "color:blue"
    );
}

async function createOrderCallbackHandler(requestBody, data) {
    console.log("[checkout.js] createOrderCallback #1");
    console.log(
        "[checkout.js] createOrderCallback #2 | PaymentSource:",
        data.paymentSource
    );
    try {
        console.log(
            "[checkout.js] createOrderCallback #3 | [Create Order API] - Called! (与后台服务器通讯...)"
        );
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            // body: JSON.stringify(createOrderRequest1st),
            body: JSON.stringify(requestBody),
        });

        const orderData = await response.json();

        //针对于vault+returning buyer的情况
        if (orderData.status === "COMPLETED") {
            resultMessage(
                `Order ${orderData.status}: ${orderData.id}<br><br>See console for all available details`,
                orderData
            );
            return null;
        }

        if (orderData.id) {
            console.log(
                "[checkout.js] createOrderCallback #4 | Create Order Success: orderID:",
                orderData.id
            );
            return orderData.id;
        } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(error);
        resultMessage(
            `Could not initiate PayPal Checkout...<br><br>${error}`,
            "error"
        );
    }
}


/**
 * 在网页端输出一些交易号或者错误信息
 * @param {string} message
 */
function resultMessage(message, transactionObject) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
    if (transactionObject === "error") return;
    // debugger;
    printCompleteTransactionKeyInfo(transactionObject);
}

/**
 * 给1st time buyer的交易在完成后展示关键信息到页面上; 只有1st time buyer 在capture之后才会走到这里, 不用考虑vault的在create order中完成的情况
 * @param {object} transactionObject
 */

function printCompleteTransactionKeyInfo(transactionObject) {
    const save2Vault = document.querySelector("#save_2_vault");
    if (save2Vault && save2Vault.checked === false) return;

    const result_txn_id = document.getElementById("result_txn_id");
    const result_customer_id = document.getElementById("result_customer_id");
    const result_vault_id = document.getElementById("result_vault_id");
    // return;
    if (
        result_txn_id != null &&
        result_customer_id != null &&
        result_vault_id != null
    ) {
        if (transactionObject.status === "COMPLETED") {
            if (transactionObject["payment_source"].hasOwnProperty("paypal")) {
                result_txn_id.value =
                    transactionObject["purchase_units"][0]["payments"][
                        "captures"
                    ][0]["id"];
                result_customer_id.value =
                    transactionObject["payment_source"]["paypal"]["attributes"][
                        "vault"
                    ]["customer"]["id"];
                result_vault_id.value =
                    transactionObject["payment_source"]["paypal"]["attributes"][
                        "vault"
                    ]["id"];
            }
        }
        if (transactionObject["payment_source"].hasOwnProperty("card")) {
            result_txn_id.value =
                transactionObject["purchase_units"][0]["payments"][
                    "captures"
                ][0]["id"];
            result_customer_id.value =
                transactionObject["payment_source"]["card"]["attributes"][
                    "vault"
                ]["customer"]["id"];
            result_vault_id.value =
                transactionObject["payment_source"]["card"]["attributes"][
                    "vault"
                ]["id"];
        }
    }
}

export {
    createOrderCallback,
    onApproveCallback,
    print_console_ACDC_btn,
  
    resultMessage,
    createOrderCallbackHandler,
    printCompleteTransactionKeyInfo,
};
// module.exports = {
//     createOrderCallback,
//     onApproveCallback,
//     print_console_ACDC_btn,
// };
