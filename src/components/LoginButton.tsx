"use client"
import { Button } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
import { useEffect, useState } from "react"
export default function LoginButton() {
	const [disableLogin, setDisableLogin] = useState<boolean>(false)
	const { ready, authenticated, login, logout } = usePrivy()

	useEffect(() => {
		const disableLogin = !ready || (ready && authenticated)
		setDisableLogin(disableLogin)
	}, [ready, authenticated])
	
	return (
		<>
			{" "}
			{disableLogin ? (
				<Button variant="contained" onClick={logout}>
					Logout
				</Button>
			) : (
				<Button disabled={disableLogin} onClick={login} variant="contained">
					Login
				</Button>
			)}
		</>
	)
}
