"use server";

import CorosConnect, { CorosCredentials } from "@nqhd3v/coros-connect";
import { cookies, headers } from "next/headers";
import {
  COOKIE_NAME,
  cookieOptions,
  decodeCredentials,
  encodeCredentials,
  getRedirectUrl,
} from "./credentials";

const getRequestRedirectUrl = async () => {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  const proto = hdr.get("x-forwarded-proto") ?? "https";
  return getRedirectUrl(`${proto}://${host}`);
};

type Handler = CorosConnect["availableTools"]["handler"];

const isTypedTool = (handler: Handler, name: string): name is keyof Handler =>
  Object.hasOwn(handler, name);

const getCoros = async (
  connect = true,
): Promise<{
  isConnected: boolean;
  client: CorosConnect;
  persist: () => Promise<void>;
}> => {
  const cki = await cookies();
  const ckiValue = cki.get(COOKIE_NAME);
  const redirectUrl = await getRequestRedirectUrl();
  const pending: { credentials: CorosCredentials | null } = {
    credentials: null,
  };
  const onCredentials = (next: CorosCredentials) => {
    pending.credentials = next;
  };
  const persist = async () => {
    if (!pending.credentials) return;
    cki.set(COOKIE_NAME, encodeCredentials(pending.credentials), cookieOptions);
  };
  try {
    if (!ckiValue || !ckiValue.value) {
      throw new Error("no cookies setup yet");
    }
    const data = decodeCredentials(ckiValue.value);
    const client = new CorosConnect({
      redirect: redirectUrl,
      credentials: data,
      onCredentials,
    });
    if (connect) await client.connect();
    return { client, isConnected: true, persist };
  } catch (e) {
    console.log("-", (e as Error).message);
    const client = new CorosConnect({
      redirect: redirectUrl,
      onCredentials,
    });

    return {
      client,
      isConnected: false,
      persist,
    };
  }
};

export const clearCookie = async () => {
  const cki = await cookies();
  cki.delete(COOKIE_NAME);
};

export const checkCorosConnectState = async () => {
  const coros = await getCoros();
  return coros.isConnected;
};

export const getCorosAuthURL = async (): Promise<string | null> => {
  const coros = await getCoros();
  if (coros.isConnected) return null;
  await clearCookie();
  const url = await coros.client.login();
  await coros.persist();
  return url.toString();
};

/**
 *
 * @param code
 * @returns {Boolean} `false` - Mean connected before; `true` - Mean verify successfully
 */
export const handleCorosAuthCode = async (code: string) => {
  try {
    const coros = await getCoros(false);
    // if (coros.isConnected) return false;
    await coros.client.verifyLoginCode(code);
    await coros.persist();
    return true;
  } catch (e) {
    console.log("-", (e as Error).message);
    return false;
  }
};

export const getCorosTools = async () => {
  const coros = await getCoros();
  if (!coros.isConnected) return null;
  const { tools: availableTools } = coros.client.availableTools;
  const tools = await coros.client.tools();
  return {
    availableTools,
    tools,
  };
};

export const queryCoros = async (query: string) => {
  const coros = await getCoros();
  if (!coros.isConnected) return null;
  const { handler } = coros.client.availableTools;
  if (isTypedTool(handler, query)) {
    const data = await coros.client[handler[query]]?.();
    await coros.persist();
    return {
      data,
      isSupported: true,
    };
  }

  const data = await coros.client.useTool(query, {});
  await coros.persist();
  return { data, isSupported: false };
};

export const logout = async () => {
  const coros = await getCoros();
  if (coros.isConnected) {
    await coros.client.close();
  }
  await clearCookie();
};
