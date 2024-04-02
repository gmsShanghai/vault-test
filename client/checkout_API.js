import { resultMessage } from "./commonFunction.js";

/**
 * 
 * @param {number} dimmer_id 
 * @param {boolean} state 
 */
function setDimmerLoaderState(dimmer_id, state){
    const dimmer_ele_id = "loader_dimmer_"+3;
    const loader_ele_id = "loader_"+3;
    const dimmer_ele = document.getElementById(dimmer_ele_id);
    const loader_ele = document.getElementById(loader_ele_id);
    if(state){
        dimmer_ele.classList.add("active");
        loader_ele.classList.remove("disabled");
    }else{
        dimmer_ele.classList.remove("active");
        loader_ele.classList.add("disabled");
    }
}

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

function initButtons() {
    const setup_token_for_card_btn = document.getElementById(
        "setup_token_for_card_btn"
    );
    setup_token_for_card_btn.addEventListener("click", async () => {
        const setup_token_for_card_requestBody = document.getElementById(
            "setup_token_for_card_requestBody"
        ).value;
        const response = await fetch("/vault_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                httpMethod: "POST",
                requestBody: setup_token_for_card_requestBody,
                endpoint: "/v3/vault/setup-tokens",
                getPathParam: "",
            }),
        });

        const response_json_object = await response.json();
        // debugger;
        const setup_token_for_card_responseBody = document.getElementById(
            "setup_token_for_card_responseBody"
        );
        const setup_token_id = document.getElementById("setup_token_id");
        setup_token_id.value = response_json_object.id;

        const customer_id_value = response_json_object.customer.id

        const customer_id = document.getElementById("customer_id");
        customer_id.value = customer_id_value;

        const customer_id_retrieve = document.getElementById("customer_id_retrieve");
        customer_id_retrieve.value = customer_id_value

        setup_token_for_card_responseBody.value = JSON.stringify(
            response_json_object,
            null,
            "  "
        );
        //-----------------------------
        const create_payment_token_requestBody = document.getElementById(
            "create_payment_token_requestBody"
        );
        const create_payment_token_requestBody_object = JSON.parse(
            create_payment_token_requestBody.value
        );
        create_payment_token_requestBody_object["payment_source"]["token"][
            "id"
        ] = response_json_object.id;
        create_payment_token_requestBody.value = JSON.stringify(
            create_payment_token_requestBody_object,
            null,
            "  "
        );
    });

    //------------------------------------------------------------
    const create_payment_token_btn = document.getElementById(
        "create_payment_token_btn"
    );
    create_payment_token_btn.addEventListener("click", async () => {
        const create_payment_token_requestBody = document.getElementById(
            "create_payment_token_requestBody"
        ).value;
        const response = await fetch("/vault_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                httpMethod: "POST",
                requestBody: create_payment_token_requestBody,
                endpoint: "/v3/vault/payment-tokens",
                getPathParam: "",
            }),
        });

        const response_json_object = await response.json();
        // debugger;
        const create_payment_token_responseBody = document.getElementById(
            "create_payment_token_responseBody"
        ); 
        const new_vault_id = response_json_object.id
        const vault_id_display = document.getElementById("vault_id_display");
        vault_id_display.value = new_vault_id;

        create_payment_token_responseBody.value = JSON.stringify(
            response_json_object,
            null,
            "  "
        );

        //更新Use saved payment token to Pay中的Vault_id
        const make_payment_requestBody = document.getElementById(
            "make_payment_requestBody"
        );
        let make_payment_requestBody_object = JSON.parse(make_payment_requestBody.value);
        // debugger;
        make_payment_requestBody_object.payment_source.card.vault_id = new_vault_id;
        make_payment_requestBody.value = JSON.stringify(make_payment_requestBody_object, null, "  ")
    });

    //------------------------------------------------------------
    const make_payment_btn = document.getElementById("make_payment_btn");
    make_payment_btn.addEventListener("click", async () => {
        setDimmerLoaderState(3,true)
        const make_payment_requestBody = document.getElementById(
            "make_payment_requestBody"
        ).value;
        const response = await fetch("/vault_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                httpMethod: "POST",
                requestBody: make_payment_requestBody,
                endpoint: "/v2/checkout/orders",
                getPathParam: "",
            }),
        });

        const response_json_object = await response.json();
        // debugger;
        const make_payment_responseBody = document.getElementById(
            "make_payment_responseBody"
        );

        make_payment_responseBody.value = JSON.stringify(
            response_json_object,
            null,
            "  "
        );
        setDimmerLoaderState(3,false)
    });

     //------------------------------------------------------------
     const retrieve_vault_id_btn = document.getElementById("retrieve_vault_id_btn");
     retrieve_vault_id_btn.addEventListener("click",async () => {
        const customer_id_retrieve = document.getElementById(
            "customer_id_retrieve"
        ).value;
        const response = await fetch("/vault_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                httpMethod: "GET",
                requestBody: "",
                endpoint: "/v3/vault/payment-tokens",
                getPathParam: `customer_id=${customer_id_retrieve}`,
            }),
        });
        const retrieve_vault_id_responseBody = document.getElementById(
            "retrieve_vault_id_responseBody"
        );
        const response_json_object = await response.json();
        retrieve_vault_id_responseBody.value = JSON.stringify(
            response_json_object,
            null,
            "  "
        );

     });

    //------------------------------------------------------------
    const setup_token_for_paypal_btn = document.getElementById("setup_token_for_paypal_btn");
    setup_token_for_paypal_btn.addEventListener("click",async () => {
      
        const response = await fetch("/vault_api_request_body", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        
        });
        const response_json_object = await response.json();
        const Setup_token_for_paypal_requestBody = response_json_object["Setup_token_for_paypal_requestBody"]
        const  setup_token_for_card_requestBody = document.getElementById(
            "setup_token_for_card_requestBody"
        );
        // debugger;
        setup_token_for_card_requestBody.value = JSON.stringify(
            JSON.parse(Setup_token_for_paypal_requestBody),
            null,
            "  "
        );

     });

}

// ###############################下方的代码为页面初始化###############################

function initDom() {
    // const useVaultCheckBox = document.getElementById("use_vault_checkbox");

    // const amount_input = document.getElementById("amount_input");
    // let amount = 100 + Math.floor(Math.random() * 100);
    // amount_input.value = amount;
    // debugger;
    fetch(`/vault_api_request_body`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const setup_token_for_card_requestBody = document.getElementById(
                "setup_token_for_card_requestBody"
            );
            setup_token_for_card_requestBody.value = JSON.stringify(
                JSON.parse(data["Setup_token_for_card_requestBody"]),
                null,
                "  "
            );
            // debugger;
            const create_payment_token_requestBody = document.getElementById(
                "create_payment_token_requestBody"
            );
            create_payment_token_requestBody.value = JSON.stringify(
                JSON.parse(data["Create_payment_token_for_card_requestBody"]),
                null,
                "  "
            );

            const make_payment_requestBody = document.getElementById(
                "make_payment_requestBody"
            );
            make_payment_requestBody.value = JSON.stringify(
                JSON.parse(data["Make_payment_for_card_requestBody"]),
                null,
                "  "
            );

        });
}

function init() {
    initDom();

    initButtons();
}

init();
