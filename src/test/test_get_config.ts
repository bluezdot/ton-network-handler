import { API_KEY} from "../utils/const";
import {TonClient, configParse18, loadConfigParamById} from "@ton/ton";

async function main () {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: API_KEY
    })

    const config = {
        storage: [{ utime_since: 0, bit_price_ps: BigInt(1), cell_price_ps: BigInt(500), mc_bit_price_ps: BigInt(1000), mc_cell_price_ps: BigInt(500000) }],
        workchain: {
            gas: { flatLimit: BigInt(100), flatPrice: BigInt(40000), price: BigInt(26214400) },
            message: { lumpPrice: BigInt(400000), bitPrice: BigInt(26214400), cellPrice: BigInt(2621440000), firstFrac: 21845, ihrPriceFactor: 98304, nextFrac: 21845 }
        },
    };
    const storageStats = [{
        lastPaid: 1696792239, duePayment: null,
        used: { bits: 6888, cells: 14, publicCells: 0 }
    }]
    const gasUsageByOutMsgs: { [key: number]: number } = { 1: 3308, 2: 3950, 3: 4592, 4: 5234 };

    const serializedConfigsCell = (await client.getConfig(KNOWN_BLOCK, [18])).config.cell;
    const config18 = configParse18(loadConfigParamById((, 18).beginParse()))

    console.log('config', config18);

    return;
}

main()

// https://github.com/ton-org/ton/compare/v13.0.0...v14.0.0
// https://testnet.tonviewer.com/config