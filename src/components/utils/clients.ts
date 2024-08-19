import { createBundlerClient, ENTRYPOINT_ADDRESS_V07, providerToSmartAccountSigner } from "permissionless";
import { SmartAccountSigner } from "permissionless/accounts";
import { pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { http, createPublicClient, Hash, SignableMessage, TypedData, TypedDataDefinition } from "viem";
import { foundry } from "viem/chains";
 
export const publicClient = createPublicClient({
  transport: http("http://localhost:8545"), 
});
 
export const pimlicoBundlerClient = createPimlicoBundlerClient({
	transport: http("http://localhost:4337"),
	entryPoint: ENTRYPOINT_ADDRESS_V07,
}).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07))
 
export const paymasterClient = createPimlicoPaymasterClient({
  chain: foundry,
  transport: http("http://localhost:3000"), 
  entryPoint: ENTRYPOINT_ADDRESS_V07,
}).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07));


