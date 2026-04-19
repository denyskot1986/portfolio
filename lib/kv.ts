import { createClient, type RedisClientType } from "redis";

// Подключение к Redis через REDIS_URL (Vercel Marketplace Redis integration).
// Клиент кэшируется на уровне модуля — внутри горячего serverless-инстанса
// соединение переиспользуется между вызовами.

const REDIS_URL = process.env.REDIS_URL || "";

let clientPromise: Promise<RedisClientType> | null = null;

export function kvEnabled(): boolean {
  return Boolean(REDIS_URL);
}

async function getClient(): Promise<RedisClientType> {
  if (!REDIS_URL) throw new Error("REDIS_URL is not configured");

  if (!clientPromise) {
    const client: RedisClientType = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return false;
          return Math.min(retries * 100, 500);
        },
      },
    });
    client.on("error", (err: unknown) => {
      console.error("Redis client error:", err);
    });
    clientPromise = client.connect().then(() => client);
  }

  return clientPromise;
}

export async function kvSetJSON(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<boolean> {
  const client = await getClient();
  const result = await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  return result === "OK";
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const client = await getClient();
  const raw = await client.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvDel(key: string): Promise<number> {
  const client = await getClient();
  return client.del(key);
}

export async function kvIncrWithExpire(
  key: string,
  ttlSeconds: number
): Promise<number> {
  const client = await getClient();
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, ttlSeconds);
  }
  return count;
}
