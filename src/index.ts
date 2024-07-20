import {Address, JettonMaster, TonClient, WalletContractV4} from "@ton/ton";
import {genKey, getBalance, getTonAddress, getTonClient, getWalletFromMnemonic} from "./base-utils";
import TonWeb from "tonweb";


const WORKCHAIN = 0;
const CLIENT = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC'
});

async function main() {
    // 1.1. Create Address object and get native balance.
    // Recheck here: https://tonscan.org/address/EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u
    const tonClient = await getTonClient();
    const address11 = await getTonAddress('EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u')
    const balance11 = await tonClient.getBalance(address11);
    console.log('[1.1] balance:', balance11)

    // 1.2. Init Wallet from keypair and get balance.
    const keyPair = await genKey();
    const wallet12 = WalletContractV4.create({ workchain: WORKCHAIN, publicKey: keyPair.publicKey });
    const contract12 = tonClient.open(wallet12);
    const balance12 = await getBalance(contract12);
    console.log('[1.2] balance:', balance12);

    // 1.3. Get Jettons balance
    const usdtMasterAddress = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');
    const jettonMaster = tonClient.open(JettonMaster.create(usdtMasterAddress));
    const address13 = await getTonAddress('EQAYqo4u7VF0fa4DPAebk4g9lBytj2VFny7pzXR0trjtXQaO');
    const jettonAddress = await jettonMaster.getWalletAddress(address13);
    console.log('[1.3] address - jetton address: ', address13, '-', jettonAddress);
    console.log('[1.3] [i] check 2 type address', address13.toRawString(), jettonAddress.toRawString()); // return the same address

    const tonweb = new TonWeb();
    const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider,{address: jettonAddress.toRawString()});
    const data = await jettonWallet.getData();
    console.log('[1.3] balance:', data.balance);

    // 2.1. Create transaction
    const mnemonic = 'detect deliver invest lamp above genre either life ski sign eight subject mercy crowd cabbage bomb sniff lens tide rookie chase bid tent hello'
    const wallet21 = await getWalletFromMnemonic(mnemonic);
    const contract21 = tonClient.open(wallet21);
    // console.log('[2.1] balance', await getBalance(contract21));

    return 'end';
}

main().then(r => (console.log(r.toString())) );