import { connection } from "next/server";
import { checkCorosConnectState, getCorosTools } from "./actions";
import { FeaturePicker } from "./feature";
import LoginCoros from "./login-button";
import { AuthorizationResult } from "./result";

export async function CorosFeatures({ result }: { result?: string }) {
  // COROS calls hit the network with live tokens; never run them in a
  // prerender (runtime prefetch aborts fetch -> looks logged out)
  await connection();
  const isConnected = await checkCorosConnectState();

  if (!isConnected) {
    return (
      <>
        <AuthorizationResult result={result} />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <span className="block text-gray-600 text-xs whitespace-nowrap">
            Try this
          </span>
          <LoginCoros />
          <span className="block text-gray-600 text-xs whitespace-nowrap">
            to see the magic!
          </span>
        </div>
      </>
    );
  }

  const tools = await getCorosTools();
  return (
    <>
      <AuthorizationResult result={result} />
      <FeaturePicker
        tools={tools?.tools ?? []}
        availables={tools?.availableTools ?? []}
      />
    </>
  );
}
