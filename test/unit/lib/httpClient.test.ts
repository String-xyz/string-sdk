import { createHttpClient, type Response } from '../../../src/lib/httpClient';

// Mock global fetch
global.fetch = jest.fn();

// Set up types
type User = { name: string };

describe('HttpClient', () => {
	beforeEach(() => {
		(fetch as jest.Mock).mockClear();
	});

	it('should create an HttpClient', () => {
		const client = createHttpClient();
		expect(client).toBeDefined();
	});

	it('should make GET request', async () => {
		const responseData: User = { name: 'John Doe' };
		const responseHeaders = new Headers();

		// Mock fetch response
		(fetch as jest.Mock).mockResolvedValueOnce({
			status: 200,
			statusText: 'OK',
			config: {}, // Your actual config goes here
			data: responseData,
			headers: responseHeaders,
			redirect: false,
			url: 'https://api.example.com/users/1',
			type: 'json',
			body: null,
			bodyUsed: false,
			json: () => Promise.resolve(responseData),
		} as unknown as Response<User>);

		const client = createHttpClient();
		const response = await client.get<User>('https://api.example.com/users/1');

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1', expect.objectContaining({ method: 'GET' }));
		expect(response.status).toEqual(200);
		expect(response.data).toEqual(responseData);
	});

	// Similar tests for POST, PUT, PATCH, DELETE
});
