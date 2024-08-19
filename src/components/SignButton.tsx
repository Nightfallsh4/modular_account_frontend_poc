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
import {
	encodeFunctionData,
	encodePacked,
	Hex,
	hexToBigInt,
	padHex,
	parseEther,
} from "viem"
import getSmartAccount from "./utils/tsSmartAccount"
import { readContract } from "viem/actions"
import toTsAccount from "./utils/tsSmartAccount"
import { getMintCallExecutionData } from "./utils/Encoding"
import { erc20Abi } from "./utils/abi"

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

			console.log("Address")
			console.log(smartAccountClient)
			console.log("Public Client")
			console.log(publicClient)

			// const tsAccount = await toTsAccount(viemProvider)
			// const partialUserOp = {
			// 	sender: tsAccount.address,
			// 	nonce: await tsAccount.getNonce(BigInt("0")),
			// 	factory: await tsAccount.getFactory(),
			// 	factoryData: await tsAccount.getFactoryData(),
			// 	callData: getMintCallExecutionData(ERC20_TOKEN, "13"),
			// 	callGasLimit: hexToBigInt("0x20000002000000"),
			// 	preVerificationGas: hexToBigInt("0x1000000000"),
			// 	maxFeePerGas: BigInt("1"),
			// 	maxPriorityFeePerGas: "0x01",
			// }

			const return2 = await smartAccountClient.sendTransaction({
				to: ERC20_TOKEN,
				data: encodeFunctionData({
					abi: erc20Abi,
					functionName: "mint",
					args: [parseEther("13")],
				}),
			})
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
