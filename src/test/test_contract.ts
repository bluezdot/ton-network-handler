import {getTonClient, getWalletFromMnemonic} from "../utils/base-utils";
import {MNEMONIC} from "../utils/const";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const wallet = await getWalletFromMnemonic(MNEMONIC);
    const contract = client.open(wallet);
    console.log("Contract:", contract);
    console.log("Contract:", await contract.getSeqno());

    return 0;
}


main().then(r => console.log(r));