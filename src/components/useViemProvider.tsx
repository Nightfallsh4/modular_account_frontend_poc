"use client"
import { useWallets } from "@privy-io/react-auth"
import { useEffect, useState } from "react"
import { Address, createWalletClient, custom, WalletClient } from "viem"
import { foundry } from "viem/chains"

export default function useViemProvider(isRendered: boolean) {
	const [walletClient, setWalletClient] = useState<WalletClient>()
	const { wallets } = useWallets()

	useEffect(() => {
		const getProvider = async () => {
			const wallet = wallets[0]
			console.log("Wallet from Privy")
			console.log(wallet)
			if (wallet) {
				const provider = await wallet?.getEthereumProvider()
				console.log("Provider from wallet Privy")

				console.log(provider)

				setWalletClient(
					createWalletClient({
						account: wallet?.address as Address,
						chain: foundry,
						transport: custom(provider),
					}),
				)
			}
		}
		getProvider()
	}, [isRendered, wallets])
	return walletClient
}
