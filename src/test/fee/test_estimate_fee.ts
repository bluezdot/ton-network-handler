import {WalletContractV4, internal, TonClient, toNano, fromNano} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {ADDRESS_TEST_1, ADDRESS_TEST_2, API_KEY, MNEMONIC2, TONCENTER_TESTNET_RPC, WORKCHAIN} from "../../utils/const";

export const MNEMONIC = 'quote logic smoke crunch various busy base sign spoon shed volume bachelor faint trigger want heart deposit table note grace search bunker upgrade include';

// 2.1. Create transaction
async function main () {
    const client = new TonClient({
        endpoint: TONCENTER_TESTNET_RPC,
        apiKey: API_KEY
    })

    const keyPair = await mnemonicToPrivateKey(MNEMONIC2.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});

    const contract = client.open(walletContract);
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        sendMode: 128,
        messages: [
            internal({
                to: ADDRESS_TEST_1,
                value: toNano('0.5'),
                bounce: false
            })
        ]
    })

    // 5. Fee using tonton api
    const fee = (await client.estimateExternalMessageFee(
        walletContract.address,
        {
            body: tx,
            initCode: null, // walletContract.init.code || null,
            initData: null, // walletContract.init.data || null,
            ignoreSignature: true,
        }
    )).source_fees;

    const estimateFee = BigInt(fee.storage_fee + fee.fwd_fee + fee.in_fwd_fee + fee.gas_fee);
    const balance = await contract.getBalance();
    const maxTransferable = balance - estimateFee;
    console.log('fee', fee);
    console.log('estimateFee', estimateFee);
    console.log('balance', balance, walletContract.address);
    console.log('maxTransferable', fromNano(maxTransferable));
    console.log('walletContract.init.code', walletContract.init.code);
    console.log('walletContract.init.data', walletContract.init.data);

    return;
}

main()