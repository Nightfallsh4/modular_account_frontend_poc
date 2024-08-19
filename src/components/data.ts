import { getAddress, Address, Hex } from "viem"



export interface UnsignedUserOperation {
	sender: Address
	nonce: bigint
	initCode: Hex
	callData: Hex
	accountGasLimits: Hex
	preVerificationGas: bigint
	gasFees: Hex
}

export interface SignedUserOp extends UnsignedUserOperation {
	signature: Hex
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
	],
} as const
