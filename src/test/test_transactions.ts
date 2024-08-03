import {getTonAddress, getTonClient} from "../utils/base-utils";
import {ADDRESS_TEST_1, ADDRESS_TEST_2, MNEMONIC} from "../utils/const";
import {beginCell, fromNano} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const address = await getTonAddress(ADDRESS_TEST_1);
    const tx=  (await client.getTransactions(address, {limit: 1}))[0];
    const inMsg = tx.inMessage;
    if (inMsg?.info.type == 'internal') {
        const info = inMsg.info;
        const sender = inMsg?.info.src;
        const value = inMsg?.info.value.coins;
        const originalBody = inMsg?.body.beginParse();
        let body = originalBody.clone();
        if (body.remainingBits < 32) {
            console.log(`Simple transfer from ${sender} with value ${fromNano(value)} TON`);
        }
        const op = body.loadUint(32);
        if (op == 0) {
            const comment = body.loadStringTail();
            console.log(
                `Simple transfer from ${sender} with value ${fromNano(value)} TON and comment: "${comment}"`
            );
        } else if (op == 0x7362d09c) { // Jetton transfer notification
            body.skip(64); // skip query_id
            const jettonAmount = body.loadCoins();
            const jettonSender = body.loadAddressAny();
            const originalForwardPayload = body.loadBit() ? body.loadRef().beginParse() : body;
            let forwardPayload = originalForwardPayload.clone();

            // IMPORTANT: we have to verify the source of this message because it can be faked
            const runStack = (await client.runMethod(sender, 'get_wallet_data')).stack;
            runStack.skip(2);
            const jettonMaster = runStack.readAddress();
            const jettonWallet = (
                await client.runMethod(jettonMaster, 'get_wallet_address', [
                    { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
                ])
            ).stack.readAddress();
            if (!jettonWallet.equals(sender)) {
                // if sender is not our real JettonWallet: this message was faked
                console.log(`FAKE Jetton transfer`);
            }

            if (forwardPayload.remainingBits < 32) {
                // if forward payload doesn't have opcode: it's a simple Jetton transfer
                console.log(`Jetton transfer from ${jettonSender} with value ${fromNano(jettonAmount)} Jetton`);
            } else {
                const forwardOp = forwardPayload.loadUint(32);
                if (forwardOp == 0) {
                    // if forward payload opcode is 0: it's a simple Jetton transfer with comment
                    const comment = forwardPayload.loadStringTail();
                    console.log(
                        `Jetton transfer from ${jettonSender} with value ${fromNano(
                            jettonAmount
                        )} Jetton and comment: "${comment}"`
                    );
                } else {
                    // if forward payload opcode is something else: it's some message with arbitrary structure
                    // you may parse it manually if you know other opcodes or just print it as hex
                    console.log(
                        `Jetton transfer with unknown payload structure from ${jettonSender} with value ${fromNano(
                            jettonAmount
                        )} Jetton and payload: ${originalForwardPayload}`
                    );
                }

                console.log(`Jetton Master: ${jettonMaster}`);
            }
        } else if (op == 0x05138d91) {
            // if opcode is 0x05138d91: it's a NFT transfer notification

            body.skip(64); // skip query_id
            const prevOwner = body.loadAddress();
            const originalForwardPayload = body.loadBit() ? body.loadRef().beginParse() : body;
            let forwardPayload = originalForwardPayload.clone();

            // IMPORTANT: we have to verify the source of this message because it can be faked
            const runStack = (await client.runMethod(sender, 'get_nft_data')).stack;
            runStack.skip(1);
            const index = runStack.readBigNumber();
            const collection = runStack.readAddress();
            const itemAddress = (
                await client.runMethod(collection, 'get_nft_address_by_index', [{ type: 'int', value: index }])
            ).stack.readAddress();

            if (!itemAddress.equals(sender)) {
                console.log(`FAKE NFT Transfer`);
            }

            if (forwardPayload.remainingBits < 32) {
                // if forward payload doesn't have opcode: it's a simple NFT transfer
                console.log(`NFT transfer from ${prevOwner}`);
            } else {
                const forwardOp = forwardPayload.loadUint(32);
                if (forwardOp == 0) {
                    // if forward payload opcode is 0: it's a simple NFT transfer with comment
                    const comment = forwardPayload.loadStringTail();
                    console.log(`NFT transfer from ${prevOwner} with comment: "${comment}"`);
                } else {
                    // if forward payload opcode is something else: it's some message with arbitrary structure
                    // you may parse it manually if you know other opcodes or just print it as hex
                    console.log(
                        `NFT transfer with unknown payload structure from ${prevOwner} and payload: ${originalForwardPayload}`
                    );
                }
            }

            console.log(`NFT Item: ${itemAddress}`);
            console.log(`NFT Collection: ${collection}`);
        } else {
            // if opcode is something else: it's some message with arbitrary structure
            // you may parse it manually if you know other opcodes or just print it as hex
            console.log(
                `Message with unknown structure from ${sender} with value ${fromNano(
                    value
                )} TON and body: ${originalBody}`
            );
        }
    }


    // const state = await client.getContractState(address);
    // const {lt, hash} = state.lastTransaction as {lt: string, hash: string};
    // console.log('lt - hash', lt, hash);
    //
    // const lastTx = await client.getTransaction(address, lt, hash);
    // console.log('lastTx', lastTx);

    return;
}


main()