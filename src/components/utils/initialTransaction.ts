import {
	Address,
	BaseError,
	ContractFunctionExecutionError,
	encodePacked,
	Hex,
	hexToBigInt,
	padHex,
	WalletClient,
} from "viem"
import {
	getDomain,
	getFactoryInitializer,
	getFormattedSignature,
	getNonce,
	getSafe7579LaunchpadSetupData,
	getSalt,
	getUserOpInitCode,
	readTokenBalance,
} from "./Encoding"
import {
	BLOCK_GUARD_SETTER,
	BLOCK_SAFE_GUARD,
	GUARDIAN_VALIDATOR,
} from "./constants"
import { types, UnsignedUserOperation } from "../data"
import { publicClient } from "./clients"
import { fetchSignature } from "./fetchSignature"
import { entryPointAbi } from "./abi"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { foundry } from "viem/chains"

export default async function initialTransactionSend(
	smartAccountAddress: Address,
	initHash: Hex,
	owner: Address,
	viemProvider: WalletClient,
) {
	const _factoryInitializer = getFactoryInitializer(
		initHash,
		BLOCK_GUARD_SETTER,
		BLOCK_SAFE_GUARD,
	)
	// console.log("FactoryInitializer")

	// console.log(_factoryInitializer)

	const _initCode = getUserOpInitCode(_factoryInitializer, getSalt(owner))
	// console.log("InitCode Hash- ")
	// console.log(initHash)

	const userOp: UnsignedUserOperation = {
		sender: smartAccountAddress,
		nonce: await getNonce(
			publicClient,
			smartAccountAddress,
			GUARDIAN_VALIDATOR,
		),
		initCode: _initCode,
		callData: getSafe7579LaunchpadSetupData(owner),
		accountGasLimits: padHex(
			encodePacked(
				["uint128", "uint128"],
				[BigInt("2000000"), BigInt("2000000")],
			),
			{ size: 32 },
		),
		preVerificationGas: hexToBigInt("0x1000000000"),
		gasFees: padHex("0x01", { size: 32 }),
		paymasterAndData: "" as Hex,
	}
	const signature = await viemProvider.signTypedData({
		account: owner,
		domain: getDomain(GUARDIAN_VALIDATOR),
		types,
		primaryType: "UnsignedUserOperation",
		message: userOp,
	})
	// console.log("Signature- ")

	// console.log(signature)
	// console.log("Fetching Backend Sig- ")
	const backendSig = await fetchSignature(userOp, smartAccountAddress)

	// console.log(backendSig)
	const encodedSignature = getFormattedSignature(signature, backendSig)
	// console.log(encodedSignature)

	const signedUserOp = {
		sender: userOp.sender,
		nonce: userOp.nonce,
		initCode: userOp.initCode,
		callData: userOp.callData,
		accountGasLimits: userOp.accountGasLimits,
		preVerificationGas: userOp.preVerificationGas,
		gasFees: userOp.gasFees,
		paymasterAndData: userOp.paymasterAndData,
		signature: encodedSignature,
	}
	console.log("Token Balance Before Tx- ")
	const priorTokenBalance = await readTokenBalance(publicClient, userOp.sender)
	console.log(priorTokenBalance)
	try {
		const { request } = await publicClient.simulateContract({
			account: owner,
			abi: entryPointAbi,
			functionName: "handleOps",
			args: [[signedUserOp], "0x0000000000000000000000000000000000000069"],
			address: ENTRYPOINT_ADDRESS_V07,
			chain: foundry,
		})
		// await publicClient.key

		// console.log(request)
		// console.log(result)

		const hash = await viemProvider.writeContract(request)
		// console.log(hash)
		const transaction = await publicClient.getTransaction({
			hash: hash,
		})
		console.log("Token Balance After Tx- ")
		const postTokenBalance = await readTokenBalance(publicClient, userOp.sender)
		console.log(postTokenBalance)
		return hash
		// console.log(transaction)
	} catch (err) {
		if (err instanceof BaseError) {
			console.log(err)

			const revertError = err.walk(
				(err) => err instanceof ContractFunctionExecutionError,
			)
			if (revertError instanceof ContractFunctionExecutionError) {
				console.error(revertError.message)
			}
		}
	}
}
