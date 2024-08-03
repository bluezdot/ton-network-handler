import {genKey, getTonClient, sendTransfer, sleep, stringToStringArray} from "../utils/base-utils";
import {MNEMONIC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, fromNano} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    // 1. init Ton Testnet RPC
    const client = await getTonClient(true);

    // 2. open wallet v4
    const keyPair = await genKey(MNEMONIC); // migrate convert to utils function
    const wallet = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});

    // 3. make sure wallet is deployed
    if (!await client.isContractDeployed(wallet.address)) {
        return 'wallet is not deployed';
    }

    // 4. send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
    const contract = client.open(wallet);
    const seqno: number = await contract.getSeqno();
    await sendTransfer(contract, keyPair, seqno, '0.05', 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e', 'Hello World')

    // 5. wait transaction confirmed
    let currentSeqno = seqno;
    while (currentSeqno === seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await contract.getSeqno();
    }

    console.log("transaction confirmed!");

    return 0;
}


main().then(r => console.log(r));
