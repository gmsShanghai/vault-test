import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import config from "config";

import OrderV2API from "./routes/OrderV2API/ordersAPI.js";
import vaultAPI from "./routes/vault/vaultAPI.js";
import pageVaultWithAPI from "./routes/page/vault_with_api.js";
import pageVaultWithOutPurchase from "./routes/page/vault_without_purchase.js";
import pageVaultWithPurchase from "./routes/page/vault_with_purchase.js";
import { createLowDBinstance, readDB,updateDB } from "../data/db.js";

import _ from "lodash";

//Init Database
createLowDBinstance();

const { PORT, MY_TEST_FLAG } = process.env;

const app = express();

// app.use(bodyParser.json());

// parse post params sent in body in json format
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./server/views");

// host static files
app.use(express.static("client"));

app.use("/api", OrderV2API);
app.use("", vaultAPI);
app.use("", pageVaultWithAPI);
app.use("", pageVaultWithOutPurchase);
app.use("", pageVaultWithPurchase);

function printObjectToTerminal(object) {
    console.log("\r\n", JSON.stringify(object, null, "  "));
}
app.get("/", async (req, res) => {
    try {
        const data = await readDB();
        let TEST_MERCHANT_ID = _.get(data, "3rdParty.merchantID");
        printObjectToTerminal(data)
        printObjectToTerminal(TEST_MERCHANT_ID)


        const clientIDs = config.get("env.sandbox.myApp");
        // printObjectToTerminal(clientIDs);
        const thirdPartyClientIDs = Object.keys(clientIDs.thirdParty).map(
            (thirdPartyClientName) => {
                // console.log("thirdPartyClientName:", thirdPartyClientName);
                return {
                    AppNameTag: thirdPartyClientName,
                    clientID:
                        clientIDs["thirdParty"][thirdPartyClientName][
                            "clientID"
                        ],
                    secret: clientIDs["thirdParty"][thirdPartyClientName][
                        "secret"
                    ]
                };
            }
        );
        // printObjectToTerminal(thirdPartyClientIDs);

        const firstPartyClientIDs = Object.keys(clientIDs["firstParty"]).map(
            (firstPartyClientName) => {
                return {
                    AppNameTag: firstPartyClientName,
                    clientID:
                        clientIDs["firstParty"][firstPartyClientName][
                            "clientID"
                        ],
                    secret: clientIDs["firstParty"][firstPartyClientName][
                        "secret"
                    ],
                };
            }
        );

        // printObjectToTerminal(firstPartyClientIDs);

        res.render("index", {
            clientIDConfigs: {
                thirdPartyClientIDs,
                firstPartyClientIDs,
                TEST_MERCHANT_ID
            },
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/card_vault_info", async (req, res) => {
    const CARD_VAULT_INFO = config.get(
        "env.sandbox.vault_info.Card.petro_test.3rdParty"
    );
    console.log("CARD_VAULT_INFO:", CARD_VAULT_INFO);
    res.send(CARD_VAULT_INFO);
});

app.post("/write_client_credentials",async (req, res) => {
    const {isThirdParty, AppNameTag} = req.body;     
    const data = await readDB();
    printObjectToTerminal(data);
    printObjectToTerminal(isThirdParty);
    printObjectToTerminal(AppNameTag);
    if(eval(isThirdParty)){
        await updateDB("appInfo.3rdParty.tagName", AppNameTag);
    }else{
        await updateDB("appInfo.1stParty.tagName", AppNameTag);
    }
})

app.listen(PORT, () => {
    console.log(`Node server listening at http://localhost:${PORT}/`);
});
