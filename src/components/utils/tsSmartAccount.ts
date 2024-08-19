import {
	Address,
	concat,
	concatHex,
	encodeFunctionData,
	encodePacked,
	Hex,
	hexToBigInt,
	pad,
	toHex,
	WalletClient,
} from "viem"
import {
	getDomain,
	getEncodedCallForExecute,
	getFactoryInitializer,
	getFormattedSignature,
	getNonce,
	getSafe7579LaunchpadSetupData,
	getSalt,
	getSignatureSplit,
	getSimpleSingleMode,
	predictTsAddress,
} from "./Encoding"
import {
	chainId,
	ENTRYPOINT_ADDRESS_V07,
	isSmartAccountDeployed,
} from "permissionless"
import {
	SignTransactionNotSupportedBySmartAccount,
	toSmartAccount,
} from "permissionless/accounts"
import {
	EntryPoint,
	GetEntryPointVersion,
	UserOperation,
} from "permissionless/types"
import {
	BLOCK_GUARD_SETTER,
	BLOCK_SAFE_GUARD,
	GUARDIAN_VALIDATOR,
	SAFE_LAUNCHPAD_7579,
	SAFE_PROXY_FACTORY,
} from "./constants"
import { publicClient } from "./clients"
import { types, UnsignedUserOperation } from "../data"
import { fetchSignature } from "./fetchSignature"
import { safeProxyFactoryAbi } from "./abi"

interface EncodeCalldataInput {
	to: Address
	value: bigint
	data: Hex
}
function getPaymasterAndData(unpackedUserOperation: UserOperation<"v0.7">) {
	return unpackedUserOperation.paymaster
		? concat([
				unpackedUserOperation.paymaster,
				pad(
					toHex(
						unpackedUserOperation.paymasterVerificationGasLimit || BigInt(0),
					),
					{
						size: 16,
					},
				),
				pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || BigInt(0)), {
					size: 16,
				}),
				unpackedUserOperation.paymasterData || ("0x" as Hex),
		  ])
		: "0x"
}

export default async function toTsAccount(walletClient: WalletClient) {
	const owner = (await walletClient.getAddresses())[0]
	const { address: tsAccountAddress, initHash } = await predictTsAddress(
		walletClient,
	)
	if (tsAccountAddress === "0x" || initHash === "0x") {
		throw "Account Not Predicted"
	}
	let safeDeployed = await isSmartAccountDeployed(
		walletClient,
		tsAccountAddress,
	)

	const tsAccount = toSmartAccount({
		address: tsAccountAddress,
		client: publicClient,
		publicKey: tsAccountAddress,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
		source: "SafeSmartAccount",
		async signMessage({ message }) {
			throw new Error("Sign Message Not Enabled")
		},
		async signTransaction(_, __) {
			throw new SignTransactionNotSupportedBySmartAccount()
		},
		async signTypedData<
			const TTypedData extends TypedData | Record<string, unknown>,
			TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData,
		>(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
			throw new Error("Sign Message Not Enabled")
		},
		async getNonce(key?: bigint) {
			return getNonce(publicClient, tsAccountAddress, GUARDIAN_VALIDATOR)
		},
		async signUserOperation(userOperation: UserOperation<"v0.7">) {
			const validUntil = 0
			const validAfter = 0
			const userOp: UnsignedUserOperation = {
				sender: tsAccountAddress,
				callData: userOperation.callData,
				nonce: userOperation.nonce,
				initCode: userOperation.initCode ?? "0x",
				accountGasLimits: toHex(userOperation.callGasLimit, {size:32}),
				gasFees: toHex(userOperation.maxPriorityFeePerGas, {size:32}),
				preVerificationGas: userOperation.preVerificationGas,
			}

			let isDeployed = false

			if (userOperation.factory && userOperation.factoryData) {
				userOp.initCode = await this.getInitCode()
			}
			// message.paymasterAndData = getPaymasterAndData(userOperation)
			isDeployed = !userOperation.factory

			let verifyingContract = GUARDIAN_VALIDATOR

			if (SAFE_LAUNCHPAD_7579 && !isDeployed) {
				verifyingContract = userOperation.sender
			}
			console.log(userOp)

			const signature = await walletClient.signTypedData({
				account: owner,
				domain: getDomain(GUARDIAN_VALIDATOR),
				types,
				primaryType: "UnsignedUserOperation",
				message: userOp,
			})
			const backendSig = await fetchSignature(userOp, tsAccountAddress)

			const encodedSignature = getFormattedSignature(signature, backendSig)
			return encodedSignature
		},
		async getInitCode() {
			safeDeployed =
				safeDeployed ||
				(await isSmartAccountDeployed(walletClient, tsAccountAddress))

			if (safeDeployed) return "0x"
			const factory = await this.getFactory()
			const factoryData = await this.getFactoryData()
			return encodePacked(["address", "bytes"], [factory, factoryData])
		},
		async getFactory() {
			safeDeployed =
				safeDeployed ||
				(await isSmartAccountDeployed(walletClient, tsAccountAddress))

			if (safeDeployed) return undefined

			return SAFE_PROXY_FACTORY
		},
		async getFactoryData() {
			safeDeployed =
				safeDeployed ||
				(await isSmartAccountDeployed(walletClient, tsAccountAddress))

			if (safeDeployed) return undefined

			const factoryInitializer = getFactoryInitializer(
				initHash,
				BLOCK_GUARD_SETTER,
				BLOCK_SAFE_GUARD,
			)
			const createProxyCalldata: Hex = encodeFunctionData({
				abi: safeProxyFactoryAbi,
				functionName: "createProxyWithNonce",
				args: [
					SAFE_LAUNCHPAD_7579,
					factoryInitializer,
					hexToBigInt(getSalt(owner)),
				],
			})
			return createProxyCalldata
		},
		async encodeDeployCallData(_) {
			throw new Error("Safe account doesn't support account deployment")
		},
		async encodeCallData(args) {
			const isArray = Array.isArray(args)

			// First transaction will be slower because we need to enable 7579 modules
			safeDeployed =
				safeDeployed ||
				(await isSmartAccountDeployed(walletClient, tsAccountAddress))

			if (!safeDeployed) {
				// const initData = get7579LaunchPadInitData({
				// 	safe4337ModuleAddress,
				// 	safeSingletonAddress,
				// 	erc7579LaunchpadAddress,
				// 	owner: viemSigner.address,
				// 	validators,
				// 	executors,
				// 	fallbacks,
				// 	hooks,
				// 	attesters,
				// 	attestersThreshold,
				// })
				return getSafe7579LaunchpadSetupData(owner)
			}

			let to: Address = args[0].to
			let value: bigint = args[0].value
			let data: Hex = args[0].data
			let operationType = 0

			return getEncodedCallForExecute(to, value, data)
		},
		async getDummySignature(_userOperation) {
			return "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
		},
	})

	return tsAccount
}
