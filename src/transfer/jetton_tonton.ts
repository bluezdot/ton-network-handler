import {
    ADDRESS_TEST_1,
    API_KEY,
    MNEMONIC,
    TONCENTER_TESTNET_RPC,
    WORKCHAIN
} from "../utils/const";
import {WalletContractV4, Address, JettonMaster, beginCell, toNano, internal, TonClient} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";

async function main () {
    // 1. init Ton Testnet RPC
    const client = new TonClient({
        endpoint: TONCENTER_TESTNET_RPC,
        apiKey: API_KEY})

    // 2. open wallet v4
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});
    const contract = client.open(walletContract);

    // 3. init jetton contract
    const aiotxMasterAddress = Address.parse('kQAiboDEv_qRrcEdrYdwbVLNOXBHwShFbtKGbQVJ2OKxY_Di');
    const aiotxMasterContract = client.open(JettonMaster.create(aiotxMasterAddress));
    const jettonWalletAddress = await aiotxMasterContract.getWalletAddress(walletContract.address);

    // todo: need construct message manually
    const destinationAddress = Address.parse('kQBK-3n9f6-9TbVOl6lMPUV09YZic2J9EcTYR93WzG_4arNk');
    const responseAddress = Address.parse(ADDRESS_TEST_1);
    const forwardPayload = beginCell()
        .storeUint(0, 32) // 0 opcode means we have a comment
        .storeStringTail('Bluedot from SubWallet. Have a good day!')
        .endCell();

    const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
        .storeUint(0, 64) // query id
        .storeCoins(toNano(0.2)) // jetton amount, amount * 10^9
        .storeAddress(destinationAddress)
        .storeAddress(responseAddress) // response destination, who get remain token
        .storeBit(0) // no custom payload
        .storeCoins(BigInt(1)) // forward amount - if >0, will send notification message
        .storeBit(1) // we store forwardPayload as a reference
        .storeRef(forwardPayload)
        .endCell();

    const internalMessage = internal({
        to: jettonWalletAddress,
        value: toNano('0.1'),
        bounce: true,
        body: messageBody
    });

    // todo: try to send this internal message
    const seqno: number = await contract.getSeqno();
    const tx = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internalMessage
        ]
    })

    const fee = await client.estimateExternalMessageFee(
        walletContract.address,
        {
            body: tx,
            initCode: null,
            initData: null,
            ignoreSignature: true,
        }
    )

    console.log('fee', fee);

    await contract.send(tx);

    return;
}

main()