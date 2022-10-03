import { Wallet, Provider, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";
dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(
    `Running deploy script for the Greeter contract in ${hre.network.name} network`
  );

  // Initialize the wallet
  const provider = new Provider(hre.userConfig.zkSyncDeploy?.zkSyncNetwork);
  const wallet = new Wallet("0x" + process.env.PRIVATE_KEY, provider);

  // Create deployer object and load the artifact of the contract to deploy
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Greeter");

  // Estimate contract deployment fee
  const greeting = "Hola, mundo!";
  const deploymentFee = await deployer.estimateDeployFee(artifact, [greeting]);

  // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  //
  // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy the contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is the constructor argument.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`Deploying contract with fee ${parsedFee} ETH`);

  const contract = await deployer.deploy(artifact, [greeting]);

  // Obtain the constructor arguments
  console.log(
    `Constructor arguments: ${contract.interface.encodeDeploy([greeting])}`
  );

  // Show the contract information
  console.log(`Contract name: ${artifact.contractName}`);
  console.log(`Contract address: ${contract.address}`);
}
