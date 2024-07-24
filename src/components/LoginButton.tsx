"use client"
import { Button } from "@mui/material"
import { usePrivy } from "@privy-io/react-auth"
export default function LoginButton() {
	const { ready, authenticated, login, logout } = usePrivy()
	const disableLogin = !ready || (ready && authenticated)
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
