"use client"
import { Box, Container } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
import SignButton from "./SignButton"
import { useEffect, useState } from "react"

export default function SendEth() {
	const [isLogin, setisLogin] = useState<boolean>(false)
	const { ready, authenticated } = usePrivy()

	useEffect(() => {
		const isLogin = !ready || (ready && authenticated)
		setisLogin(isLogin)
	}, [ready, authenticated])
	
	return (
		<>
			<Container>
				<Box>{isLogin ? <SignButton /> : null}</Box>
			</Container>
		</>
	)
}
