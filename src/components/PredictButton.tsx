import { Box, Button, Container } from "@mui/material"
import SignButton from "./SignButton"
import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { publicClient } from "./utils/clients"
import {
	BLOCK_GUARD_SETTER,
	BLOCK_SAFE_GUARD,
	SAFE_LAUNCHPAD_7579,
	SAFE_PROXY_CREATION_BYTECODE,
	SAFE_PROXY_FACTORY,
} from "./utils/constants"
import { launchpadAbi } from "./utils/abi"
import {
	getFactoryInitializer,
	getInitDataForLaunchPadSetup,
	getSalt,
} from "./utils/Encoding"
import useViemProvider from "./useViemProvider"

export default function PredictButton() {
	const [isLogin, setisLogin] = useState<boolean>(false)
	const { ready, authenticated } = usePrivy()
	const walletClient = useViemProvider(isLogin)

	const predictAddress = async () => {
		console.log("Starting predict Address")
		const initHash = await publicClient.readContract({
			address: SAFE_LAUNCHPAD_7579,
			abi: launchpadAbi,
			functionName: "hash",
			args: [getInitDataForLaunchPadSetup(walletClient.account.address)],
		})
		console.log("InitHash- ", initHash)

		const data = await publicClient.readContract({
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

		console.log("Predicted Address- ", data)
	}

	useEffect(() => {
		const isLogin = !ready || (ready && authenticated)
		setisLogin(isLogin)
	}, [ready, authenticated])
	return (
		<>
			<Container>
				<Box>
					{isLogin ? (
						<Button variant="contained" onClick={predictAddress}>
							Predict Address
						</Button>
					) : null}
				</Box>
			</Container>
		</>
	)
}
