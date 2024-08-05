"use client"
import ContractProvider from "@/components/ContractProvider"
import PredictButton from "@/components/PredictButton"
import TestButton from "@/components/TestButton"
import dynamic from "next/dynamic"

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })

const SendEth = dynamic(() => import("@/components/sendEth"), { ssr: false })
export default function Home() {
	return (
		<ContractProvider>
			<>
				<Navbar />
				<PredictButton />
				<SendEth />
				<TestButton/>
			</>
		</ContractProvider>
	)
}
