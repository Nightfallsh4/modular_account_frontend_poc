import { createContext, ReactNode, useEffect, useState } from "react"
import { Address, http } from "viem"
import { paymasterClient, pimlicoBundlerClient } from "./utils/clients"

import {
	predictTsAddress,
	predictTsAddressReturn,
} from "./utils/Encoding"
import useViemProvider from "./useViemProvider"
import { usePrivy } from "@privy-io/react-auth"
import {
	createSmartAccountClient,
	ENTRYPOINT_ADDRESS_V07,
} from "permissionless"
import { foundry } from "viem/chains"
import { erc7579Actions } from "permissionless/actions/erc7579"

import toTsAccount from "./utils/tsSmartAccount"

interface ContextProps {
	smartAccountAddress: `0x${string}`
	setSAAddress: any
	isLogin: boolean
	walletClient: any
	initHash: Address
	smartAccountClient: any
}
const initialValue: ContextProps = {
	smartAccountAddress: "0x",
	setSAAddress: {},
	isLogin: false,
	walletClient: {},
	initHash: "0x",
	smartAccountClient: "",
}

export const ContractContext = createContext(initialValue)

interface ContractProps {
	children: ReactNode
}

export default function ContractProvider({ children }: ContractProps) {
	const [smartAccountAddress, setSAAddress] = useState<Address>("0x")
	const [initHash, setInitHash] = useState<Address>("0x")
	const [isLogin, setisLogin] = useState<boolean>(false)
	// const [publicClient, setPublicClient] = useState<PublicClient>()
	const [smartAccountClient, setSmartAccountClient] = useState<any>()

	const { ready, authenticated } = usePrivy()

	useEffect(() => {
		const isLogin = !ready || (ready && authenticated)
		setisLogin(isLogin)
	}, [ready, authenticated])

	const walletClient = useViemProvider(isLogin)

	if (walletClient) {
		predictTsAddress(walletClient).then((value: predictTsAddressReturn) => {
			setSAAddress(value.address)
			setInitHash(value.initHash)
		})
	}
	const value = {
		smartAccountAddress,
		setSAAddress,
		isLogin,
		walletClient,
		initHash,
		smartAccountClient,
	}
	useEffect(() => {
		if (walletClient) {
			toTsAccount(walletClient).then((tsAccount) => {
				console.log("SmartAccount- ")
				console.log(tsAccount)
				const smartAccountClient = createSmartAccountClient({
					account: tsAccount,
					entryPoint: ENTRYPOINT_ADDRESS_V07,
					chain: foundry,
					bundlerTransport: http("http://localhost:4337"),
					middleware: {
						gasPrice: async () => {
							return (await pimlicoBundlerClient.getUserOperationGasPrice())
								.fast
						},
						sponsorUserOperation: paymasterClient.sponsorUserOperation,
					},
				}).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }))
				if (smartAccountClient) {
					console.log("Smart Account Client")
					console.log(smartAccountClient)

					setSmartAccountClient(smartAccountClient)
				}
			})
		}
	}, [walletClient])

	return (
		<ContractContext.Provider value={value}>
			{children}
		</ContractContext.Provider>
	)
}
