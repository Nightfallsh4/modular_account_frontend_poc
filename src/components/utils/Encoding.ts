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

export function getSafe7579LaunchpadSetupData(userSigner: Address): Hex {
	const abi = parseAbi([
		//  ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
		"function setupSafe(InitData calldata initData) external",
		`struct InitData { address singleton; address[] owners; uint256 threshold; address setupTo; bytes setupData; ISafe7579 safe7579; ModuleInit[] validators; bytes callData; }`,
	])
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
		abi: abi,
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
	const abi = parseAbi([
		//  ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
		"function initSafe7579(address safe7579, ModuleInit[] calldata executors, ModuleInit[] calldata fallbacks, ModuleInit[] calldata hooks, address[] calldata attesters, uint8 threshold) public",
		`struct ModuleInit { address module; bytes initData; }`,
	])

	const encodedSetupData = encodeFunctionData({
		abi: abi,
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
	const abi = parseAbi([
		"function execute(bytes32 mode, bytes calldata executionCalldata) external payable",
	])

	const erc20Abi = parseAbi(["function mint(uint256 _amount) external"])

	const mintEncodedData: Hex = encodeFunctionData({
		abi: erc20Abi,
		functionName: "mint",
		args: [parseEther("420")],
	})

	const encodedCallData: Hex = encodeFunctionData({
		abi: abi,
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
	const launchpadAbi = parseAbi([
		"function preValidationSetup( bytes32 initHash, address to, bytes calldata preInit ) external",
	])

	const blockGuardSetterAbi = parseAbi([
		"function setGuard(address guard) external",
	])

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
	const safeProxyFactoryAbi = parseAbi([
		"function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce) public returns (SafeProxy proxy)",
	])
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
