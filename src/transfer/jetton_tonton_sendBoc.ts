import {ADDRESS_TEST_1, ADDRESS_TEST_2, API_KEY, MNEMONIC, WORKCHAIN} from "../utils/const";
import {
    WalletContractV4,
    Address,
    JettonMaster,
    beginCell,
    toNano,
    internal,
    storeMessageRelaxed,
    TonClient,
    Cell,
    storeMessage,
    external,
} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";

async function main () {
    // 1. init Ton Testnet RPC
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: API_KEY
    });

    // 2. open wallet v4
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});
    const contract = client.open(walletContract);

    // 3. init jetton contract
    const aiotxMasterAddress = Address.parse('kQAiboDEv_qRrcEdrYdwbVLNOXBHwShFbtKGbQVJ2OKxY_Di');
    const aiotxMasterContract = client.open(JettonMaster.create(aiotxMasterAddress));
    const jettonWalletAddress = await aiotxMasterContract.getWalletAddress(walletContract.address);

    // todo: construct message manually
    const destinationAddress = Address.parse(ADDRESS_TEST_2);
    const responseAddress = Address.parse(ADDRESS_TEST_1);
    const forwardPayload = beginCell()
        .storeUint(0, 32) // 0 opcode means we have a comment
        .storeStringTail('Bluedot from SubWallet. Have a good day!')
        .endCell();

    const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
        .storeUint(0, 64) // query id
        .storeCoins(toNano(0.002)) // jetton amount, amount * 10^9
        .storeAddress(destinationAddress)
        .storeAddress(responseAddress) // response destination, who get remain token
        .storeBit(0) // no custom payload
        .storeCoins(toNano('0.000000001')) // forward amount - if >0, will send notification message
        .storeBit(1) // we store forwardPayload as a reference
        .storeRef(forwardPayload)
        .endCell();

    const internalMessage = internal({
        to: jettonWalletAddress, // JettonWallet of sender
        value: toNano('0.1'),
        bounce: true,
        body: messageBody
    });

    // todo: send this internal message
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internalMessage
        ]
    })

    const api = 'https://testnet.toncenter.com/api/v2/sendBocReturnHash'
    const boc = externalMessage(walletContract, seqno, tx).toBoc().toString('base64');
    console.log('boc', boc);

    const resp = await fetch(
        api,{
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify({
                'boc': boc
            })
        });
    const hash = await resp.json();
    console.log('hash', hash);

    // await contract.send(tx);

    return;
}

main()

function externalMessage (contract: WalletContractV4, seqno: number, body: Cell) {
    return beginCell()
        .storeWritable(
            storeMessage(
                external({
                    to: contract.address,
                    init: seqno === 0 ? contract.init : undefined,
                    body: body,
                }),
            ),
        )
        .endCell();
}

// async function estimateFee () {
//     const api = 'https://testnet.toncenter.com/api/v2/estimateFee';
//     const response = await fetch(
//         api,{
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-API-KEY': API_KEY
//             },
//             body: JSON.stringify({
//                 query: {
//                     "address": "string", //
//                     "body": "string", //
//                     "init_code": "", //
//                     "init_data": "", //
//                     "ignore_chksig": true
//                 }
//             })
//         });
//     return await response.json();
// }