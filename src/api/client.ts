// xbank 백엔드 API client.
//
// - X-Actor-* 헤더 자동 주입 (DEMO_ACTOR — 본 시스템 이식 시 JWT 로 교체)
// - Idempotency-Key 자동 발급 (변경성 메서드 POST/PATCH/PUT/DELETE)
// - ErrorCode 응답을 ApiError 로 throw — Error 자체에 code 보존해 화면이 분기
//
// 사용 예:
//   import { api } from "@/api/client";
//   const account = await api.get<AccountResponse>(`/api/v1/accounts/${id}`);
//   try {
//     await api.post("/api/v1/accounts/1/withdraw", { amount: 10000 });
//   } catch (e) {
//     if (e instanceof ApiError && e.code === "DAILY_TRANSFER_LIMIT_EXCEEDED") { ... }
//   }

import { DEMO_ACTOR, type ActorContext } from "./actor";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const MUTATING = new Set(["POST", "PATCH", "PUT", "DELETE"]);

// 백엔드 ErrorResponse 형식 — api-design.md §4.
export type ApiErrorPayload = {
  code: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly payload: ApiErrorPayload,
  ) {
    super(`${code} (${status})`);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  actor?: ActorContext;
  idempotencyKey?: string;        // 명시 시 wrapper 가 발급 안 함 (재시도 시 동일 키 강제용)
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildHeaders(method: string, opts: RequestOptions, hasBody: boolean): HeadersInit {
  const actor = opts.actor ?? DEMO_ACTOR;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Actor-Type": actor.type,
    "X-Actor-Id": actor.id,
    "X-Actor-Channel": actor.channel,
    ...opts.headers,
  };
  if (hasBody) headers["Content-Type"] = "application/json; charset=UTF-8";
  if (MUTATING.has(method)) {
    headers["Idempotency-Key"] = opts.idempotencyKey ?? crypto.randomUUID();
  }
  return headers;
}

async function request<T>(method: string, path: string, body: unknown, opts: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const hasBody = body !== undefined && body !== null;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(method, opts, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
    signal: opts.signal,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? safeParse(text) : undefined;

  if (!res.ok) {
    const payload: ApiErrorPayload = isErrorPayload(parsed)
      ? parsed
      : { code: "UNKNOWN_ERROR", message: text || res.statusText };
    throw new ApiError(res.status, payload.code, payload);
  }

  return (parsed as T) ?? (undefined as T);
}

function safeParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return undefined; }
}

function isErrorPayload(v: unknown): v is ApiErrorPayload {
  return typeof v === "object" && v !== null && typeof (v as ApiErrorPayload).code === "string";
}

export const api = {
  get:    <T>(path: string, opts?: RequestOptions) => request<T>("GET",    path, undefined, opts),
  post:   <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST",   path, body, opts),
  patch:  <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH",  path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, undefined, opts),
};
