"use client"
import dynamic from "next/dynamic"

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })

const SendEth = dynamic(() => import("@/components/sendEth"), { ssr: false })
export default function Home() {
	return (
		<>
			<Navbar />
			<SendEth />
		</>
	)
}
