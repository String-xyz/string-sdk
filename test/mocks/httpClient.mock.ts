import type { HttpClient, Response } from "../../src/lib/httpClient";

interface MockableHttpClient extends HttpClient {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
    head: jest.Mock;
    options: jest.Mock;
    all: jest.Mock;
    spread: jest.Mock;
    CancelToken: jest.Mock;
    defaults: Record<string, any>;
    create: jest.Mock;
}

export const __httpClient__: MockableHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    all: jest.fn(),
    spread: jest.fn(),
    CancelToken: jest.fn(),
    defaults: {},
    create: jest.fn(),
};

export function createMockOkResponse<T>(data: T, status = 200): Response<T> {
    return {
        status,
        statusText: "OK",
        config: {},
        data,
        headers: {},
        redirect: false,
        url: "",
        type: "json",
        body: null,
        bodyUsed: false,
    };
}

export function createMockErrorResponse(code = "INTERNAL_SERVER_ERROR") {
    return {
        name: "HttpError",
        message: "HttpError",
        config: {},
        request: {},
        response: {
            status: 500,
            statusText: "Internal Server Error",
            data: {
                message: "HttpError",
                code,
            },
        },
        isAxiosError: true,
    };
}
