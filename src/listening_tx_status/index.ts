import {Cell, Address, beginCell, storeMessage, TonClient} from "@ton/ton";
import {getTonClient} from "../utils/base-utils";
import TonConnect from "@tonconnect/sdk";
import {TonConnectStorage} from "../storage/storage";
// import {TonConnectUI} from "@tonconnect/ui-react";
const connector = new TonConnect({
    manifestUrl: 'https://demo-dapp.walletbot.net/demo-dapp/tonconnect-manifest.json',
    storage: new TonConnectStorage(1)
});
// const tonConnectUI = new TonConnectUI({
//     connector
// });

async function main () {
    const client = await getTonClient(true);

    const body = beginCell()
        .storeUint(0, 32) // Write 32 zero bits to indicate a text comment will follow
        .storeStringTail("Uả alo?") // Write the text comment
        .endCell();
    const res = await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // The transaction is valid for 10 minutes from now.
        messages: [
            {
                address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // destination address
                amount: "2000000",
                payload: body.toBoc().toString("base64")
            }
        ]
    });
    const exBoc = res.boc;
    const txRes = await getTxByBOC(client, Address.parse('abc'), exBoc);
    console.log(txRes);

    return;
}

main();

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

                    console.log('ERROR: EXTERNAL ERROR');
                    continue;
                }
                const extHash = Cell.fromBase64(exBoc).hash().toString('hex')
                const inHash = beginCell().store(storeMessage(inMsg)).endCell().hash().toString('hex')

                console.log(' hash BOC', extHash);
                console.log('inMsg hash', inHash);
                console.log('checking the tx', tx, tx.hash().toString('hex'));


                // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
                if (extHash === inHash) {
                    console.log('Tx match');
                    const txHash = tx.hash().toString('hex');
                    console.log(`Transaction Hash: ${txHash}`);
                    console.log(`Transaction LT: ${tx.lt}`);
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


