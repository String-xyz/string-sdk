import type { ExecutionRequest, Quote, TransactionRequest } from "../../src/lib/services/apiClient.service";

export const __transactionRequest__: TransactionRequest = {
    userAddress: "0x123",
    assetName: "ETH",
    chainID: 1,
    contractAddress: "0x456",
    contractFunction: "transfer",
    contractReturn: "0x789",
    contractParameters: ["param1", "param2"],
    txValue: "1",
    gasLimit: "21000",
};

export const __quote__: Quote = {
    transactionRequest: __transactionRequest__,
    estimate: {
        timestamp: 123456789,
        baseUSD: "2000",
        gasUSD: "10",
        tokenUSD: "100",
        serviceUSD: "50",
        totalUSD: "2160",
    },
    signature: "signature",
};

export const __executionRequest__: ExecutionRequest = {
    quote: __quote__,
    paymentInfo: {
        cardToken: "cardToken1",
        cvv: "123",
    },
};

export const __fingerprint__ = { visitorId: "testVisitorId", requestId: "testRequestId" };
