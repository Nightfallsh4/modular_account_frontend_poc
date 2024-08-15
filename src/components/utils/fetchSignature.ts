import { URLSearchParams } from "url"
import { UnsignedUserOperation } from "../data"
import axios from "axios"
import { Address } from "viem"

export async function fetchSignature(
	userOp: UnsignedUserOperation,
	smartAccountAddress: Address,
) {
	// const userOpData =  new URLSearchParams()
	// userOpData.append("sender", `${userOp.sender}`)
	// userOpData.append("nonce", `${userOp.nonce}`)
	// userOpData.append("initCode", `${userOp.initCode}`)
	// userOpData.append("callData", `${userOp.callData}`)
	// userOpData.append("accountGasLimits", `${userOp.accountGasLimits}`)
	// userOpData.append("preVerificationGas", `${userOp.preVerificationGas}`)
	// userOpData.append("gasFees", `${userOp.gasFees}`)
	// userOpData.append("paymasterAndData", `${userOp.paymasterAndData}`)
	userOp.nonce = userOp.nonce.toString()
	userOp.preVerificationGas = userOp.preVerificationGas.toString()
	// const data = await fetch("/api/getSignature", {
	// 	method: "POST",
	// 	headers: { "Content-Type": "application/x-www-form-urlencoded" },
	//     body: JSON.stringify(userOp)
	// })
	const data = await axios.post("/api/getSignature", {
		userOp: userOp,
		smartAccountAddress: smartAccountAddress,
	})
	// console.log(data.data.signature)
    return data.data.signature
}
