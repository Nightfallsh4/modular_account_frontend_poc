"use client"
import { Box, Container } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
import SignButton from "./SignButton"
import { useContext, useEffect, useState } from "react"
import { ContractContext } from "./ContractProvider"

export default function SendEth() {
	const {isLogin} = useContext(ContractContext)
	const { ready, authenticated } = usePrivy()

	
	return (
		<>
			<Container>
				<Box>{isLogin ? <SignButton /> : null}</Box>
				
			</Container>
		</>
	)
}
