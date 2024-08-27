import {ADDRESS_TEST_2, MNEMONIC, PHONG_RPC, TONCENTER_RPC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, internal, TonClient, toNano} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";

// 2.1. Create transaction
async function main () {
    const client = new TonClient({ endpoint: TONCENTER_RPC})
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});

    const contract = client.open(walletContract);
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: ADDRESS_TEST_2,
                value: toNano('0.05'),
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

    return;
}

main()