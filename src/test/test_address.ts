import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const address = await getTonAddress('UQBbamQ89OMv8DkcR2RW_tW9sX7xClXLt8KYDHbUqtB4dbz1');
    const balance = await client.getBalance(address);
    console.log(address.toRawString(), address.toString(), address.workChain, address.toRaw(), address.toStringBuffer());

    return 0;
}


main().then(r => console.log(r));