"use client"
import { Box, Container, Grid, Typography } from "@mui/material"
import LoginButton from "./LoginButton"

export default function Navbar() {
	return (
		<>
			<Grid container>
				<Grid item xs={8}>
					<Container>
						<Typography variant="h3" component="h3">
							Modular Account POC
						</Typography>
					</Container>
				</Grid>
				<Grid item xs={4}>
					<LoginButton />
				</Grid>
			</Grid>
		</>
	)
}
