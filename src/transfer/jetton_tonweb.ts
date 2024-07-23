// first 4 bytes are tag of text comment

import TonWeb from 'tonweb';
import {mnemonicToSeed} from 'tonweb-mnemonic';
import {ADDRESS_TEST_2, MNEMONIC} from "../const";
import {stringToStringArray} from "../base-utils";
const {JettonWallet} = TonWeb.token.jetton;


async function main () {
    const jettonAddress = 'EQDUdp0EQVVX0rRpnijjhUI4wx0ckRXhV7XsUrEhbAeLQIEc'
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));
    const provider = tonweb.provider;

    const seed = await mnemonicToSeed(stringToStringArray(MNEMONIC));
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const WalletClass = tonweb.wallet.all['v4R2'];
    const wallet = new WalletClass(provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    })

    const jettonWallet = new JettonWallet(provider, {
        address: jettonAddress
    });

    const transfer = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;

        if (wallet.address) {
            const tx = await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: jettonAddress, // Jetton wallet address of sender
                amount: TonWeb.utils.toNano('0.05'), // total amount of TONs attached to the transfer message
                seqno: seqno,
                payload: await jettonWallet.createTransferBody({
                    // @ts-ignore
                    jettonAmount: TonWeb.utils.toNano('0.05'), // Jetton amount (in basic indivisible units) // todo: jettonAmount
                    toAddress: new TonWeb.utils.Address(ADDRESS_TEST_2), // recepient user's wallet address (not Jetton wallet)
                    forwardAmount: TonWeb.utils.toNano('0.000000001'), // some amount of TONs to invoke Transfer notification message
                    forwardPayload: new TextEncoder().encode('gift'),
                    responseAddress: wallet.address // return the TONs after deducting commissions back to the sender's wallet address,
                }),
                sendMode: 3,
            }).send();
        }
    }
    await transfer();

    return 0;
}

main().then(r => console.log(r));


/*
- @ton/ton lib: Ton Balance, Jetton Balance, Transfer Ton
- webton: Support all. -> ignore type-checking for jettonAmount
=> Nếu dùng ton ton thì ở transfer Jetton cần tự construct message cho phần transfer. -> Cần hiểu opcode, cell, ...

 */