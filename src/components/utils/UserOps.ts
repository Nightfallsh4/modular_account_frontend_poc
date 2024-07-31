import { zeroAddress } from "viem"
import { UnsignedUserOperation } from "../data"

export function getDefaultUserOp(): UnsignedUserOperation {
	const userOp: UnsignedUserOperation = {
		sender: zeroAddress,
		nonce: 0,
		initCode: `0x`,
		callData: `0x`,
		accountGasLimits: "0x",
		preVerificationGas: 100000,
		gasFees: "0x",
		paymasterAndData: "0x",
	}
	return userOp
}
