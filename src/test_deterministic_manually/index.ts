import { ethers } from "ethers";
import { baseRPC, sepoliaRPC } from "../../rpc";
import { keys, proxyAddresses } from "../../keys";

const getTransactionData = async (
    _provider: any,
    _txHash: string,
    _functionSignature: string
) => {
    let dataObj = 0;
    try {
        let txData = await _provider.getTransaction(_txHash);
        if (txData) {
            if (txData.data.indexOf(_functionSignature) !== -1) {
                dataObj = txData;
            }
        }
        return dataObj;
    } catch (error) {
        console.log("error while fetching transaction data: ", error);
        return dataObj;
    }
};

const deploy = async (
    _privateKey: string,
    _safeProxyFactory: string,
    _provider: any,
    _chainId: number,
    _data: string
) => {
    try {
        let wallet = new ethers.Wallet(_privateKey);    
        let signer = wallet.connect(_provider);
        console.log("Using wallet address " + wallet.address);

        const _nonce = await _provider.getTransactionCount(wallet.address);

        let transaction = {
            to: _safeProxyFactory,
            value: ethers.parseEther("0"),
            nonce: _nonce,
            chainId: _chainId,
            data: _data,
        };
        let tx = signer.sendTransaction(transaction);
        console.log("Raw txhash string " + (await tx).wait());
        return `Similar smart contract deployed on ${_chainId} with tx hash : , ${(await tx).hash
            }`;
    } catch (error) {
        console.log("some error occured while deploying safe: ", error);
        return error;
    }
};

// providers
const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRPC);
const baseSepoliaProvider = new ethers.JsonRpcProvider(baseRPC);

// tx details
// note: we have to store and use very first transaction hash of wallet deployment, and use manually here.
const txHash =
    "0xdc54be7685164ad10a68a5357b74451fdf8518aefe03cba496984e5fcec56226";
const funcSign = "0x1688f0b9"; // createProxyWithNonce ()
const baseSepChainId = 84532;

// first getting input data from sepolia for a deployed smart wallet
getTransactionData(sepoliaProvider, txHash, funcSign)
    .then((res: any) => {
        // deploying same wallet(similar address) on base-sepolia
        deploy(
            keys.PK5,
            proxyAddresses.test,
            baseSepoliaProvider,
            baseSepChainId,
            res?.data
        ).then((res: any) => {
            console.log(res);
        });
    })
    .catch((err: any) => {
        console.log(err);
    });
