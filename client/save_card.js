import { print_console_ACDC_btn } from "./commonFunction.js";

function init() {
    initCards();
}

function initCards() {
    const cardField = window.paypal.CardFields({
        style: {
            input: {
                color: "#454242",
            },
            ".invalid": {
                color: "purple",
            },
            ":hover": {
                color: "orange",
            },
            ".purple": {
                color: "purple",
            },
        },
        createVaultSetupToken: async () => {
            // Call your server API to generate a setup token
            // and return it here as a string
            const result = await fetch(
                "./save_purchase_later_create_setup_token?type=card"
            );
            const id = await result.text();
            debugger;
            return id;
        },
        onApprove: async (data) => {
            // Call your server API to generate a setup token
            // and return it here as a string
            debugger;
            const token_id = data.vaultSetupToken;

            const result = await fetch(
                `./save_purchase_later_create_payment_token?token_id=${token_id}`
            );
            const jsonResult = await result.json();
            const result_area = document.getElementById("result_area");
            result_area.innerHTML = JSON.stringify(jsonResult, null, "  ");
        },
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
                cardField
                    .submit()
                    .then(() => {
                        debugger;
                        console.log("submit was successful");
                    })
                    .catch((error) => {
                        const result_area =
                            document.getElementById("result_area");
                        result_area.innerHTML = error;
                    });
            });
    } else {
        // Hides card fields if the merchant isn't eligible
        document.querySelector("#card-form").style = "display: none";
    }
}

init();
