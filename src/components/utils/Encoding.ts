import {
	Address,
	encodeFunctionData,
	hexToBigInt,
	encodeAbiParameters,
	keccak256,
	Hex,
	parseAbiParameter,
	encodePacked,
	parseEther,
	parseSignature,
	zeroAddress,
	parseAbiParameters,
	WalletClient,
	PublicClient,
} from "viem"
import {
	BLOCK_GUARD_SETTER,
	BLOCK_SAFE_GUARD,
	ERC20_TOKEN,
	GUARDIAN_VALIDATOR,
	RECOVERY_MODULE,
	SAFE_LAUNCHPAD_7579,
	SAFE_PROXY_CREATION_BYTECODE,
	SAFE_PROXY_FACTORY,
	SAFE_SINGLETON,
	TOKENSHIELD_SAFE_ADDRESS,
} from "./constants"
import { privateKeyToAddress } from "viem/accounts"
import {
	blockGuardSetterAbi,
	erc20Abi,
	launchpadAbi,
	safeProxyFactoryAbi,
	tsSafeAbi,
} from "./abi"
import { foundry } from "viem/chains"
import { publicClient } from "./clients"

export function getSafe7579LaunchpadSetupData(userSigner: Address): Hex {
	const encodedLaunchSetupData = encodeFunctionData({
		abi: launchpadAbi,
		functionName: "setupSafe",
		args: [getInitDataForLaunchPadSetup(userSigner, ERC20_TOKEN, "13")],
	})
	// console.log(encodedLaunchSetupData)

	return encodedLaunchSetupData
}

export function getInitDataForLaunchPadSetup(
	userSigner: Address,
	targetAddress: Address,
	valueToMint: string,
) {
	return {
		singleton: SAFE_SINGLETON,
		owners: [userSigner],
		threshold: BigInt("1"),
		setupTo: SAFE_LAUNCHPAD_7579,
		setupData: getSetupData(),
		safe7579: TOKENSHIELD_SAFE_ADDRESS,
		validators: getValidators(userSigner),
		callData: getMintCallExecutionData(targetAddress, valueToMint), //@follow-up calldata not there in library
	}
}
export function getValidators(userSigner: Address) {
	// console.log(userSigner);

	return [
		{
			module: GUARDIAN_VALIDATOR,
			initData: encodeAbiParameters(
				[parseAbiParameter("address owner")],
				[userSigner],
			),
		},
	]
}
export function getSetupData(): Hex {
	const encodedSetupData = encodeFunctionData({
		abi: launchpadAbi,
		functionName: "initSafe7579",
		args: [
			TOKENSHIELD_SAFE_ADDRESS,
			[{ module: RECOVERY_MODULE, initData: "" as Hex }],
			[],
			[],
			[
				"0x1F8830562d09e0091c45C4497d578698D4CcA495",
				"0x46b3351cEC2e2894fB86f516571c71af735129cc",
			],
			2,
		],
	})
	return encodedSetupData
}

export function getMintCallExecutionData(
	tokenAddress: Address,
	mintValue: string,
): Hex {
	const mintEncodedData: Hex = encodeFunctionData({
		abi: erc20Abi,
		functionName: "mint",
		args: [parseEther(mintValue)],
	})

	const encodedCallData = getEncodedCallForExecute(
		tokenAddress,
		parseEther("0"),
		mintEncodedData,
	)

	return encodedCallData
}

export function getTransferCallExecutionData(
	tokenAddress: Address,
	toAddress: Address,
	etherValue: string,
): Hex {
	const transferEncodedData: Hex = encodeFunctionData({
		abi: erc20Abi,
		functionName: "transfer",
		args: [toAddress, parseEther(etherValue)],
	})

	const encodedCalldata = getEncodedCallForExecute(
		tokenAddress,
		parseEther("0"),
		transferEncodedData,
	)
	return encodedCalldata
}

export function getEncodedCallForExecute(
	targetContract: Address,
	value: bigint,
	calldata: Hex,
): Hex {
	const encodedCallData: Hex = encodeFunctionData({
		abi: tsSafeAbi,
		functionName: "execute",
		args: [
			getSimpleSingleMode(),
			encodePacked(
				["address", "uint256", "bytes"],
				[targetContract, value, calldata],
			),
		],
	})
	return encodedCallData
}

export function getSimpleSingleMode(): Hex {
	return encodePacked(
		["bytes1", "bytes1", "bytes4", "bytes4", "bytes22"],
		[
			"0x00",
			"0x00",
			"0x00000000",
			"0x00000000",
			"0x00000000000000000000000000000000000000000000",
		],
	)
}

export function getSalt(userAddress: Address): Hex {
	return keccak256(`${userAddress}`)
}

export function getFactoryInitializer(
	initHash: Hex,
	blockGuardSetterAddress: Address,
	blockSafeGuard: Address,
): Hex {
	const setGuardEncodedData: Hex = encodeFunctionData({
		abi: blockGuardSetterAbi,
		functionName: "setGuard",
		args: [blockSafeGuard],
	})

	const encodedFactoryInitializer: Hex = encodeFunctionData({
		abi: launchpadAbi,
		functionName: "preValidationSetup",
		args: [initHash, blockGuardSetterAddress, setGuardEncodedData],
	})

	return encodedFactoryInitializer
}

export function getUserOpInitCode(factoryInitializer: Hex, salt: Hex): Hex {
	const createProxyCalldata: Hex = encodeFunctionData({
		abi: safeProxyFactoryAbi,
		functionName: "createProxyWithNonce",
		args: [SAFE_LAUNCHPAD_7579, factoryInitializer, hexToBigInt(salt)],
	})
	const encodedInitCode = encodePacked(
		["address", "bytes"],
		[SAFE_PROXY_FACTORY, createProxyCalldata],
	)

	return encodedInitCode
}

export function getDomain(verifyingAddress: Address) {
	return {
		name: "TokenShield",
		version: "1",
		chainId: foundry.id,
		verifyingContract: verifyingAddress,
	}
}

export function getFormattedSignature(userSig: Hex, guardianSig: Hex): Hex {
	const sig1 = getSignatureSplit(userSig)
	const sig2 = getSignatureSplit(guardianSig)
	const v1 = sig1.yParity === 0 ? 27 : 28
	const v2 = sig2.yParity === 0 ? 27 : 28
	const encodedSignature = encodeAbiParameters(
		parseAbiParameters(
			"bytes32 r1, bytes32 s1, uint8 v1, bytes32 r2, bytes32 s2, uint8 v2",
		),
		[sig1.r, sig1.s, v1, sig2.r, sig2.s, v2],
	)
	console.log("R1- ", sig1.r)
	console.log("S1- ", sig1.s)
	console.log("V1- ", sig1.yParity)

	console.log("R1- ", sig2.r)
	console.log("S1- ", sig2.s)
	console.log("V1- ", sig2.yParity)
	return encodedSignature
}

export function getSignatureSplit(signature: Hex) {
	return parseSignature(signature)
}

export async function readTokenBalance(
	provider: PublicClient,
	smartAccountAddress: Address,
) {
	const data = await provider.readContract({
		address: ERC20_TOKEN,
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [smartAccountAddress],
	})
	return data
}

export async function getNonce(
	provider: PublicClient,
	smartAccountAddress: Address,
	validatorAddress: Address,
) {
	const nonce = await provider.readContract({
		address: TOKENSHIELD_SAFE_ADDRESS,
		abi: tsSafeAbi,
		functionName: "getNonce",
		args: [smartAccountAddress, validatorAddress],
	})
	console.log("Nonce")
	console.log(nonce)

	return nonce
}

export interface predictTsAddressReturn {
	address: Address
	initHash: Address
}
export async function predictTsAddress(
	walletClient: WalletClient,
): Promise<predictTsAddressReturn> {
	console.log("Starting predict Address")
	let address, initHash
	if (walletClient?.account) {
		initHash = await publicClient.readContract({
			address: SAFE_LAUNCHPAD_7579,
			abi: launchpadAbi,
			functionName: "hash",
			args: [
				getInitDataForLaunchPadSetup(
					walletClient?.account?.address as Address,
					ERC20_TOKEN,
					"13",
				),
			],
		})
		// console.log("InitData- ")
		// console.log(
		// 	getInitDataForLaunchPadSetup(walletClient?.account?.address as Address, ERC20_TOKEN, "13"),
		// )

		console.log("InitHash- ", initHash)

		address = await publicClient.readContract({
			address: SAFE_LAUNCHPAD_7579,
			abi: launchpadAbi,
			functionName: "predictSafeAddress",
			args: [
				SAFE_LAUNCHPAD_7579,
				SAFE_PROXY_FACTORY,
				SAFE_PROXY_CREATION_BYTECODE,
				getSalt(walletClient?.account?.address as Address),
				getFactoryInitializer(initHash, BLOCK_GUARD_SETTER, BLOCK_SAFE_GUARD),
			],
		})

		console.log("Predicted Address- ", address)
		return { address, initHash }
	} else {
		console.log("Wallet Client not connected!")
		return { address: "0x", initHash: "0x" }
	}
}
