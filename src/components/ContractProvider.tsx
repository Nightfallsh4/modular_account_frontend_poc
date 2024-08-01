import { createContext, ReactNode, useEffect, useState } from "react"
import { Address } from "viem"
import { publicClient } from "./utils/clients"
import { BLOCK_GUARD_SETTER, BLOCK_SAFE_GUARD, SAFE_LAUNCHPAD_7579, SAFE_PROXY_CREATION_BYTECODE, SAFE_PROXY_FACTORY } from "./utils/constants"
import { launchpadAbi } from "./utils/abi"
import { getFactoryInitializer, getInitDataForLaunchPadSetup, getSalt } from "./utils/Encoding"
import useViemProvider from "./useViemProvider"
import { usePrivy } from "@privy-io/react-auth"

interface ContextProps {
    smartAccountAddress: `0x${string}`;
    setSAAddress: any;
    isLogin: boolean;
    walletClient: any;
}
const initialValue:ContextProps = {smartAccountAddress: "0x", setSAAddress:{}, isLogin: false, walletClient: {}}

export const ContractContext = createContext(initialValue)

interface ContractProps {
    children: ReactNode;
  }

export default function ContractProvider({children}: ContractProps) {
    const [smartAccountAddress, setSAAddress] = useState<Address>("0x")
    const [isLogin, setisLogin] = useState<boolean>(false)
	
	const { ready, authenticated } = usePrivy()
	

	
	useEffect(() => {
		const isLogin = !ready || (ready && authenticated)
		setisLogin(isLogin)
	}, [ready, authenticated ])

    const walletClient = useViemProvider(isLogin)


	const predictAddress = async () => {
		console.log("Starting predict Address")
		const initHash = await publicClient.readContract({
			address: SAFE_LAUNCHPAD_7579,
			abi: launchpadAbi,
			functionName: "hash",
			args: [getInitDataForLaunchPadSetup(walletClient.account?.address)],
		})
		console.log("InitHash- ", initHash)

		const erc7579Address = await publicClient.readContract({
			address: SAFE_LAUNCHPAD_7579,
			abi: launchpadAbi,
			functionName: "predictSafeAddress",
			args: [
				SAFE_LAUNCHPAD_7579,
				SAFE_PROXY_FACTORY,
				SAFE_PROXY_CREATION_BYTECODE,
				getSalt(await walletClient.address),
				getFactoryInitializer(initHash, BLOCK_GUARD_SETTER, BLOCK_SAFE_GUARD),
			],
		})

		console.log("Predicted Address- ", erc7579Address)

		return erc7579Address
	}
	predictAddress().then((value) => {
		setSAAddress(value)
	})

    const value = {smartAccountAddress, setSAAddress, isLogin, walletClient}

	return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>
}
