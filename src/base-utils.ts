import {getHttpEndpoint} from "@orbs-network/ton-access";
import {Address, internal, OpenedContract, TonClient, WalletContractV4} from "@ton/ton";
import {KeyPair, mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey} from "@ton/crypto";

export async function genKey() {
    const mnemonics = await mnemonicNew();
    return await mnemonicToPrivateKey(mnemonics);
}

export async function getTonClient () {
    const endpoint = await getHttpEndpoint();
    return new TonClient({ endpoint });
}

export async function getTonAddress (userFriendlyAddress: string) {
    return Address.parse(userFriendlyAddress);
}

export function convertToRawAddress (userFriendlyAddress: string) {
    return Address.parse(userFriendlyAddress).toRawString();
}

export async function getBalance(contract: OpenedContract<WalletContractV4>) {
    return await contract.getBalance();
}

async function createTransfer(contract: OpenedContract<WalletContractV4>, keyPair: KeyPair, value: string, address: string, body: string) {
    // Create a transfer
    let seqno: number = await contract.getSeqno();
    return contract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({
            value: value,
            to: address,
            body: body,
        })]
    });
}

// value: '1.5',
// to: 'EQBTZd5pX8a3oSoeh_AECNF-JL6j9Cn74Brte7qNMKdvwE2u',
// body: 'Hello world',

export async function getWalletFromMnemonic (mnemonic: string) {
    const key = await mnemonicToWalletKey(mnemonic.split(" "));

    return WalletContractV4.create({ publicKey: key.publicKey, workchain: 0});
}