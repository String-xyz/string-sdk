import { Agent } from "@fingerprintjs/fingerprintjs-pro";

export interface NFT {
    assetName: string;
    price: string;
    currency: string;
    collection?: string;
    imageSrc?: string;
    imageAlt?: string;
}

export interface CheckoutIframePayload {
    nft: NFT;
    user: {
        id: string;
        walletAddress: string;
        status: string;
        email: string;
    };
}

export interface ApiClient {
    requestLogin: (walletAddress: string) => Promise<{ nonce: string }>;
    createUser: (nonce: string, signature: string, visitor?: VisitorData) => Promise<AuthResponse>;
    updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
    requestEmailVerification: (userId: string, email: string) => Promise<void>;
    requestDeviceVerification: (nonce: string, signature: string, visitor: VisitorData) => Promise<void>;
    loginUser: (nonce: string, signature: string, visitor?: VisitorData, bypassDeviceCheck?: boolean) => Promise<AuthResponse>;
    refreshToken: (walletAddress: string) => Promise<AuthResponse>;
    logoutUser: () => Promise<void>;
    getUserStatus: (userId: string) => Promise<{ status: string }>;
    getDeviceStatus: (nonce: string, signature: string, visitor: VisitorData) => Promise<{ status: string }>;
    getUserEmailPreview: (nonce: string, signature: string) => Promise<{ email: string }>;
    getSavedCards: () => Promise<SavedCardResponse[]>;
    getQuote: (request: ExecutionRequest) => Promise<Quote>;
    transact: (request: TransactionRequest) => Promise<TransactionResponse>;
    setWalletAddress: (walletAddress: string) => void;
}

interface RefreshToken {
    token: string;
    expAt: Date;
}

interface AuthToken {
    token: string;
    refreshToken: RefreshToken;
    issuedAt: string;
    expAt: string;
}

export interface AuthResponse {
    authToken: AuthToken;
    user: User;
}

export interface UserUpdate {
    walletAddress?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
}

export interface User {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    status: string;
    type: string;
    tags: object;
    createdAt: string;
    updateAt: string;
    email?: string;
}

export interface VisitorData {
    visitorId?: string;
    requestId?: string;
}

export interface ExecutionRequest {
    userAddress: string;
    assetName: string;
    chainID: number;
    contractAddress: string;
    contractFunction: string;
    contractReturn: string;
    contractParameters: string[];
    txValue: string;
    gasLimit: string;
}

export interface Estimate {
    timestamp: number;
    baseUSD: string;
    gasUSD: string;
    tokenUSD: string;
    serviceUSD: string;
    totalUSD: string;
}

export interface Quote {
    request: ExecutionRequest;
    estimate: Estimate;
    signature: string;
}

export interface PaymentInfo {
    cardToken?: string;
    cardId?: string;
    cvv?: string;
    saveCard?: boolean;
}

export interface TransactionRequest {
    quote: Quote;
    paymentInfo: PaymentInfo;
}

export interface TransactionResponse {
    txID: string;
    txUrl: string;
    txTimestamp: string;
}

export interface SavedCardResponse {
    type: string;
    id: string;
    scheme: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    expired: boolean;
    cardType: string;
}

export interface ApiClientOptions {
    baseUrl: string;
    apiKey: string;
}

export interface ServiceParams {
    baseUrl: string;
    iframeUrl: string;
    apiKey: string;
    bypassDeviceCheck?: boolean;
}

// export { Services } from "./services";

export interface VisitorData {
    visitorId?: string;
    requestId?: string;
}

export interface LocationService {
    getFPInstance: () => Promise<Agent>;
    getVisitorData: (options?: { extendedResult: boolean }) => Promise<VisitorData | undefined>;
    getCachedVisitorData: () => Promise<VisitorData | undefined>;
    setCachedVisitorData: (visitorData: VisitorData) => void;
}

export interface QuoteService {
    getQuote: (payload: ExecutionRequest) => Promise<Quote>;
    startQuote: (payload: ExecutionRequest, callback: (quote: Quote) => void) => Promise<void>;
    stopQuote: () => void;
}

export interface StringPay {
    loadIframe(payload: StringPayload): Promise<HTMLIFrameElement>;
    setStyle(style: any): Promise<void>;
    authorizeUser(): Promise<User>;
    updateUserName(userId: string, firstName: string, lastName: string): Promise<User>;
    verifyEmail(userId: string, email: string): Promise<void>;
    verifyDevice(): Promise<void>;
    getQuote(payload: StringPayload): Promise<Quote>;
    submitCard(): Promise<string>; // returns tokenized card
    submitTransaction(request: TransactionRequest): Promise<TransactionResponse>;

    /* Events */
    subscribeToQuote(payload: StringPayload, callback: (quote: Quote) => void): void;
    unsubscribeFromQuote(callback: (quote: Quote) => void): void;
    subscribeTo: (eventName: string, callback: (event: any) => void) => void;
    unsubscribeFrom: (eventName: string, callback: (event: any) => void) => void;
}

export interface IframeEventListener {
    startListening(): Promise<void>;
    stopListening(): Promise<void>;
}

/**
 * @param {IframeEvent} reqEvent The event request from the iframe
 * @returns {IframeEvent} The response event to be sent
 */
export type Handler = (reqEvent: IframeEvent) => Promise<IframeEvent>;

export type EventHandlers = Record<string, Handler>;

export interface IframeEvent<T = any> {
    eventName: string;
    data?: T;
    error?: any;
}

export interface StringIframe {
    load: (payload: StringPayload) => HTMLIFrameElement;
    destroy: () => void;
    submitCard: () => Promise<void>;
    setStyle: (style: any) => void;
}

export interface IframeEventSender {
    sendData<T = any>(eventName: string, data: T): IframeEvent; // returns the event sent
    sendError(eventName: string, error: any): IframeEvent; // returns the event sent
    sendEvent(event: IframeEvent): IframeEvent; // returns the event sent
}

export interface AuthService {
    authorizeUser: (walletAddress: string) => Promise<User>;
    fetchLoggedInUser: (walletAddress: string) => Promise<User | null>;
    requestSignature: (userAddress: string, encodedMessage: string) => Promise<string>;
    getPreviousSignature: () => Promise<{ nonce: string; signature: string; visitor: VisitorData }>;
    emailVerification: (userId: string, email: string) => Promise<void>;
    emailPreview: (walletAddress: string) => Promise<any>;
    deviceVerification: (walletAddress: string) => Promise<void>;
    updateUser: (userId: string, userUpdate: UserUpdate) => Promise<User>;
    logout: () => Promise<void>;
}

export interface AuthServiceParams {
    apiClient: ApiClient;
    locationService: LocationService;
    bypassDeviceCheck: boolean;
}

/* Extended config with user options */
export interface Config extends DefaultConfig {
    apiKeyPublic: string;
}

export type DefaultConfig = {
    apiUrl: string;
    checkoutIframeUrl: string;
    paymentIframeUrl: string;
    bypassDeviceCheck: boolean;
    analyticsPublicKey: string;
};

export interface UserOptions {
    env: Environment;
    apiKeyPublic: string;
    bypassDeviceCheck?: boolean;
}

export interface StringPayload {
    assetName: string;
    collection?: string;
    price: string;
    currency: string;
    imageSrc?: string;
    imageAlt?: string;
    chainID: number;
    userAddress: string;
    contractAddress: string;
    contractFunction: string;
    contractReturn: string;
    contractParameters: string[];
    txValue: string;
    gasLimit?: string;
}

export type Environment = "PROD" | "SANDBOX" | "DEV" | "LOCAL";

declare global {
    interface Window {
        ethereum: any;
    }
}

export type Callback = (...args: any[]) => void;
