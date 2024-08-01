import { Box, Button, Container, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
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
import { Address } from "viem"
import { ContractContext } from "./ContractProvider"

export default function PredictButton() {
	const { isLogin, smartAccountAddress } = useContext(ContractContext)

	return (
		<>
			<Container>
				<Box>
					{isLogin ? (
						<Typography variant="h5" component="h5">
							Address- {smartAccountAddress}
						</Typography>
					) : null}
				</Box>
			</Container>
		</>
	)
}
