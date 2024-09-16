import {Address} from "@ton/ton";

const ADDRESS = '0QDqvYlCnUZsdC45pecG839wMtOWJ3wUkLFXYqxby5u0Lb4J'

function isBounceableAddress (address: string) {
    try {
        return Address.isFriendly(address)
            ? Address.parseFriendly(address).isBounceable
            : true;
    } catch {
        return true;
    }
}

// 2.1. Create transaction
async function main () {
    const isBounceable = isBounceableAddress(ADDRESS)

    console.log('isBounceableAddress', isBounceable);
    console.log('isBounceableAddress', seeIfBounceable(ADDRESS));

    return;
}

const seeIfBounceable = (address: string) => {
    return Address.isFriendly(address)
        ? Address.parseFriendly(address).isBounceable
        : true;
};

main();