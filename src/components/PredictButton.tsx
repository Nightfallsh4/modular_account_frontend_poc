import { Box, Button, Container } from "@mui/material"
import SignButton from "./SignButton"
import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"

export default function PredictButton() {
	const [isLogin, setisLogin] = useState<boolean>(false)
	const { ready, authenticated } = usePrivy()

    

	useEffect(() => {
		const isLogin = !ready || (ready && authenticated)
		setisLogin(isLogin)
	}, [ready, authenticated])
	return (
		<>
			<Container>
				<Box>
					{isLogin ? (
						<Button variant="contained" onClick={}>Predict Address</Button>
					) : null}
				</Box>
			</Container>
		</>
	)
}
