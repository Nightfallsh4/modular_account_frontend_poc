import { SmartAccountSigner } from 'permissionless/accounts';
import { Address, Hash, SignableMessage, TypedData, TypedDataDefinition } from 'viem';
// import { coinbase, toSmartAccount } from 'viem/account-abstraction'

export default function getSmartAccount(smartAccountAddress: Address) {
    const TokenshieldSigner: SmartAccountSigner = {
        address: smartAccountAddress,
        signMessage: function ({ message }: { message: SignableMessage; }): Promise<Hash> {
          throw new Error("Function not implemented.");
        },
        signTypedData: function <const typedData extends TypedData | Record<string, unknown>, primaryType extends keyof typedData | "EIP712Domain" = keyof typedData>(typedDataDefinition: TypedDataDefinition<typedData, primaryType>): Promise<Hash> {
          throw new Error("Function not implemented.");
        },
        publicKey: "0x",
        source: "",
        type: "local"
      }

      return
}