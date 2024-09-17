import {ADDRESS_TEST_2, API, API_KEY, MNEMONIC, WORKCHAIN} from "../utils/const";
import {
    WalletContractV4,
    beginCell,
    internal,
    TonClient,
    Cell,
    storeMessage,
    external,
    toNano,
    Address, SendMode
} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {ExtMessageInfoResponse} from "../utils/interfaces";

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

    // todo: check this in case not deployed

    // 3. create transfer tx
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({
            value: toNano('0.07') ,
            to: ADDRESS_TEST_2, // todo: validate this is correct address
            body: 'Bluedot. Test listen ton tx status!',
            // init
            bounce: isBounceable(ADDRESS_TEST_2) // todo: check why set this true can not work?
            // todo: test send to address that has not yet initial with bounce flag is false.
        })]
    })
    const boc = externalMessage(walletContract, seqno, tx).toBoc().toString('base64');

    const fee = await estimateFee(contract.address.toString(), tx.toBoc().toString('base64'));
    console.log('fee', fee);

    // 4. Send transfer tx and get the external message hash
    const resp = await fetch(
        API.sendBocReturnHash,{
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
    const extMessageInfo = await resp.json() as ExtMessageInfoResponse;
    const messageHash = extMessageInfo.result.hash;
    console.log('messageHash', messageHash);

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

async function estimateFee (address: string, body: string, init_code?: string, init_data?: string) {
    const response = await fetch(
        API.estimateFee,{
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify({
                "address": address,
                "body": body,
                "init_code": init_code || "",
                "init_data": init_data || "",
                "ignore_chksig": true
            })
        });
    return await response.json();
}

function isBounceable (address: string) {
    return Address.isFriendly(address)
        ? Address.parseFriendly(address).isBounceable
        : false;
}

function getTonSendMode (max: string | undefined) { // todo: optimize this
    return max === "1"
        ? SendMode.CARRY_ALL_REMAINING_BALANCE
        : SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS;
};
