"use client"
import { Button } from "@mui/material"
import useViemProvider from "./useViemProvider"
import { domain, types } from "./data"
import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { keccak256 } from "viem"

export default function SignButton() {
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)
	console.log("Viem Provider")
	console.log(viemProvider)

	async function signTx() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			// console.log(account)

			const signature = await viemProvider.signTypedData({
				account: account[0],
				domain,
				types,
				primaryType: "UnsignedUserOperation",
				message: {
					sender: account[0],
					nonce: 0,
					initCode: "0xabcdf123456789",
					callData: "0x",
					accountGasLimits: keccak256("0x10000"),
					preVerificationGas: 100000,
					gasFees: keccak256("0x10000"),
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
