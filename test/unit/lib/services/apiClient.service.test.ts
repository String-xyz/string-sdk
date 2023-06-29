import { createMockErrorResponse, createMockOkResponse, __httpClient__ } from '../../../mocks';
import { type UserUpdate, createApiClient, type TransactionResponse } from '../../../../src/lib/services/apiClient.service';
import { __executionRequest__, __fingerprint__, __quote__, __transactionRequest__ } from '../../../mocks/DTOs.mock';

describe('ApiClient', () => {
	const apiClient = createApiClient(__httpClient__, 'testApiKey');
	const headers = { 'X-Api-Key': 'testApiKey' };
	const mockUserId = 'mockUserId';
	const fingerprint = __fingerprint__;

	beforeEach(() => {
		// Clear all instances and calls to constructor and all methods:
		__httpClient__.get.mockClear();
		__httpClient__.post.mockClear();
		__httpClient__.patch.mockClear();
	});

	test('create api client', async () => {
		const _apiClient = createApiClient(__httpClient__, 'testApiKey');
		expect(_apiClient).toBeDefined();
	});

	test('Request Nonce Payload', async () => {
		// Arrange
		const expectedData = { nonce: 'testNonce' };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.get = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const payload = await apiClient.requestLogin('0x1234...ABC');

		// Assert
		expect(__httpClient__.get).toHaveBeenCalledTimes(1);
		expect(__httpClient__.get).toHaveBeenCalledWith('/login', { params: { walletAddress: '0x1234...ABC' }, headers });
		expect(payload).toBeDefined();
		expect(payload).toEqual(expectedData);
	});

	test('Request Nonce Payload Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.get = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.requestLogin('0x1234...ABC');
		} catch (e: any) {
			console.error(e);
			// Assert
			expect(__httpClient__.get).toHaveBeenCalledTimes(1);
			expect(__httpClient__.get).toHaveBeenCalledWith('/login', { params: { walletAddress: '0x1234...ABC' }, headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Login', async () => {
		// Arrange
		const expectedData = { user: 'mock user', authToken: 'mock token' };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const { user, authToken } = await apiClient.loginUser('test-nonce', 'test-signature');

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith('/login/sign', { nonce: 'test-nonce', signature: 'test-signature' }, { headers });
		expect(user).toBeDefined();
		expect(user).toEqual(expectedData.user);
		expect(authToken).toBeDefined();
		expect(authToken).toEqual(expectedData.authToken);
	});

	test('Login Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.loginUser('test-nonce', 'test-signature');
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith('/login/sign', { nonce: 'test-nonce', signature: 'test-signature' }, { headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Create User', async () => {
		// Arrange
		const expectedData = { user: 'mock user', authToken: 'mock token' };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const { user, authToken } = await apiClient.createUser('test-nonce', 'test-signature');

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith('/users', { nonce: 'test-nonce', signature: 'test-signature' }, { headers });
		expect(user).toBeDefined();
		expect(user).toEqual(expectedData.user);
		expect(authToken).toBeDefined();
		expect(authToken).toEqual(expectedData.authToken);
	});

	test('Create User Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.createUser('test-nonce', 'test-signature');
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith('/users', { nonce: 'test-nonce', signature: 'test-signature' }, { headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	// Add tests for updateUser function
	test('Update User', async () => {
		// Arrange
		const userUpdate: UserUpdate = { firstName: 'updated user' };
		const expectedData = { id: mockUserId, ...userUpdate };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.patch = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const user = await apiClient.updateUser(mockUserId, userUpdate);

		// Assert
		expect(__httpClient__.patch).toHaveBeenCalledTimes(1);
		expect(__httpClient__.patch).toHaveBeenCalledWith(`/users/${mockUserId}`, userUpdate);
		expect(user).toBeDefined();
		expect(user).toEqual(expectedData);
	});

	test('Update User Error', async () => {
		// Arrange
		const userUpdate: UserUpdate = { firstName: 'updated user' };
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.patch = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.updateUser(mockUserId, userUpdate);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.patch).toHaveBeenCalledTimes(1);
			expect(__httpClient__.patch).toHaveBeenCalledWith(`/users/${mockUserId}`, userUpdate);
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Request Email Verification', async () => {
		// Arrange
		const expectedData = { message: 'Email verification requested' };
		const mockResponse = createMockOkResponse(expectedData);
		const testEmail = 'test-email@test.com';
		__httpClient__.get = jest.fn().mockResolvedValue(mockResponse);

		// Act
		await apiClient.requestEmailVerification(mockUserId, testEmail);

		// Assert
		expect(__httpClient__.get).toHaveBeenCalledTimes(1);
		expect(__httpClient__.get).toHaveBeenCalledWith(`/users/${mockUserId}/verify-email`, {
			params: { email: testEmail },
		});
	});

	test('Request Email Verification Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		const testEmail = 'test-email@test.com';
		__httpClient__.get = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.requestEmailVerification(mockUserId, testEmail);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.get).toHaveBeenCalledTimes(1);
			expect(__httpClient__.get).toHaveBeenCalledWith(`/users/${mockUserId}/verify-email`, {
				params: { email: testEmail },
			});
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Request Device Verification', async () => {
		// Arrange
		const nonce = 'testNonce';
		const signature = 'testSignature';
		__httpClient__.post = jest.fn().mockResolvedValue({});

		// Act
		await apiClient.requestDeviceVerification(nonce, signature, fingerprint);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith(`/users/verify-device`, { nonce, signature, fingerprint }, { headers });
	});

	test('Request Device Verification Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.requestDeviceVerification('testNonce', 'testSignature', fingerprint);
		} catch (e: any) {
			// Assert
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
		}
	});

	test('Refresh Token', async () => {
		// Arrange
		const walletAddress = '0x1234...ABC';
		const expectedData = {
			authToken: { token: 'mockToken', refreshToken: { token: 'mockRefreshToken', expAt: new Date() }, issuedAt: 'mockDate', expAt: 'mockExpDate' },
			user: 'mock user',
		};
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const { authToken } = await apiClient.refreshToken(walletAddress);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith('/login/refresh', { walletAddress }, { headers });
		expect(authToken).toBeDefined();
		expect(authToken).toEqual(expectedData.authToken);
	});

	test('Refresh Token Error', async () => {
		// Arrange
		const walletAddress = '0x1234...ABC';
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.refreshToken(walletAddress);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith('/login/refresh', { walletAddress }, { headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Logout User', async () => {
		// Arrange
		const mockResponse = createMockOkResponse({}, 204);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		await apiClient.logoutUser();

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith('/login/logout');
	});

	test('Logout fails when status code is not 204', async () => {
		// Arrange
		const mockResponse = createMockOkResponse({}, 200);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		try {
			await apiClient.logoutUser();
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith('/login/logout');
			expect(e).toBeDefined();
		}
	});

	test('Logout User Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.logoutUser();
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith('/login/logout');
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Get User Status', async () => {
		// Arrange
		const expectedData = { status: 'active' };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.get = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const status = await apiClient.getUserStatus(mockUserId);

		// Assert
		expect(__httpClient__.get).toHaveBeenCalledTimes(1);
		expect(__httpClient__.get).toHaveBeenCalledWith(`/users/${mockUserId}/status`);
		expect(status).toBeDefined();
		expect(status).toEqual(expectedData);
	});

	test('Get User Status Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.get = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.getUserStatus(mockUserId);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.get).toHaveBeenCalledTimes(1);
			expect(__httpClient__.get).toHaveBeenCalledWith(`/users/${mockUserId}/status`);
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Get Device Status', async () => {
		// Arrange
		const nonce = 'testNonce';
		const signature = 'testSignature';
		const expectedData = { status: 'active' };
		const mockResponse = createMockOkResponse(expectedData);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const status = await apiClient.getDeviceStatus(nonce, signature, fingerprint);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith(`/users/device-status`, { nonce, signature, fingerprint }, { headers });
		expect(status).toBeDefined();
		expect(status).toEqual(expectedData);
	});

	test('Get Device Status Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.getDeviceStatus('testNonce', 'testSignature', { visitorId: 'testVisitorId', requestId: 'testRequestId' });
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith(`/users/device-status`, { nonce: 'testNonce', signature: 'testSignature', fingerprint }, { headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Get User Email Preview - Success', async () => {
		// Arrange
		const expectedData = { email: 'user@example.com' };
		const mockResponse = createMockOkResponse(expectedData);
		const nonce = 'test-nonce';
		const signature = 'test-signature';
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const { email } = await apiClient.getUserEmailPreview(nonce, signature, fingerprint);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith(`/users/preview-email`, { nonce, signature, fingerprint }, { headers });
		expect(email).toEqual(expectedData.email);
	});

	test('Get User Email Preview - Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		const nonce = 'test-nonce';
		const signature = 'test-signature';
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.getUserEmailPreview(nonce, signature, fingerprint);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith(`/users/preview-email`, { nonce, signature, fingerprint }, { headers });
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Get Quote - Success', async () => {
		// Arrange
		const mockResponse = createMockOkResponse(__quote__);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const quote = await apiClient.getQuote(__transactionRequest__);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith(`/quotes`, __transactionRequest__);
		expect(quote).toEqual(__quote__);
	});

	test('Get Quote - Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse('INTERNAL_SERVER_ERROR');
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.getQuote(__transactionRequest__);
		} catch (e: any) {
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith(`/quotes`, __transactionRequest__);
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('Transact - Success', async () => {
		// Arrange
		const expectedData: TransactionResponse = {
			txID: 'txID1',
			txUrl: 'https://etherscan.io/tx/0x123',
		};

		const mockResponse = createMockOkResponse(expectedData, 200);
		__httpClient__.post = jest.fn().mockResolvedValue(mockResponse);

		// Act
		const actualData = await apiClient.transact(__executionRequest__);

		// Assert
		expect(__httpClient__.post).toHaveBeenCalledTimes(1);
		expect(__httpClient__.post).toHaveBeenCalledWith(`/transactions`, __executionRequest__);
		expect(actualData).toEqual(expectedData);
	});

	test('Transact - Error', async () => {
		// Arrange
		const mockResponse = createMockErrorResponse();
		__httpClient__.post = jest.fn().mockRejectedValue(mockResponse);

		// Act
		try {
			await apiClient.transact(__executionRequest__);
		} catch (e: any) {
			console.log('>>>> test 2');
			// Assert
			expect(__httpClient__.post).toHaveBeenCalledTimes(1);
			expect(__httpClient__.post).toHaveBeenCalledWith(`/transactions`, __executionRequest__);
			expect(e).toBeDefined();
			expect(e.code).toEqual('INTERNAL_SERVER_ERROR');
			expect(e.message).toEqual('HttpError');
		}
	});

	test('setWalletAddress - Check', () => {
		// Arrange
		const testAddress = '0x123';

		// Act
		apiClient.setWalletAddress(testAddress);

		// Assert
		expect(apiClient.getWalletAddress()).toEqual(testAddress);
	});
});
