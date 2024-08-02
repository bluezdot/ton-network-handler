import {getTonClient, sleep} from "../base-utils";
import {Address, beginCell, Cell, storeMessage, TonClient} from "@ton/ton";
import {useTonConnectUI} from "@tonconnect/ui-react";

async function main () {
    // // A. GET TX HASH AFTER SENDING
    // const [tonConnectUi] = useTonConnectUI();
    //
    // const body = beginCell()
    //     .storeUint(0, 32) // Write 32 zero bits to indicate a text comment will follow
    //     .storeStringTail("Uả alo?") // Write the text comment
    //     .endCell();
    //
    // const result = await tonConnectUi.sendTransaction({
    //     validUntil: Math.floor(Date.now() / 1000) + 600, // The transaction is valid for 10 minutes from now.
    //     messages: [
    //         {
    //             address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // destination address
    //             amount: "20000000",
    //             payload: body.toBoc().toString("base64")
    //         }
    //     ]
    // });
    //
    // const hashTx = Cell.fromBase64(result.boc).hash().toString("base64");

    // B. CHECK LASTEST TX HASH TO COMPARE TO THE HASH ABOVE

    const client = await getTonClient(true);
    const walletAddress = Address.parse('0QBbamQ89OMv8DkcR2RW_tW9sX7xClXLt8KYDHbUqtB4dQd_');
    // 1. Get state of wallet contract.
    const state = await client.getContractState(walletAddress);
    const {lt, hash} = state.lastTransaction as {lt: string, hash: string};
    //
    await sleep(10000);
    //
    // // 2. Get last tx info
    const lastTx = await client.getTransaction(walletAddress, lt, hash);
    console.log('lastTx', lastTx)

    // if (lastTx && lastTx.inMessage) {
    //     const msgCell = beginCell()
    //         .store(storeMessage(lastTx.inMessage))
    //         .endCell();
    //
    //     const inMsgHash = msgCell.hash().toString("base64");
    //
    //     if (inMsgHash === hashTx) {
    //         console.log('success', inMsgHash, hashTx)
    //     }
    //
    //     console.log('pending', inMsgHash, hashTx)
    // }

    return 0;
}


main().then(r => console.log(r));