import express from "express";
const router = express.Router();

import { callPayPalAPI } from "../../api.js";
import { getJsSDKEjsRenderParam } from "./commonPageRenderFunction.js";

router.post("/vault_api", async (req, res) => {
    try {
        const body = req.body;
        console.log(
            "\x1B[44m%s\x1B[0m",
            "\n##############[server.js]##############\n##############[/vault_api]##############"
        );
        console.log(
            "\x1B[33m",
            `[${moment().format(
                "yyyy-MM-DD | HH:mm:ss"
            )}]后台收到页面HTTP请求,打印请求体:`
        );
        console.log(JSON.stringify(body, null, 2));
        const httpMethod = body.httpMethod;
        const requestBody = body.requestBody
            ? JSON.parse(body.requestBody)
            : "";
        const endpoint = body.endpoint;
        const getPathParam = body.getPathParam;
        console.log("Request Body:", requestBody);
        const { jsonResponse, httpStatusCode } = await callPayPalAPI(
            httpMethod,
            requestBody,
            endpoint,
            getPathParam
        );
        console.log(
            "\x1B[36m%s\x1B[0m",
            "<3>[server.js][/api/orders] #1\r\nhttpStatusCode:",
            httpStatusCode,
            "\r\njsonResponse:"
        );
        console.log(
            "\x1B[31m%s\x1B[0m",
            JSON.stringify(jsonResponse, null, "  ")
        );

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
});

router.get("/checkout_API", async (req, res) => {
    const vault_model = req.query.model;
    const is_use_PAYPAL_AUTH_ASSERTION = req.query.is_use_PAYPAL_AUTH_ASSERTION;
    console.log("\x1B[44m%s\x1B[0m", "[Route /checkout_API Matched!]");
    try {
        res.render(
            "checkout_API",
            await getJsSDKEjsRenderParam(
                vault_model,
                eval(is_use_PAYPAL_AUTH_ASSERTION)
            )
        );
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
