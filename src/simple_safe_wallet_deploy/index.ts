import { ethers } from "ethers";
import { EthersAdapter } from "@safe-global/protocol-kit";
import dotenv from "dotenv";
import SafeApiKit from "@safe-global/api-kit";
import { SafeFactory } from "@safe-global/protocol-kit";
import { SafeAccountConfig } from "@safe-global/protocol-kit";
dotenv.config();

const deployWallet = async (
  _rpcUrl: string,
  _chainId: bigint,
  _scannerUrl: string,
  _ownerOnePk: string
) => {
  try {
    const RPC_URL = _rpcUrl;
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Initialize signers
    const owner1Signer = new ethers.Wallet(
      // process.env.OWNER_1_PRIVATE_KEY!,
      _ownerOnePk,
      provider
    );
    const ownerWallet2 = ethers.Wallet.createRandom();
    const _ownerTwoPk = ownerWallet2.privateKey;
    const owner2Signer = new ethers.Wallet(
      // process.env.OWNER_2_PRIVATE_KEY!,
      _ownerTwoPk,
      provider
    );

    const ethAdapterOwner1 = new EthersAdapter({
      ethers,
      signerOrProvider: owner1Signer,
    });

    const apiKit = new SafeApiKit({
      chainId: 1n,
    });

    const safeFactory = await SafeFactory.create({
      ethAdapter: ethAdapterOwner1,
    });

    const safeAccountConfig: SafeAccountConfig = {
      owners: [
        await owner1Signer.getAddress(),
        await owner2Signer.getAddress(),
      ],
      threshold: 1,
      // ... (Optional params)
    };

    /* This Safe is tied to owner 1 because the factory was initialized with
          an adapter that had owner 1 as the signer. */
    const protocolKitOwner1 = await safeFactory.deploySafe({
      safeAccountConfig,
      saltNonce: "123"
    });

    const safeAddress = await protocolKitOwner1.getAddress();

    console.log("Your Safe has been deployed:");
    console.log(`${_scannerUrl + safeAddress}`);

    // here's the smart wallet address
    return safeAddress;
  } catch (error) {
    console.log("Error: ", error);
  }
};

const rpcUrl = "https://eth-sepolia.public.blastapi.io";
// base sepolia rpc url = "https://base-sepolia.g.alchemy.com/v2/n-ev3J8wA27ltbz641pguBCnvyZoBeNw"
const scannerUrl = "https://sepolia.etherscan.io/address/";
const EOA1 = "488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";

deployWallet(rpcUrl, 11155111n, scannerUrl, EOA1)
  .then((res: any) => {
    console.log("finished", res);
  })
  .catch((err: any) => {
    console.log("error", err);
  });
