// import { createBundlerClient, ENTRYPOINT_ADDRESS_V07 } from "permissionless"
const permissionless = require("permissionless")
const viem = require("viem")
// import { http } from "viem"
const chains = require("viem/chains")
// import { foundry } from "viem/chains"

const ensureBundlerIsReady = async () => {
	const bundlerClient = permissionless.createBundlerClient({
		chain: chains.foundry,
		transport: viem.http("http://localhost:4337"),
		entryPoint: permissionless.ENTRYPOINT_ADDRESS_V07,
	})

	try {
		const chainId = await bundlerClient.chainId()
		console.log("Chain Id from Bundler Client")
		console.log(chainId)

		return
	} catch {
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}
}

const ensurePaymasterIsReady = async () => {
	try {
		// mock paymaster will open up this endpoint when ready
		const res = await fetch(`http://localhost:3000/ping`)
		const data = await res.json()
		if (data.message !== "pong") {
			throw new Error("paymaster not ready yet")
		}
		console.log("Paymaster Data- ")
		console.log(data)

		return
	} catch {
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}
}
ensureBundlerIsReady()
ensurePaymasterIsReady()