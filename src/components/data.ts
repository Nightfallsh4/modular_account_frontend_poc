export const domain = {
	name: "Ether Mail",
	version: "1",
	chainId: 11155111,
	verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
} as const

// The named list of all type definitions
export const types = {
	Person: [
		{ name: "name", type: "string" },
		{ name: "wallet", type: "address" },
	],
	Mail: [
		{ name: "from", type: "Person" },
		{ name: "to", type: "Person" },
		{ name: "contents", type: "string" },
	],
} as const
