import {ADDRESS_TEST_2, API_KEY, MNEMONIC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, beginCell, internal, TonClient, Cell, storeMessage, external} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {getTxByInMsg, getStatusByExtMsgHash, sendTonTransaction, sleep} from "../utils/base-utils";

export interface TxByMsgResponse {
    transactions: TxDetailInfo[]
}

interface TxDetailInfo {
    hash: string
    description: {
        compute_ph: {
            success: boolean
        },
        action: {
            success: boolean
        }
    }
    in_msg: Msg,
    out_msgs: Msg[]
}

interface Msg {
    hash: string,
    bounced: boolean
}

async function main () {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: API_KEY
    });
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});
    const contract = client.open(walletContract);

    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages
    })

    const fee = await client.estimateExternalMessageFee(
        walletContract.address, {
        body: tx,
        initCode: null,
        initData: null,
        ignoreSignature: true,
    })

    console.log('fee', fee);

    const boc = externalMessage(walletContract, seqno, tx).toBoc().toString('base64');
    const extMsgHash = await sendTonTransaction(boc);

    console.log('boc - extMsgHash', boc, extMsgHash);

    const status = await getStatusByExtMsgHash(extMsgHash);

    console.log('status', status);

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

const messages = [
    internal({
        to: ADDRESS_TEST_2,
        value: '0.003',
        bounce: false
    })
]