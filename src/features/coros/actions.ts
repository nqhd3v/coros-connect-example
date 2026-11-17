"use server";

import CorosConnect, { CorosCredentials } from "@nqhd3v/coros-connect";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  cookieOptions,
  decodeCredentials,
  encodeCredentials,
  redirectUrl,
} from "./credentials";

type Handler = CorosConnect["availableTools"]["handler"];

const isTypedTool = (handler: Handler, name: string): name is keyof Handler =>
  Object.hasOwn(handler, name);

export const saveCredential = async (credentials: CorosCredentials) => {
  const cki = await cookies();
  cki.set(COOKIE_NAME, encodeCredentials(credentials), cookieOptions);
};

const getCoros = async (
  forVerify?: boolean,
): Promise<{
  isConnected: boolean;
  client: CorosConnect;
}> => {
  const cki = await cookies();
  const ckiValue = cki.get(COOKIE_NAME);
  try {
    if (!ckiValue || !ckiValue.value) {
      throw new Error("no cookies setup yet");
    }
    const data = decodeCredentials(ckiValue.value);
    const client = new CorosConnect({
      redirect: redirectUrl,
      credentials: data,
      onCredentials: saveCredential,
    });
    if (!forVerify) await client.connect();
    return { client, isConnected: true };
  } catch (e) {
    console.log("-", (e as Error).message);
    const client = new CorosConnect({
      redirect: redirectUrl,
      onCredentials: saveCredential,
    });

    return {
      client,
      isConnected: false,
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
  return url.toString();
};

/**
 *
 * @param code
 * @returns {Boolean} `false` - Mean connected before; `true` - Mean verify successfully
 */
export const handleCorosAuthCode = async (code: string) => {
  try {
    const coros = await getCoros(true);
    // if (coros.isConnected) return false;
    await coros.client.verifyLoginCode(code);
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
    return {
      data,
      isSupported: true,
    };
  }

  const data = await coros.client.useTool(query, {});
  return { data, isSupported: false };
};

export const logout = async () => {
  const coros = await getCoros();
  if (coros.isConnected) {
    await coros.client.close();
  }
  await clearCookie();
};
