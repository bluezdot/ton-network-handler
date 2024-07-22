import {getTonAddress, getTonClient, getWalletFromMnemonic} from "../base-utils";
import {MNEMONIC} from "../const";

// 2.1. Create transaction
async function main () {
    const client = await getTonClient(true);
    const wallet = await getWalletFromMnemonic(MNEMONIC);

    console.log('wallet', wallet.address, wallet.publicKey, wallet.walletId, wallet.workchain);

    return 0;
}


main().then(r => console.log(r));