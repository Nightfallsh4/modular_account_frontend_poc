import {
	parseAbi,
	Address,
	encodeFunctionData,
	hexToBigInt,
	encodeAbiParameters,
	keccak256,
	Hex,
	parseAbiParameter,
	encodePacked,
	parseEther,
} from "viem"
import {
	ERC20_TOKEN,
	GUARDIAN_VALIDATOR,
	RECOVERY_MODULE,
	SAFE_LAUNCHPAD_7579,
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

export function getSafe7579LaunchpadSetupData(userSigner: Address): Hex {
	const validators = [
		{
			module: GUARDIAN_VALIDATOR,
			initData: encodeAbiParameters(
				[parseAbiParameter("address owner")],
				[userSigner],
			),
		},
	]

	const encodedLaunchSetupData = encodeFunctionData({
		abi: launchpadAbi,
		functionName: "setupSafe",
		args: [
			{
				singleton: SAFE_SINGLETON,
				owners: [userSigner],
				threshold: hexToBigInt("0x1", { signed: true }),
				setupTo: SAFE_LAUNCHPAD_7579,
				setupData: getSetupData(),
				safe7579: TOKENSHIELD_SAFE_ADDRESS,
				validators: validators,
				callData: getCallExecutionData(),
			},
		],
	})

	return encodedLaunchSetupData
}

export function getSetupData(): Hex {
	const encodedSetupData = encodeFunctionData({
		abi: launchpadAbi,
		functionName: "initSafe7579",
		args: [
			TOKENSHIELD_SAFE_ADDRESS,
			[{ module: RECOVERY_MODULE, initData: "0x" }],
			[{ module: "0x", initData: "0x" }],
			[{ module: "0x", initData: "0x" }],
			[privateKeyToAddress(keccak256("0x1234567"))],
			1,
		],
	})
	return encodedSetupData
}

export function getCallExecutionData(): Hex {
	const mintEncodedData: Hex = encodeFunctionData({
		abi: erc20Abi,
		functionName: "mint",
		args: [parseEther("420")],
	})

	const encodedCallData: Hex = encodeFunctionData({
		abi: tsSafeAbi,
		functionName: "execute",
		args: [
			getSimpleSingleMode(),
			encodePacked(
				["address", "uint256", "bytes"],
				[ERC20_TOKEN, parseEther("0"), mintEncodedData],
			),
		],
	})

	return encodedCallData
}

export function getSimpleSingleMode(): Hex {
	return encodePacked(
		["bytes1", "bytes1", "bytes4", "bytes4", "bytes22"],
		["0x00", "0x00", "0x00000000", "0x00000000", "0x00"],
	)
}

export function getSalt(userAddress: Address): Hex {
	return keccak256(`${userAddress}12345678`)
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
