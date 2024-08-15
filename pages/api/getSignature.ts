import { types } from "@/components/data"
import { GUARDIAN_VALIDATOR } from "@/components/utils/constants"
import { getDomain } from "@/components/utils/Encoding"
import { privateWalletClient } from "@/components/utils/privateWallet"
import { NextApiRequest, NextApiResponse } from "next"


export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { userOp, smartAccountAddress } = req.body
	// const data  = JSON.parse(userOp)
	// console.log(userOp)
	userOp.nonce = BigInt(userOp.nonce)
	userOp.preVerificationGas = BigInt(userOp.preVerificationGas)

	const signature = await privateWalletClient.signTypedData({
		domain: getDomain(GUARDIAN_VALIDATOR),
		types: types,
		primaryType: "UnsignedUserOperation",
		message: userOp,
	})
	
	// console.log("Signature- ", signature)
	

	return res.status(200).json({ signature: signature })
}
