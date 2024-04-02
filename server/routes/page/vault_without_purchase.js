import express from "express";
const router = express.Router();

import {
    getJsSDKEjsRenderParam,
    dbStoreVault,
} from "./commonPageRenderFunction.js";

router.get("/save_paypal", async (req, res) => {
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log("\x1B[44m%s\x1B[0m", "[Route /save_paypal Matched!]");
    dbStoreVault(vault_model, is_use_PAYPAL_AUTH_ASSERTION, true, false);

    try {
        if (vault_model === "firstTime") {
            res.render(
                "save_paypal",
                await getJsSDKEjsRenderParam(
                    vault_model,
                    eval(is_use_PAYPAL_AUTH_ASSERTION)
                )
            );
        }
        if (vault_model === "returning") {
            res.render(
                "checkout_PayPal",
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

router.get("/save_card", async (req, res) => {
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log("\x1B[44m%s\x1B[0m", "[Route /save_card Matched!]");
    dbStoreVault(vault_model, is_use_PAYPAL_AUTH_ASSERTION, true, true);

    try {
        if (vault_model === "firstTime") {
            res.render(
                "save_card",
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

export default router;
