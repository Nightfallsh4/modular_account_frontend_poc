import { Box, Container, Typography } from "@mui/material"
import { useContext } from "react"

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
