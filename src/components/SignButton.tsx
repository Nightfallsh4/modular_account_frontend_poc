"use client"
import { Button } from "@mui/material"
import useViemProvider from "./useViemProvider"
import { domain, types } from "./data"
import { useContext, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { hexToBigInt, keccak256, padHex } from "viem"
import { ContractContext } from "./ContractProvider"
import { getFactoryInitializer, getSafe7579LaunchpadSetupData, getSalt, getUserOpInitCode } from "./utils/Encoding"
import { BLOCK_GUARD_SETTER, BLOCK_SAFE_GUARD } from "./utils/constants"

export default function SignButton() {
	const {smartAccountAddress, initHash} = useContext(ContractContext)
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)
	console.log("Viem Provider")
	console.log(viemProvider)

	async function signTx() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			// console.log(account)
			// const signer = await viemProvider.account
			const _factoryInitializer = getFactoryInitializer(initHash,BLOCK_GUARD_SETTER, BLOCK_SAFE_GUARD)
			const _initCode = getUserOpInitCode(_factoryInitializer,getSalt(account[0]))
			const signature = await viemProvider.signTypedData({
				account: account[0],
				domain,
				types,
				primaryType: "UnsignedUserOperation",
				message: {
					sender: smartAccountAddress,
					nonce: hexToBigInt("0x00"),
					initCode: _initCode,
					callData: getSafe7579LaunchpadSetupData(account[0]),
					accountGasLimits: padHex("0x1000000", {size: 32}),
					preVerificationGas: hexToBigInt("0x1000000"),
					gasFees: padHex("0x1000000", {size: 32}),
					paymasterAndData: "0x"
				},
			})
			console.log("Signature- ")

			console.log(signature)
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
