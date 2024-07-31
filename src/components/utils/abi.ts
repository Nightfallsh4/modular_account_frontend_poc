import { parseAbi } from "viem"

export const launchpadAbi = parseAbi([
	"function setupSafe(InitData calldata initData) external",
	`struct InitData { address singleton; address[] owners; uint256 threshold; address setupTo; bytes setupData; ISafe7579 safe7579; ModuleInit[] validators; bytes callData; }`,
	"function initSafe7579(address safe7579, ModuleInit[] calldata executors, ModuleInit[] calldata fallbacks, ModuleInit[] calldata hooks, address[] calldata attesters, uint8 threshold) public",
	`struct ModuleInit { address module; bytes initData; }`,
	"function preValidationSetup( bytes32 initHash, address to, bytes calldata preInit ) external",
])

export const tsSafeAbi = parseAbi([
	"function execute(bytes32 mode, bytes calldata executionCalldata) external payable",
])

export const erc20Abi = parseAbi(["function mint(uint256 _amount) external"])

export const blockGuardSetterAbi = parseAbi([
	"function setGuard(address guard) external",
])

export const safeProxyFactoryAbi = parseAbi([
    "function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce) public returns (SafeProxy proxy)",
])