import {ADDRESS_TEST_1, PHONG_RPC, TONCENTER_RPC, TONCENTER_TESTNET_RPC} from "../utils/const";
import {Address, fromNano, TonClient} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    const client = new TonClient({ endpoint: TONCENTER_TESTNET_RPC})

    const balance1 = await client.getBalance(Address.parse(ADDRESS_TEST_1));
    const balance2 = await client.getBalance(Address.parse('EQAED4MdieW2dXOe9CCvNCalWOFszfwbXi2D4I0jvXyjuoO2'))
    console.log('balance 1:', fromNano(balance1));
    console.log('balance 2:', fromNano(balance2));

    console.log('address', Address.parse(ADDRESS_TEST_1).toString({bounceable: false, testOnly: true}))
    return;
}

main();