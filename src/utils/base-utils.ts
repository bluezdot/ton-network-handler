import {getHttpEndpoint} from "@orbs-network/ton-access";
import {Address, internal, OpenedContract, TonClient, WalletContractV4} from "@ton/ton";
import {KeyPair, mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey} from "@ton/crypto";

export async function genKey(mnemonic?: string) {
    if (mnemonic) {
        return await mnemonicToPrivateKey(stringToStringArray(mnemonic));
    }

    const mnemonics = await mnemonicNew();
    return await mnemonicToPrivateKey(mnemonics);
}

export function stringToStringArray (str: string) {
    return str.split(' ').map(word => word.trim());
}

export async function getTonClient (isTestnet = false) {
    if (isTestnet) {
        const endpoint = await getHttpEndpoint({network: 'testnet'});
        return new TonClient({ endpoint })
    }

    const endpoint = await getHttpEndpoint();
    return new TonClient({ endpoint });
}

export function getTonAddress (userFriendlyAddress: string) {
    return Address.parse(userFriendlyAddress);
}

export function convertToRawAddress (userFriendlyAddress: string) {
    return Address.parse(userFriendlyAddress).toRawString();
}

export async function getBalance (contract: OpenedContract<WalletContractV4>) {
    return await contract.getBalance();
}

export async function createTransfer (contract: OpenedContract<WalletContractV4>, keyPair: KeyPair, value: string, destination: string, body: string) {
    // Create a transfer
    let seqno: number = await contract.getSeqno();
    return contract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({
            value: value,
            to: destination,
            body: body,
        })]
    });
}

export async function sendTransfer (contract: OpenedContract<WalletContractV4>, keyPair: KeyPair, seqno: number, value: string, destination: string, body: string) {
    await contract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: destination,
                value: value,
                body: body,
                bounce: false
            })
        ]
    })
}

// value: '1.5',
// to: 'EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u',
// body: 'Hello world',

export async function getWalletFromMnemonic (mnemonic: string) {
    const key = await mnemonicToWalletKey(mnemonic.split(" "));

    return WalletContractV4.create({ publicKey: key.publicKey, workchain: 0});
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
