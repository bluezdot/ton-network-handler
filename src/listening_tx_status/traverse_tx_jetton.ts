import {sleep} from "../utils/base-utils";
import {MNEMONIC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, internal, TonClient, Address, Cell, beginCell, storeMessage, external} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";
import TonWeb from "tonweb";

async function main () {
    // 1. Connect to testnet RPC
    const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'})
    const jettonAddress = 'EQDUdp0EQVVX0rRpnijjhUI4wx0ckRXhV7XsUrEhbAeLQIEc' // Aiotx
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));
    const provider = tonweb.provider;

    // 2. Retrieve wallet contract object
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' '));
    await sleep(1500)
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});

    // 4. Create transaction 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
    const contract = client.open(walletContract);
    await sleep(1500)
    const seqno: number = await contract.getSeqno();
    const transaction = walletContract.createTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: '0QCDV2euuWnDhFhy1GM_u6_fIPkvfO0frg95gErAnzMqGea9',
                value: '0.03',
                body: 'Yesssss Im done',
                bounce: false
            })
        ]
    })
    await sleep(1500)
    await contract.send(transaction);
    await sleep(1500)
    const boc = externalMessage(walletContract, seqno, transaction).toBoc().toString('base64');
    const tx = await getTxByBOC(client, walletContract.address, boc);
    console.log('[main] tx', tx)

    // 5. Check fee
    const fee = client.estimateExternalMessageFee(
        walletContract.address,
        {
            body: transaction,
            initCode: null,
            initData: null,
            ignoreSignature: true,
        }
    )

    await sleep(1500)

    return;
}

main()

async function getTxByBOC(client: TonClient, myAddress: Address, exBoc: string): Promise<string> {
    return retry(async () => {
        const transactions = await client.getTransactions(myAddress, {
            limit: 5,
        });
        for (const tx of transactions) {
            const inMsg = tx.inMessage;
            if (inMsg?.info.type === 'external-in') {

                const inBOC = inMsg?.body;
                if (typeof inBOC === 'undefined') {

                    console.log('[getTxByBOC] ERROR: EXTERNAL ERROR');
                    continue;
                }
                const extHash = Cell.fromBase64(exBoc).hash().toString('hex')
                const inHash = beginCell().store(storeMessage(inMsg)).endCell().hash().toString('hex')

                console.log('[getTxByBOC] hash BOC', extHash);
                console.log('[getTxByBOC] inMsg hash', inHash);
                console.log('[getTxByBOC] checking the tx', tx, tx.hash().toString('hex'));


                // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
                if (extHash === inHash) {
                    console.log('[getTxByBOC] [Match] Tx match');
                    const txHash = tx.hash().toString('hex');
                    console.log(`[getTxByBOC] [Match] Transaction Hash: ${txHash}`);
                    console.log(`[getTxByBOC] [Match] Transaction LT: ${tx.lt}`);
                    return (txHash);
                }
            }
        }
        throw new Error('Transaction not found');
    }, {retries: 30, delay: 1000});
}

async function retry<T>(fn: () => Promise<T>, options: { retries: number, delay: number }): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof Error) {
                lastError = e;
            }
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }
    }
    throw lastError;
}

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