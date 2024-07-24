"use client"
import { Box, Container } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
import SignButton from "./SignButton"

export default function SendEth() {
	const { ready, authenticated } = usePrivy()
	const isLogin = !ready || (ready && authenticated)
	return (
		<>
			<Container>
				<Box>{isLogin ? <SignButton /> : null}</Box>
			</Container>
		</>
	)
}
