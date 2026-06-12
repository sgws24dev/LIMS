type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiConfig {
  baseUrl: string
  headers?: Record<string, string>
  tokenGetter?: () => string | null
}

interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  status: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

let config: ApiConfig = {
  baseUrl: "/api",
}

export function configureApi(cfg: Partial<ApiConfig>) {
  config = { ...config, ...cfg }
}

export function setTokenGetter(fn: () => string | null) {
  config.tokenGetter = fn
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.status === 204) {
    return { data: null, error: null, status: response.status }
  }

  let body: unknown
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    body = await response.json()
  } else {
    body = await response.text()
  }

  if (!response.ok) {
    const apiError: ApiError = {
      code: (body as Record<string, unknown>)?.code as string ?? `HTTP_${response.status}`,
      message: (body as Record<string, unknown>)?.message as string ?? response.statusText,
      details: (body as Record<string, unknown>)?.details as Record<string, string[]> | undefined,
    }
    return { data: null, error: apiError, status: response.status }
  }

  return { data: body as T, error: null, status: response.status }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const url = `${config.baseUrl}${path}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...config.headers,
  }

  const token = config.tokenGetter?.()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error"
    return {
      data: null,
      error: { code: "NETWORK_ERROR", message },
      status: 0,
    }
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
}
