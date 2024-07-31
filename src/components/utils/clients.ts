import { createBundlerClient, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { http, createPublicClient } from "viem";
import { foundry } from "viem/chains";
 
export const publicClient = createPublicClient({
  transport: http("http://localhost:8545"), 
});
 
export const bundlerClient = createBundlerClient({
  chain: foundry,
  transport: http("http://localhost:4337"), 
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});
 
export const paymasterClient = createPimlicoPaymasterClient({
  chain: foundry,
  transport: http("http://localhost:3000"), 
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});