import TonConnect from '@tonconnect/sdk';
import {beginCell, Cell, toNano} from "@ton/ton";
const connector = new TonConnect();

// async function checkTransaction (txHash: string) {
//     const response = await tonweb.({
//         collection: 'transactions',
//         filter: { id: { eq: txHash } },
//         result: 'id, status, error'
//     });
//
//     const txDetails = response.result.data[0];
//     if (txDetails.status === 'success') {
//         console.log('Transaction successful');
//     } else {
//         console.log(`Transaction failed with error: ${txDetails.error || 'Unknown error'}`);
//     }
// }

// 2.1. Create transaction
async function main () {
    const body = beginCell()
        .storeUint(0, 32) // Write 32 zero bits to indicate a text comment will follow
        .storeStringTail("Uả alo?") // Write the text comment
        .endCell();

    const result = await connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // The transaction is valid for 10 minutes from now.
        messages: [
            {
                address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // destination address
                amount: "20000000",
                payload: body.toBoc().toString("base64")
            }
        ]
    });

    const hash = Cell.fromBase64(result.boc).hash().toString("base64");



    return 0;
}


main().then(r => console.log(r));


