"use server";

import CorosConnect, { CorosCredentials } from "@nqhd3v/coros-connect";
import { decrypt, encrypt } from "@nqhd3v/coros-connect/crypto";
import { cookies } from "next/headers";

type Handler = CorosConnect["availableTools"]["handler"];

const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_PATH}/auth/coros`;

const encryptData = async (input: string) =>
  encrypt(input, process.env.ENC_SECRET_STR);

const decryptData = async (input: string) =>
  decrypt(input, process.env.ENC_SECRET_STR);

const isTypedTool = (handler: Handler, name: string): name is keyof Handler =>
  Object.hasOwn(handler, name);

const isHttpOnly = process.env.NODE_ENV === "production";

export const saveCredential = async (credentials: CorosCredentials) => {
  const cki = await cookies();

  const txt = await encryptData(JSON.stringify(credentials));
  cki.set("coros-client", txt, {
    sameSite: true,
    httpOnly: isHttpOnly,
    secure: true,
  });
};

const getCoros = async (
  forVerify?: boolean,
): Promise<{
  isConnected: boolean;
  client: CorosConnect;
}> => {
  const cki = await cookies();
  const ckiValue = cki.get("coros-client");
  try {
    if (!ckiValue || !ckiValue.value) {
      throw new Error("no cookies setup yet");
    }
    const dataStr = await decryptData(ckiValue.value);
    const data = JSON.parse(dataStr);
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
  cki.delete("coros-client");
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
