import {genKey, getTonClient} from "../base-utils";
import {MNEMONIC, WORKCHAIN} from "../const";
import {WalletContractV4, Address, JettonMaster, JettonWallet} from "@ton/ton";

// 2.1. Create transaction
async function main () {
    // 1. init Ton Testnet RPC
    const client = await getTonClient(true);

    // 2. open wallet v4
    const keyPair = await genKey(MNEMONIC); // migrate convert to utils function
    const wallet = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});
    const contract = client.open(wallet);

    // 3. init jetton contract
    const aiotxMasterAddress = Address.parse('kQAiboDEv_qRrcEdrYdwbVLNOXBHwShFbtKGbQVJ2OKxY_Di');
    const aiotxMasterContract = client.open(JettonMaster.create(aiotxMasterAddress));

    const jettonAddress = await aiotxMasterContract.getWalletAddress(wallet.address);
    const jettonWallet = JettonWallet.create(jettonAddress);
    const jettonContract = client.open(jettonWallet);

    // todo: need construct message manually

    return 0;
}


main().then(r => console.log(r));