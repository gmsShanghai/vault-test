

function initDom(){
    console.log("Do nothing")
}

//Displays PayPal buttons
/**
 * 注意!
 * 如果在vault的情况下, 那么无论这里是否有onApprove回调, 都会报错
 * 提了一个jira https://paypal.atlassian.net/browse/LI-37274
 */
paypal
    .Buttons({
        createVaultSetupToken: async () => {
            // Call your server API to generate a setup token
            // and return it here as a string
            const result = await fetch(
                "./save_purchase_later_create_setup_token?type=paypal"
            );
            const id = await result.text();
            // debugger;
            return id;
        },
        onApprove:  async (data) => {
            // Call your server API to generate a setup token
            // and return it here as a string
            // debugger;
            const token_id = data.vaultSetupToken;

            const result = await fetch(
                `./save_purchase_later_create_payment_token?token_id=${token_id}`
            );
            const jsonResult = await result.json();
            const result_area = document.getElementById("result_area");
            result_area.innerHTML = JSON.stringify(jsonResult,null,"  ")
          
        }
    })
    .render("#paypal-button-container")
    .then(initDom());


window.addEventListener("error", (event) => {
    console.log(event.error);
    console.log(event.message);
    // debugger;
});
