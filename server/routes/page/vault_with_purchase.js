import express from "express";
const router = express.Router();

import {
    getJsSDKEjsRenderParam,
    dbStoreVault,
} from "./commonPageRenderFunction.js";

router.get("/checkout_ACDC", async (req, res) => {
    console.log("\r\n\r\n")
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log("\x1B[44m%s\x1B[0m", "[Route /checkout_ACDC Matched!]");
    await dbStoreVault(vault_model, is_use_PAYPAL_AUTH_ASSERTION, false, true);
    try {
        if (vault_model === "firstTime") {
            res.render(
                "checkout_ACDC",
                await getJsSDKEjsRenderParam(
                    vault_model,
                    eval(is_use_PAYPAL_AUTH_ASSERTION)
                )
            );
        }
        if (vault_model === "returning") {
            res.render(
                "checkout_ACDC_returning",
                await getJsSDKEjsRenderParam(
                    vault_model,
                    eval(is_use_PAYPAL_AUTH_ASSERTION)
                )
            );
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/checkout_PayPal", async (req, res) => {
    console.log("\r\n\r\n")
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log("\x1B[44m%s\x1B[0m", "[Route /checkout_PayPal Matched!]");
    await dbStoreVault(vault_model, is_use_PAYPAL_AUTH_ASSERTION, true, false);
    try {
        res.render(
            "checkout_PayPal",
            await getJsSDKEjsRenderParam(
                vault_model,
                eval(is_use_PAYPAL_AUTH_ASSERTION)
            )
        );
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/vault_common_part_init", async (req, res) => {
    console.log("\r\n");
    console.log(
        "\x1B[46m%s\x1B[0m",
        "[Route /vault_common_part_init >>> Matched!]Re-requesting Vault related data, 重新请求vault相关数据"
    );
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log(
        "vault_common_part_init  |  vault_model:",
        vault_model,
        "is_use_PAYPAL_AUTH_ASSERTION:",
        is_use_PAYPAL_AUTH_ASSERTION
    );
    const result = await getJsSDKEjsRenderParam(
        vault_model,
        eval(is_use_PAYPAL_AUTH_ASSERTION)
    );
    res.send(result);
});

export default router;
