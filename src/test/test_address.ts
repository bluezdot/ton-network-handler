import {ADDRESS_TEST_1, PHONG_RPC, TONCENTER_RPC} from "../utils/const";
import {Address, fromNano, TonClient} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    const client = new TonClient({ endpoint: PHONG_RPC})

    const balance1 = await client.getBalance(Address.parse(ADDRESS_TEST_1));
    const balance2 = await client.getBalance(Address.parse('EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u'))
    console.log('balance 1:', fromNano(balance1));
    console.log('balance 2:', fromNano(balance2));

    return;
}

main();