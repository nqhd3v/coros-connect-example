import CorosConnect, { CorosCredentials } from "@nqhd3v/coros-connect";
import { decrypt, encrypt } from "@nqhd3v/coros-connect/crypto";

export type StoredCredentials = CorosCredentials & {
  expiresAt?: number | null;
};

export const COOKIE_NAME = "coros-client";

export const cookieOptions = {
  sameSite: "lax",
  httpOnly: process.env.NODE_ENV === "production",
  secure: true,
} as const;

export const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_PATH}/auth/coros`;

const EXPIRY_MARGIN_MS = 60_000;

export const encodeCredentials = (credentials: CorosCredentials) => {
  const expiresIn = credentials.tokens?.expires_in;
  const stored: StoredCredentials = {
    ...credentials,
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
  };
  return encrypt(JSON.stringify(stored), process.env.ENC_SECRET_STR);
};

export const decodeCredentials = (value: string): StoredCredentials =>
  JSON.parse(decrypt(value, process.env.ENC_SECRET_STR));

const needsRefresh = (credentials: StoredCredentials) =>
  !!credentials.tokens &&
  (!credentials.expiresAt ||
    credentials.expiresAt - EXPIRY_MARGIN_MS <= Date.now());

export const refreshCredentialsCookie = async (
  value: string,
): Promise<string | null> => {
  let credentials: StoredCredentials;
  try {
    credentials = decodeCredentials(value);
  } catch {
    return null;
  }
  if (!needsRefresh(credentials)) return null;

  let latest: CorosCredentials | null = null;
  const client = new CorosConnect({
    redirect: redirectUrl,
    credentials,
    onCredentials: (next) => {
      latest = next;
    },
  });
  try {
    await client.connect();
  } catch (e) {
    console.log("- refresh failed:", (e as Error).message);
  } finally {
    await client.close();
  }

  return latest ? encodeCredentials(latest) : null;
};
