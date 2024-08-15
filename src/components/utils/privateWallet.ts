import { createWalletClient, Hex, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
 
export const privateWalletClient = createWalletClient({
  account: privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as Hex),
  transport: http("http://localhost:8545")
})