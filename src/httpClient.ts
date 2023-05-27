type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "options" | "head" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

type ResponseType = "text" | "json" | "stream" | "blob" | "arrayBuffer" | "formData" | "stream";

type RequestHeaders = { [name: string]: string } | Headers;

interface Options {
    url?: string;
    method?: HttpMethod;
    headers?: RequestHeaders;
    body?: FormData | string | object;
    responseType?: ResponseType;
    params?: Record<string, any> | URLSearchParams;
    paramsSerializer?: (params: Options["params"]) => string;
    withCredentials?: boolean;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    validateStatus?: (status: number) => boolean;
    transformRequest?: Array<(body: any, headers?: RequestHeaders) => any>;
    baseURL?: string;
    fetch?: typeof window.fetch;
    data?: any;
}

export interface Response<T = any> {
    status: number;
    statusText: string;
    config: Options;
    data: T;
    headers: Headers | any;
    redirect: boolean;
    url: string;
    type: ResponseType;
    body: ReadableStream<Uint8Array> | null;
    bodyUsed: boolean;
    [key: string]: any;
}

type BodylessMethod = <T = any>(url: string, config?: Options) => Promise<Response<T>>;
type BodyMethod = <T = any>(url: string, body?: any, config?: Options) => Promise<Response<T>>;

export interface HttpClient {
    get: BodylessMethod;
    delete: BodylessMethod;
    head: BodylessMethod;
    options: BodylessMethod;
    post: BodyMethod;
    put: BodyMethod;
    patch: BodyMethod;
    all: typeof Promise.all;
    spread: <Args, R>(fn: (...args: Args[]) => R) => (array: Args[]) => R;
    CancelToken: typeof AbortController;
    defaults: Options;
    create: typeof create;
}

function create(defaults: Options = {}): HttpClient {
    request.get = (url: string, config?: Options) => request(url, config, "get") as any;

    request.delete = (url: string, config?: Options) => request(url, config, "delete") as any;

    request.head = (url: string, config?: Options) => request(url, config, "head") as any;

    request.options = (url: string, config?: Options) => request(url, config, "options") as any;

    request.post = (url: string, data?: any, config?: Options) => request(url, config, "post", data) as any;

    request.put = (url: string, data?: any, config?: Options) => request(url, config, "put", data) as any;

    request.patch = (url: string, data?: any, config?: Options) => request(url, config, "patch", data) as any;

    request.all = Promise.all.bind(Promise);

    request.spread = (fn: any) => fn.apply.bind(fn, fn) as any;

    /**
     * @private
     * @param {Record<string, any>} opts
     * @param {Record<string, any> | undefined} overrides
     * @param {boolean | undefined} lowerCase
     * @returns {Record<string, any>}
     */
    function deepMerge(opts: Record<string, any>, overrides?: Record<string, any>, lowerCase?: boolean): Record<string, any> {
        const out: Record<string, any> = {};
        let key: string;

        if (Array.isArray(opts)) {
            return opts.concat(overrides || []);
        }

        for (key in opts) {
            const keyName = lowerCase ? key.toLowerCase() : key;
            out[keyName] = opts[key];
        }

        for (key in overrides) {
            const keyName = lowerCase ? key.toLowerCase() : key;
            const value = overrides && overrides[key];
            out[keyName] = keyName in out && typeof value == "object" ? deepMerge(out[keyName], value, keyName == "headers") : value;
        }

        return out;
    }

    async function request<T = any>(url: string, config: Options = {}, _method?: string, data?: any): Promise<Response<T>> {
        const response: Partial<Response<T>> = { config };

        const options: Options = deepMerge(defaults, config);

        const customHeaders: Record<string, string> = {};

        data = data || options.data;

        (options.transformRequest || []).forEach((f) => {
            data = f(data, options.headers) || data;
        });

        if (data && typeof data === "object" && typeof (data as any).append !== "function" && typeof (data as any).text !== "function") {
            data = JSON.stringify(data);
            customHeaders["content-type"] = "application/json";
        }

        try {
            const match = document.cookie.match(new RegExp("(^|; )" + options.xsrfCookieName + "=([^;]*)"));
            if (options.xsrfHeaderName && match && match[2]) {
                customHeaders[options.xsrfHeaderName] = decodeURIComponent(match[2]);
            }
        } catch (e) {
            console.warn("Error getting CSRF token", e);
        }

        if (options.baseURL) {
            url = url.replace(/^(?!.*\/\/)\/?/, options.baseURL + "/");
        }

        if (options.params) {
            url += (~url.indexOf("?") ? "&" : "?") + (options.paramsSerializer ? options.paramsSerializer(options.params) : new URLSearchParams(options.params));
        }

        const fetchFunc = options.fetch || fetch;

        const res = await fetchFunc(url, {
            method: (_method || options.method || "get").toUpperCase(),
            body: data,
            headers: deepMerge(options.headers || {}, customHeaders, true),
            credentials: options.withCredentials ? "include" : undefined,
        });

        for (const i in res) {
            if (typeof (res as any)[i] != "function") response[i] = (res as any)[i];
        }

        if (options.responseType == "stream") {
            if (res.body !== null) {
                response.data = res.body as T;
            }
            return response as Response<T>;
        }

        const _res = res as any;

        return _res[options.responseType || "text"]()
            .then((data: any) => {
                response.data = data;
                response.data = JSON.parse(data); // its okay if this fails: response.data will be the unparsed value:
            })
            .catch(Object)
            .then(() => {
                const ok = options.validateStatus ? options.validateStatus(res.status) : res.ok;
                return ok ? (response as Response<T>) : Promise.reject(response);
            });
    }

    request.CancelToken = typeof AbortController == "function" ? AbortController : (Object as any);

    request.defaults = defaults;

    request.create = create;

    return request;
}

export const createHttpClient = (options: Options = {}) => create(options);
