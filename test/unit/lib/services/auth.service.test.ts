// import { createAuthService } from "../../../../src/lib/services/auth.service";
// import { VisitorData } from "../../../../src/lib/services/location.service";
// import { __apiClient__, __fingerprint__ } from "../../../mocks";
// import { createMockLocationService } from "./mockLocationService.service";

// // You'll have to implement this function to mimic the visitor data retrieval

// // Mock window.ethereum.request
// global.window = Object.create(window);
// const ethereumRequest = jest.fn();
// Object.defineProperty(window, "ethereum", {
//     value: { request: ethereumRequest },
// });

// describe("AuthService", () => {
//     let authService;
//     const apiClient = __apiClient__;
//     let locationService;
//     const mockWalletAddress = "mock-wallet-address";
//     const mockNonce = "mock-nonce";
//     const mockSignature = "mock-signature";
//     const mockVisitorData: VisitorData = __fingerprint__;
//     const bypassDeviceCheck = false;

//     beforeEach(() => {
//         locationService = createMockLocationService(); // You'll need to implement this
//         authService = createAuthService({ apiClient, locationService, bypassDeviceCheck });
//         ethereumRequest.mockReset();
//     });

//     test("loginOrCreateUser calls createUser when user does not exist", async () => {
//         const spy = jest.spyOn(apiClient, "createUser");
//         await authService.loginOrCreateUser(mockWalletAddress);
//         expect(spy).toHaveBeenCall;
//     });

//     test("loginOrCreateUser calls login when user exists", async () => {
//         const spy = jest.spyOn(apiClient, "loginUser");
//         jest.spyOn(apiClient, "createUser").mockRejectedValueOnce({ code: "CONFLICT" });
//         await authService.loginOrCreateUser(mockWalletAddress);
//         expect(spy).toHaveBeenCalled();
//     });

//     test("requestSignature calls ethereum.request with correct parameters", async () => {
//         await authService.requestSignature(mockWalletAddress, mockNonce);
//         expect(ethereumRequest).toHaveBeenCalledWith({
//             method: "personal_sign",
//             params: [mockNonce, mockWalletAddress],
//         });
//     });

//     test("getPreviousSignature throws error when no previous signature", async () => {
//         await expect(authService.getPreviousSignature()).rejects.toEqual({ code: "UNAUTHORIZED" });
//     });

//     test("fetchLoggedInUser returns user data on success", async () => {
//         const user = await authService.fetchLoggedInUser(mockWalletAddress);
//         expect(user).not.toBeNull();
//     });

//     test("fetchLoggedInUser returns null on failure", async () => {
//         jest.spyOn(apiClient, "refreshToken").mockRejectedValueOnce(new Error());
//         const user = await authService.fetchLoggedInUser(mockWalletAddress);
//         expect(user).toBeNull();
//     });

//     test("logout calls logoutUser from apiClient", async () => {
//         const spy = jest.spyOn(apiClient, "logoutUser");
//         await authService.logout();
//         expect(spy).toHaveBeenCalled();
//     });
// });
