import {Address, JettonMaster, JettonWallet, TonClient, WalletContractV4} from "@ton/ton";
import {genKey, getBalance, getTonAddress} from "./utils/base-utils";
import TonWeb from "tonweb";
import {AIOX_JETTON_MASTER_ADDRESS, TONCENTER_TESTNET_RPC, WORKCHAIN} from "./utils/const";

async function main() {
    // 1.1. Create Address object and get native balance.
    // Recheck here: https://tonscan.org/address/EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u
    const tonClient = new TonClient({ endpoint: TONCENTER_TESTNET_RPC})
    const address11 = await getTonAddress('EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u')
    const balance11 = await tonClient.getBalance(address11);
    console.log('[1.1] balance:', balance11)

    // 1.2. Init Wallet from keypair and get balance.
    const keyPair = await genKey();
    const wallet12 = WalletContractV4.create({ workchain: WORKCHAIN, publicKey: keyPair.publicKey });
    const contract12 = tonClient.open(wallet12);
    const balance12 = await getBalance(contract12);
    console.log('[1.2] balance:', balance12);

    // 1.3. Get Jettons balance (TonWeb)
    const usdtMasterAddress = Address.parse(AIOX_JETTON_MASTER_ADDRESS);
    const usdtMasterContract = tonClient.open(JettonMaster.create(usdtMasterAddress));
    const address13 = await getTonAddress('EQAYqo4u7VF0fa4DPAebk4g9lBytj2VFny7pzXR0trjtXQaO');
    const jettonAddress = await usdtMasterContract.getWalletAddress(address13);
    console.log('[1.3] [skip] address - jetton address: ', address13, '-', jettonAddress);
    console.log('[1.3] [skip] check same address', address13.toRawString() === Address.parse(address13.toRawString()).toRawString()); // return the same address

    const tonweb = new TonWeb();
    const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider,{address: jettonAddress.toRawString()});
    const data = await jettonWallet.getData();
    console.log('[1.3] balance:', data.balance.toString());

    // 1.4. Get Jettons balance (Ton)
    const jettonWalletContract = tonClient.open(JettonWallet.create(jettonAddress));
    const balance14 = await jettonWalletContract.getBalance();
    console.log('[1.4] balance:', balance14);

    return;
}

main();