import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import config from "config";

import OrderV2API from "./routes/OrderV2API/ordersAPI.js";
import vaultAPI from "./routes/vault/vaultAPI.js";
import pageVaultWithAPI from "./routes/page/vault_with_api.js";
import pageVaultWithOutPurchase from "./routes/page/vault_without_purchase.js";
import pageVaultWithPurchase from "./routes/page/vault_with_purchase.js";
import { createLowDBinstance } from "../data/db.js";

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

app.get("/", async (req, res) => {
    try {
        res.render("index");
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

app.listen(PORT, () => {
    console.log(`Node server listening at http://localhost:${PORT}/`);
});
