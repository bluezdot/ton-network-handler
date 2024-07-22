import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";
import {ADDRESS_TEST_1, ADDRESS_TEST_2} from "../const";
import {fromNano} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const address = await getTonAddress(ADDRESS_TEST_1);
    const balance = await client.getBalance(address);
    console.log('balance:', fromNano(balance));
    console.log('balance 2:', await client.getBalance(await getTonAddress(ADDRESS_TEST_2)));
    console.log(address.toRawString(), address.toString(), address.workChain, address.toRaw(), address.toStringBuffer());

    return 0;
}


main().then(r => console.log(r));