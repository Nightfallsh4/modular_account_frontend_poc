"use client"
import { Button } from "@mui/material"
import useViemProvider from "./useViemProvider"
import { domain, types } from "./data"
import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"

export default function SignButton() {
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)
	console.log("Viem Provider")
	console.log(viemProvider)

	async function signTx() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			console.log(account)

			const signature = await viemProvider.signTypedData({
				account: account[0],
				domain,
				types,
				primaryType: "Mail",
				message: {
					from: {
						name: "Cow",
						wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
					},
					to: {
						name: "Bob",
						wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
					},
					contents: "Hello, Bob!",
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
