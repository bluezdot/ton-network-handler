import {PHONG_RPC, TONCENTER_RPC} from "../utils/const";
import {TonClient} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    const client = new TonClient({ endpoint: TONCENTER_RPC})

    // sendMessage
    // sendExternalMessage

    console.log("Client:", await client.getMasterchainInfo());

    return;
}


main();