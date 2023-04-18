import type { StringPayload } from '../lib/StringPay';

const userAddr = "0x000000"

export const testPayload: StringPayload = {
	assetName: "String Demo NFT",
	collection: "String Demo",
	imageSrc: "https://gateway.pinata.cloud/ipfs/bafybeibtmy26mac47n5pp6srds76h74riqs76erw24p5yvdhmwu7pxlcx4/STR_Logo_1.png",
	imageAlt: "NFT",
	currency: "AVAX",
	price: 0.08,
	chainID: 43113,
	userAddress: userAddr,
	contractAddress: "0x41e11fF9F71f51800F67cb913eA6Bc59d3F126Aa",
	contractFunction: "mintTo(address)",
	contractReturn: "uint256",
	contractParameters: [userAddr],
	txValue: "0.08 eth",
}
