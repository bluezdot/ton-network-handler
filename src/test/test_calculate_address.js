const { Address, beginCell } = require("@ton/core")
const { TonClient } = require("@ton/ton")

async function getUserWalletAddress(userAddress, jettonMasterAddress) {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    const userAddressCell = beginCell().storeAddress(userAddress).endCell()

    const response = await client.runMethod(jettonMasterAddress, 'get_wallet_address', [
        {type: 'slice', cell: userAddressCell}
    ])
    return response.stack.readAddress()
}

const jettonMasterAddress = Address.parse('kQAiboDEv_qRrcEdrYdwbVLNOXBHwShFbtKGbQVJ2OKxY_Di')
const userAddress = Address.parse('UQBbamQ89OMv8DkcR2RW_tW9sX7xClXLt8KYDHbUqtB4dbz1')

getUserWalletAddress(userAddress, jettonMasterAddress)
    .then((jettonWalletAddress) => {console.log(jettonWalletAddress)})