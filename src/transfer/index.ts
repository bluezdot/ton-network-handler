import {genKey, getTonClient, sendTransfer, sleep, stringToStringArray} from "../utils/base-utils";
import {MNEMONIC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, internal, TonClient, Address} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";

// 2.1. Create transaction
async function main () {
    // 1. Connect to testnet RPC
    const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'})

    // 2. Retrieve wallet contract object
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});
    await sleep(1500)
    // 3. Make sure wallet is deployed
    if (!await client.isContractDeployed(walletContract.address)) { // todo: check case send when is not deployed
        return 'wallet is not deployed';
    }
    await sleep(1500)
    // 4. Send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
    const contract = client.open(walletContract);
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
                value: '0.05',
                body: 'Hello World',
                bounce: false
            })
        ]
    })

    // 5. Check fee
    const fee = client.estimateExternalMessageFee(
        walletContract.address,
        {
            body: tx,
            initCode: null,
            initData: null,
            ignoreSignature: true,
        }
    )
    console.log('fee', await fee);

    await contract.send(tx);

    // const transfer = contract.sendTransfer({
    //     secretKey: keyPair.secretKey,
    //     seqno: seqno,
    //     messages: [
    //         internal({
    //             to: 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
    //             value: '0.05',
    //             body: 'Hello World',
    //             bounce: false
    //         })
    //     ]
    // })

    await sleep(1500)
    // 5. Wait transaction confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await contract.getSeqno();
    }

    console.log("transaction confirmed!");

    return;
}

main()
