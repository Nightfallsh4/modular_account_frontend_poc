"use client"
import { Button } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
import { useContext } from "react"
import { ContractContext } from "./ContractProvider"
export default function LoginButton() {
	const {isLogin} = useContext(ContractContext)
	const { login, logout } = usePrivy()

	
	return (
		<>
			{" "}
			{isLogin ? (
				<Button variant="contained" onClick={logout}>
					Logout
				</Button>
			) : (
				<Button disabled={isLogin} onClick={login} variant="contained">
					Login
				</Button>
			)}
		</>
	)
}
