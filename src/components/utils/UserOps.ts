import { hexToBigInt, zeroAddress } from "viem"
import { UnsignedUserOperation } from "../data"

export function getDefaultUserOp(): UnsignedUserOperation {
	const userOp: UnsignedUserOperation = {
		sender: zeroAddress,
		nonce: hexToBigInt("0x00"),
		initCode: `0x`,
		callData: `0x`,
		accountGasLimits: "0x",
		preVerificationGas: hexToBigInt("0x1000000"),
		gasFees: "0x",
		paymasterAndData: "0x",
	}
	return userOp
}
