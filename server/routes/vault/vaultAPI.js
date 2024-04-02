import express from "express";
const router = express.Router();
import config from "config";
import {
    createSetupTokenSavePayPal,
    createPaymentToken,
    createSetupTokenSaveCard,
} from "../../api.js";

import { dbStoreVaultACDC } from "../page/commonPageRenderFunction.js";

import { updateDB, readDB } from "../../../data/db.js";

router.get("/vault_api_request_body", async (req, res) => {
    console.log("正在请求初始化数据...");
    const response_body = {
        Setup_token_for_card_requestBody: config.get(
            "USE_API_VAULT.card.Setup_token_for_card"
        ),
        Create_payment_token_for_card_requestBody: config.get(
            "USE_API_VAULT.card.Create_payment_token_for_card"
        ),
        Make_payment_for_card_requestBody: config.get(
            "USE_API_VAULT.card.Make_payment_for_card"
        ),
        Setup_token_for_paypal_requestBody: config.get(
            "USE_API_VAULT.paypal.Setup_token"
        ),
    };
    console.log("初始化结束");
    res.send(response_body);
});

/**
 * By default, the setup token expires after 3 days. After the payer completes the approval flow, you can upgrade the setup token to a full payment method token by calling create-payment-tokens.
 */
router.get("/save_purchase_later_create_setup_token", async (req, res) => {
    console.log(
        "\x1B[44m%s\x1B[0m",
        "\n##############[server.js]##############\n##############[/save_purchase_later_create_setup_token]##############"
    );
    const type = req.query.type;
    console.log("type:", type);

    if (type === "paypal") {
        const { jsonResponse, httpStatusCode } =
            await createSetupTokenSavePayPal();
        console.log("request body:", JSON.stringify(jsonResponse, null, "  "));
        const vault_setup_token = jsonResponse.id;
        res.send(vault_setup_token);
    }

    if (type === "card") {
        const { jsonResponse, httpStatusCode } =
            await createSetupTokenSaveCard();
        console.log("request body:", JSON.stringify(jsonResponse, null, "  "));
        const vault_setup_token = jsonResponse.id;
        res.send(vault_setup_token);
    }
});

router.get("/save_purchase_later_create_payment_token", async (req, res) => {
    console.log(
        "\x1B[44m%s\x1B[0m",
        "\n##############[server.js]##############\n##############[/save_purchase_later_create_payment_token]##############"
    );
    const token_id = req.query.token_id;
    const { jsonResponse, httpStatusCode } = await createPaymentToken(token_id);
    console.log("request body:", JSON.stringify(jsonResponse, null, "  "));

    res.send(jsonResponse);
});

router.post("/dbStoreVaultACDC", async (req, res) => {
    const body = req.body;
    const isVaultSave = body.isVault;
    const isCard = body.isCard;
    dbStoreVaultACDC(isVaultSave, isCard);
});

router.get("/test_dbStoreVaultACDC", async (req, res) => {
    await updateDB("3rdParty.merchantID", "123");
    res.send("Success")
});

router.get("/test_getDB", async (req, res) => {
    const data = await readDB();
    console.log("data:", data);
    res.send(JSON.stringify(data));
});

export default router;
