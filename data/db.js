import { join, dirname } from "path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";
import _ from "lodash";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, "./data.json");
console.log("data path --->", file);

let dbInstance;

const createLowDBinstance = () => {
    const defaultData = {
        "3rdParty": {
            merchantID: "CMHAMMNAXCMGA",
            customerID: "",
            vaultID: "",
        },
        "1stParty": {
            merchantID: "",
            customerID: "",
            vaultID: "",
        },
        currentPageVaultSaveParams: {
            is_use_PAYPAL_AUTH_ASSERTION: "",
            VAULT_MODEL: "",
            isVaultSave: "",
            isCard: "",
        },
        appInfo: {
            "3rdParty": {
                tagName: "",
            },
            "1stParty": {
                tagName: "",
            },
        },
    };
    const adapter = new JSONFile(file);
    dbInstance = new Low(adapter, defaultData);
};

const updateDB = async (key, value) => {
    await dbInstance.update((data) => {
        _.set(data, key, value);
    });
};

const readDB = async () => {
    await dbInstance.read();
    const data = dbInstance.data;
    return data;
};

export { createLowDBinstance, updateDB, readDB };
