import { getAddress, Address, Hex } from "viem"

export const domain = {
	name: "TokenShield",
	version: "1",
	chainId: 11155111,
	verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
} as const

export interface UnsignedUserOperation {
	sender: Address
	nonce: number
	initCode: Hex
	callData: Hex
	accountGasLimits: Hex
	preVerificationGas: number
	gasFees: Hex
	paymasterAndData: Hex
}

// The named list of all type definitions
export const types = {
	UnsignedUserOperation: [
		{ name: "sender", type: "address" },
		{ name: "nonce", type: "uint256" },
		{ name: "initCode", type: "bytes" },
		{ name: "callData", type: "bytes" },
		{ name: "accountGasLimits", type: "bytes32" },
		{ name: "preVerificationGas", type: "uint256" },
		{ name: "gasFees", type: "bytes32" },
		{ name: "paymasterAndData", type: "bytes" },
	],
} as const
