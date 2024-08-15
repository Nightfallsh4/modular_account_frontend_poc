"use client"
import { Button } from "@mui/material"
import useViemProvider from "./useViemProvider"
import { types, UnsignedUserOperation } from "./data"
import { useContext, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import {
	BaseError,
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	Hex,
	hexToBigInt,
	keccak256,
	padHex,
	encodePacked,
} from "viem"
import { ContractContext } from "./ContractProvider"
import {
	getFactoryInitializer,
	getSafe7579LaunchpadSetupData,
	getSalt,
	getUserOpInitCode,
	getDomain,
	getFormattedSignature,
	readTokenBalance,
	getNonce,
} from "./utils/Encoding"
import {
	BLOCK_GUARD_SETTER,
	BLOCK_SAFE_GUARD,
	GUARDIAN_VALIDATOR,
} from "./utils/constants"
import { fetchSignature } from "./utils/fetchSignature"
import { publicClient } from "./utils/clients"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { entryPointAbi } from "./utils/abi"
import { foundry, localhost } from "viem/chains"

export default function SignButton() {
	const { smartAccountAddress, initHash } = useContext(ContractContext)
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)
	console.log("Viem Provider")
	console.log(viemProvider)

	async function signTx() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			// console.log(account)
			// const signer = await viemProvider.account

			const _factoryInitializer = getFactoryInitializer(
				initHash,
				BLOCK_GUARD_SETTER,
				BLOCK_SAFE_GUARD,
			)
			console.log("FactoryInitializer")

			console.log(_factoryInitializer)

			const _initCode = getUserOpInitCode(
				_factoryInitializer,
				getSalt(account[0]),
			)
			console.log("InitCode Hash- ")
			console.log(initHash)

			const userOp: UnsignedUserOperation = {
				sender: smartAccountAddress,
				nonce: await getNonce(
					publicClient,
					smartAccountAddress,
					GUARDIAN_VALIDATOR,
				),
				initCode: _initCode,
				callData: getSafe7579LaunchpadSetupData(account[0]),
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
				account: account[0],
				domain: getDomain(GUARDIAN_VALIDATOR),
				types,
				primaryType: "UnsignedUserOperation",
				message: userOp,
			})
			console.log("Signature- ")

			console.log(signature)
			console.log("Fetching Backend Sig- ")
			const backendSig = await fetchSignature(userOp, smartAccountAddress)

			console.log(backendSig)
			const encodedSignature = getFormattedSignature(signature, backendSig)
			console.log(encodedSignature)

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
			const priorTokenBalance = await readTokenBalance(
				publicClient,
				userOp.sender,
			)
			console.log(priorTokenBalance)
			try {
				// const some = await publicClient.request({
				// 	method: "anvil_enableTraces",
				// 	params: undefined
				// })
				const { request, result } = await publicClient.simulateContract({
					account: account[0],
					abi: entryPointAbi,
					functionName: "handleOps",
					args: [[signedUserOp], "0x0000000000000000000000000000000000000069"],
					address: ENTRYPOINT_ADDRESS_V07,
					chain: foundry,
				})

				console.log(request)
				console.log(result)

				const hash = await viemProvider.writeContract(request)
				console.log(hash)
				const transaction = await publicClient.getTransaction({
					hash: hash,
				})
				console.log(transaction)
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
		} else {
			console.log("Viem proivder is null")
		}
	}

	return (
		<>
			{" "}
			<Button variant="contained" onClick={signTx}>
				Sign
			</Button>
		</>
	)
}
