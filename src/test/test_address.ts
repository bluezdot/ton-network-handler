import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";
import {ADDRESS_TEST_1, ADDRESS_TEST_2} from "../const";
import {beginCell, fromNano, storeMessage, TonClient} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    // const client = await getTonClient();
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC'})

    const address = await getTonAddress(ADDRESS_TEST_1);
    const balance = await client.getBalance(address);
    console.log('balance 1:', fromNano(balance));
    console.log('balance 2:', await client.getBalance(await getTonAddress(ADDRESS_TEST_2)));
    console.log(address.toRawString(), address.toString(), address.workChain, address.toRaw(), address.toStringBuffer());

    const state = await client.getContractState(address);
    console.log('[i] State', state);
    if (!state || !state.lastTransaction) {
        console.log('[i] No state')
    } else {
        const { hash: lastHash, lt: lastLt } = state.lastTransaction;
        const lastTx = await client.getTransaction(address, lastLt, lastHash);
        console.log('[i] lastTx', lastTx);
        if (lastTx && lastTx.inMessage) {
            const msgCell = beginCell().store(storeMessage(lastTx.inMessage)).endCell();
            const inMsgHash = msgCell.hash().toString('base64');
            console.log('[i] InMsgHash', inMsgHash);
        }
    }

    return 0;
}


main().then(r => console.log(r));