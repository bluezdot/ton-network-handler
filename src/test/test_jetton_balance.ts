import {MNEMONIC, WORKCHAIN} from "../utils/const";
import {WalletContractV4, Address, JettonMaster, JettonWallet, TonClient} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";

async function main () {
    // 1. init Ton Testnet RPC
    const client = new TonClient({ endpoint: 'https://ton-rpc-testnet.subwallet.app/jsonRPC'})

    // 2. open wallet v4
    const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(' ').map(word => word.trim()));
    const walletContract = WalletContractV4.create({workchain: WORKCHAIN, publicKey: keyPair.publicKey});

    // 3. init jetton contract
    const aiotxMasterAddress = Address.parse('kQAiboDEv_qRrcEdrYdwbVLNOXBHwShFbtKGbQVJ2OKxY_Di'); // AIOX jetton token contract
    const aiotxMasterContract = client.open(JettonMaster.create(aiotxMasterAddress));
    const jettonWalletAddress = await aiotxMasterContract.getWalletAddress(walletContract.address);
    const jettonWalletContract = client.open(JettonWallet.create(jettonWalletAddress))
    const jettonBalance = await jettonWalletContract.getBalance();

    console.log('jettonBalance', jettonBalance);
}

main()