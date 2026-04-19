// Упрощённая обёртка над Upstash Redis REST API.
// Используем только нужные нам команды: SET с EX/NX, GET, DEL, INCR, EXPIRE.
// Если переменные окружения не заданы — все операции возвращают null / 0,
// а вызывающий код должен это обрабатывать (например, деградация UI).

const URL = process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

export function kvEnabled(): boolean {
  return Boolean(URL && TOKEN);
}

async function call<T = unknown>(command: (string | number)[]): Promise<T | null> {
  if (!kvEnabled()) return null;
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

export async function kvSetJSON(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<boolean> {
  const serialized = JSON.stringify(value);
  const res = await call<string>(["SET", key, serialized, "EX", ttlSeconds]);
  return res === "OK";
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const res = await call<string>(["GET", key]);
  if (!res) return null;
  try {
    return JSON.parse(res) as T;
  } catch {
    return null;
  }
}

export async function kvDel(key: string): Promise<number> {
  const res = await call<number>(["DEL", key]);
  return res ?? 0;
}

export async function kvIncrWithExpire(
  key: string,
  ttlSeconds: number
): Promise<number> {
  const count = (await call<number>(["INCR", key])) ?? 0;
  if (count === 1) {
    await call(["EXPIRE", key, ttlSeconds]);
  }
  return count;
}
