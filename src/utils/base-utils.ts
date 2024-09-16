import {getHttpEndpoint} from "@orbs-network/ton-access";
import {Address, internal, OpenedContract, TonClient, WalletContractV4, external} from "@ton/ton";
import {KeyPair, mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey} from "@ton/crypto";
import {beginCell, Cell, storeMessage } from '@ton/core';
import {API_KEY} from "./const";
import {TxByMsgResponse} from "../listening_tx_status/new_listening";
import TonWeb from "tonweb";

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
    const seqno: number = await contract.getSeqno();
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

export async function sendTonTransaction (boc: string) {
    const resp = await fetch(
        'https://testnet.toncenter.com/api/v2/sendBocReturnHash', { // todo: create function to get this api by chain
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY // todo: hide this key
            },
            body: JSON.stringify({
                boc: boc
            })
        }
    );

    const extMsgInfo = await resp.json() as {result: { hash: string}};

    return extMsgInfo.result.hash;
}

export async function getTxByInMsg (extMsgHash: string) {
    const url = `https://testnet.toncenter.com/api/v3/transactionsByMessage?msg_hash=${extMsgHash}&direction=in`;
    const resp = await fetch(
        url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            }
        }
    )

    return await resp.json() as TxByMsgResponse;
}

async function retry<T>(fn: () => Promise<T>, options: { retries: number, delay: number }): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof Error) {
                lastError = e;
            }
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }
    }
    throw lastError;
}

export async function getStatusByExtMsgHash(extMsgHash: string): Promise<boolean> {
    return retry(async () => {
        const externalTxInfo = await getTxByInMsg(extMsgHash);
        const internalMsgHash = externalTxInfo.transactions[0].out_msgs[0].hash as string;

        if (internalMsgHash) {
            const internalTxInfoRaw = await getTxByInMsg(extMsgHash);
            const internalTxInfo = internalTxInfoRaw.transactions[0];
            const isCompute = internalTxInfo.description.compute_ph.success;
            const isAction = internalTxInfo.description.action.success;
            const isBounced = internalTxInfo.out_msgs[0] && internalTxInfo.out_msgs[0].bounced;

            if (isCompute && isAction && !isBounced) {
                return true;
            }
        }

        throw new Error('Transaction not found');
    }, {retries: 10, delay: 3000});
}

export function isBounceable (address: string) {
    const addr = new TonWeb.Address(address);
    return !addr.isUserFriendly || addr.isBounceable;
}

export function externalMessage (contract: WalletContractV4, seqno: number, body: Cell) {
    return beginCell()
        .storeWritable(
            storeMessage(
                external({
                    to: contract.address,
                    init: seqno === 0 ? contract.init : undefined,
                    body: body
                })
            )
        )
        .endCell();
}