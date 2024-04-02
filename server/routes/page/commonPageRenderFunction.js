import {
    generateClientToken,
    initClientIDSecret,
    generateToken,
    initVaultInfo,
} from "../../api.js";
import config from "config";
import _ from "lodash";
import { readDB,updateDB } from "../../../data/db.js";

const PAYPAL_TEST_CARD_NO = config.get("testCard.PAYPAL_TEST_CARD_NO");
const PAYPAL_TEST_CARD_DATE = config.get("testCard.PAYPAL_TEST_CARD_DATE");
const PAYPAL_TEST_CARD_CVV = config.get("testCard.PAYPAL_TEST_CARD_CVV");

async function dbStoreVault(
    vault_model,
    is_use_PAYPAL_AUTH_ASSERTION,
    isVaultSave = false,
    isCard = false
) {
    console.log("[CommonPageRenderFunction.dbStoreVault]Start")
    console.log("is_use_PAYPAL_AUTH_ASSERTION:",is_use_PAYPAL_AUTH_ASSERTION)
    console.log("vault_model:",vault_model)
    console.log("isVaultSave:",isVaultSave)
    console.log("isCard:",isCard)

    await updateDB("currentPageVaultSaveParams.is_use_PAYPAL_AUTH_ASSERTION",eval(is_use_PAYPAL_AUTH_ASSERTION));

    await updateDB("currentPageVaultSaveParams.VAULT_MODEL",vault_model);
    
    isVaultSave && await updateDB("currentPageVaultSaveParams.isVaultSave",isVaultSave);

    isCard && await updateDB("currentPageVaultSaveParams.isCard",isCard);
    console.log("[CommonPageRenderFunction.dbStoreVault]End")
}

async function dbStoreVaultACDC(isVaultSave, isCard) {
    await updateDB("currentPageVaultSaveParams.isVaultSave",isVaultSave);
    await updateDB("currentPageVaultSaveParams.isCard",isCard);
   
}

async function getJsSDKEjsRenderParam(
    vault_model,
    is_use_PAYPAL_AUTH_ASSERTION
) {
    const data = await readDB();    

    let TEST_MERCHANT_ID = _.get(data, "3rdParty.merchantID");

    let PAYPAL_CLIENT_ID;
    let PAYPAL_CLIENT_SECRET;

    if (eval(is_use_PAYPAL_AUTH_ASSERTION)) {
        //自用3rd Party US Old
        // PAYPAL_CLIENT_ID = config.get(
        //     "env.sandbox.myApp.thirdParty.US_Old.clientID"
        // );
        // PAYPAL_CLIENT_SECRET = config.get(
        //     "env.sandbox.myApp.thirdParty.US_Old.secret"
        // );

        //自用3rd Party US New
        PAYPAL_CLIENT_ID = config.get(
            "env.sandbox.myApp.thirdParty.US_New.clientID"
        );
        PAYPAL_CLIENT_SECRET = config.get(
            "env.sandbox.myApp.thirdParty.US_New.secret"
        );

        //EU 德国
        // PAYPAL_CLIENT_ID = config.get("env.sandbox.EUTeam.thirdParty.DE.clientID");
        // PAYPAL_CLIENT_SECRET = config.get(
        //     "env.sandbox.EUTeam.thirdParty.DE.secret"
        // );
    } else {
        PAYPAL_CLIENT_ID = config.get(
            "env.sandbox.myApp.firstParty.US.clientID"
        );
        PAYPAL_CLIENT_SECRET = config.get(
            "env.sandbox.myApp.firstParty.US.secret"
        );
    }

    initClientIDSecret(
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET,
        TEST_MERCHANT_ID,
        is_use_PAYPAL_AUTH_ASSERTION
    );

    let CUSTOMER_ID;
    let VAULT_ID;

    if (is_use_PAYPAL_AUTH_ASSERTION) {
        CUSTOMER_ID = _.get(data, "3rdParty.customerID");
        VAULT_ID = _.get(data, "3rdParty.vaultID");
    } else {
        CUSTOMER_ID = _.get(data, "1stParty.customerID");
        VAULT_ID = _.get(data, "1stParty.vaultID");
    }
    console.log("VAULT_ID get from DB:", VAULT_ID);
    console.log("CUSTOMER_ID get from DB:", CUSTOMER_ID);

    initVaultInfo(vault_model, VAULT_ID, CUSTOMER_ID);

    //****************************************** */
    //[2024-03-21 我怀疑这个API过时了, A deprecated API is suspected]
    // 不过经过检查, 也没有ejs文件使用了这个值
    // 没有注释掉这句话是为了防止留个空会报错
    let clientToken = await generateClientToken();
    //****************************************** */

    let { id_token } = await generateToken();
    let result = {
        clientId: PAYPAL_CLIENT_ID,
        clientToken: clientToken,
        PAYPAL_TEST_CARD_NO: PAYPAL_TEST_CARD_NO,
        PAYPAL_TEST_CARD_DATE: PAYPAL_TEST_CARD_DATE,
        PAYPAL_TEST_CARD_CVV: PAYPAL_TEST_CARD_CVV,
        VAULT_MODEL: vault_model,
        id_token,
        CUSTOMER_ID,
        VAULT_ID,
        TEST_MERCHANT_ID,
        is_use_PAYPAL_AUTH_ASSERTION,
    };

    return result;
}

export { getJsSDKEjsRenderParam, dbStoreVault, dbStoreVaultACDC };
