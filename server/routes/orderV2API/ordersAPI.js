import express from "express";
const router = express.Router();

import moment from "moment";
import { createOrder,captureOrder } from "../../api.js";

router.post("/orders", async (req, res) => {
    try {
        // use the cart information passed from the front-end to calculate the order amount detals
        const body = req.body;
        console.log(
            "\x1B[44m%s\x1B[0m",
            "\n##############[server.js]##############\n##############[/api/orders]##############"
        );
        console.log(
            "\x1B[33m",
            `[${moment().format(
                "yyyy-MM-DD | HH:mm:ss"
            )}]后台收到页面HTTP请求,打印请求体:`
        );
        console.log(JSON.stringify(body, null, 2));

        const { jsonResponse, httpStatusCode } = await createOrder(body);
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

router.post("/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        // const {type,party} = req.query;

        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        console.log(
            "\x1B[36m%s\x1B[0m",
            "\n<4>[server.js][/api/orders/:orderID/capture] #1\r\n"
        );
        console.log(
            "\x1B[32m%s\x1B[0m",
            `httpStatusCode:${httpStatusCode}\njsonResponse:\n`
        );
        console.log(
            "\x1B[3m%s\x1B[0m",
            JSON.stringify(jsonResponse, null, "  ")
        );

        
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to capture order." });
    }
});


export default router;
