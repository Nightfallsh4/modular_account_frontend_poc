import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Provider"
import { Box, Container } from "@mui/material"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Modular Account POC",
	description: "created by 0xnightfall.eth",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<Providers>
				<body className={inter.className}>
					<Container sx={{ my: "5rem", backgroundColor: "black" }}>
						<Box>{children}</Box>
					</Container>
				</body>
			</Providers>
		</html>
	)
}
