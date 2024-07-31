"use client"

import { PrivyProvider } from "@privy-io/react-auth"

import { sepolia, localhost } from "viem/chains"

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
			config={{
				appearance: {
					accentColor: "#6A6FF5",
					theme: "#222224",
					showWalletLoginFirst: false,
					logo: "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy-dark.png",
				},
				loginMethods: [
					"wallet",
					"email",
					"google",
					"apple",
					"github",
					"twitter",
					"discord",
					"farcaster",
				],
                defaultChain: localhost,
                supportedChains: [localhost],
				fundingMethodConfig: {
					moonpay: {
						useSandbox: true,
					},
				},
				embeddedWallets: {
					createOnLogin: "users-without-wallets",
					requireUserPasswordOnCreate: false,
				},
				mfa: {
					noPromptOnMfaRequired: false,
				},
			}}
		>
			{children}
		</PrivyProvider>
	)
}
