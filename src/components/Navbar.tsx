import { Box, Button, Container, Grid, Typography } from "@mui/material"

export default function Navbar() {
	return (
		<>
			<Container sx={{ my: "5rem", backgroundColor: "black" }}>
				<Box>
					<Grid container>
						<Grid item xs={8}>
							<Container>
								<Typography variant="h3" component="h3">
									Modular Account POC
								</Typography>
							</Container>
						</Grid>
						<Grid item xs={4}>
							<Button variant="contained">Login</Button>
						</Grid>
					</Grid>
				</Box>
			</Container>
		</>
	)
}
