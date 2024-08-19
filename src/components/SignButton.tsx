"use client"
import { Button } from "@mui/material"
import useViemProvider from "./useViemProvider"
import { useContext, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"

import { ContractContext } from "./ContractProvider"
import { publicClient } from "./utils/clients"
import initialTransactionSend from "./utils/initialTransaction"
import erc20TxSend from "./utils/erc20TxSend"
import { ERC20_TOKEN, SAFE_PROXY_FACTORY } from "./utils/constants"
import { Hex, parseEther } from "viem"
import getSmartAccount from "./utils/tsSmartAccount"
import { readContract } from "viem/actions"

export default function SignButton() {
	const { smartAccountAddress, initHash, smartAccountClient } =
		useContext(ContractContext)
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)
	console.log("Viem Provider")
	console.log(viemProvider)

	async function signTx() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			// const code = await publicClient.getCode({ address: smartAccountAddress })
			// console.log(code);

			// if (code === undefined) {
			// 	const hash = await initialTransactionSend(
			// 		smartAccountAddress,
			// 		initHash,
			// 		account[0],
			// 		viemProvider,
			// 	)
			// } else {
			// 	console.log("Account Already Deployed!!")
			// 	const hash = await erc20TxSend(
			// 		ERC20_TOKEN,
			// 		"3",
			// 		account[0],
			// 		smartAccountAddress,
			// 		account[0],
			// 		viemProvider,
			// 	)
			// }
			
			
			

			// console.log("Address")
			// console.log(smartAccountClient)
			// const return1 = await smartAccountClient.sendUserOperation(viemProvider, {
			// 	account: getSmartAccount(viemProvider),
			// })
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
