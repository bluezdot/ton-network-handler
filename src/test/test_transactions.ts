import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";
import {ADDRESS_TEST_1, MNEMONIC} from "../const";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const address = await getTonAddress(ADDRESS_TEST_1);
    const txs = await client.getTransactions(address, {limit: 10})
    console.log("Contract transactions:", txs[0]);

    return 0;
}


main().then(r => console.log(r));