import {MNEMONIC, PHONG_RPC} from "../utils/const";
import {TonClient, WalletContractV4} from "@ton/ton";
import {mnemonicToWalletKey} from "@ton/crypto";

// 2.1. Create transaction
async function main () {
    const client = new TonClient({ endpoint: PHONG_RPC})
    const keyPair = await mnemonicToWalletKey(MNEMONIC.split(" "));
    const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0});

    console.log('wallet', wallet.address.toString({testOnly: false, bounceable: true}), wallet.publicKey, wallet.walletId, wallet.workchain);

    return;
}


main();