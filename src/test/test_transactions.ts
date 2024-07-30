import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";
import {ADDRESS_TEST_1, ADDRESS_TEST_2, MNEMONIC} from "../const";
import {TonClient} from "@ton/ton";
import { useTonConnectUI } from "@tonconnect/ui-react";

// 2.1. Create transaction
async function main () {
    const [tonConnectUi] = useTonConnectUI();
    // const client = await getTonClient(true);
    const client = new TonClient({endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'})
    const address = await getTonAddress(ADDRESS_TEST_2);
    console.log(await client.getBalance(address))
    const txs = await client.getTransactions(address, {limit: 1})
    // console.log("Contract transactions:", txs[0]);

    return 0;
}


main().then(r => console.log(r));