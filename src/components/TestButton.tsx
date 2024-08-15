import { Button } from "@mui/material"
import { fetchSignature } from "./utils/fetchSignature"
import { usePrivy } from "@privy-io/react-auth"
import useViemProvider from "./useViemProvider"
import { keccak256 } from "viem"

export default function TestButton() {
	const { ready, authenticated } = usePrivy()

	const viemProvider = useViemProvider(ready && authenticated)

	async function getSignature() {
		if (viemProvider) {
			const account = await viemProvider.getAddresses()
			const sig = await viemProvider?.signMessage({account:account[0], message: "0x123112158416584651afef61651611bddcaeeeffcbbbbb51651165e4E54f4541562aabCdFaa1ae458f9v6c1473fbb578301518bbbbb51651165e4E54f4541562aabCdFaa1ae458f9v6c1473fbb57830151812311215841658465161651611bddcae1165e4E54f4541562aabCdFaa1ae458f9v6c1473fbb57830151"})
		}
	}
	return (
		<Button variant="contained" onClick={getSignature}>
			Test
		</Button>
	)
}
