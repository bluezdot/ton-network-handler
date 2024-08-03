import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../utils/base-utils";
import {ADDRESS_TEST_1, MNEMONIC} from "../utils/const";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient();

    // sendMessage
    // sendExternalMessage

    console.log("Client:", await client.getMasterchainInfo());

    return 0;
}


main().then(r => console.log(r));