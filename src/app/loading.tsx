import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr";

export default function Loading() {
  return (
    <main className="flex items-center justify-center w-full min-h-screen">
      <SpinnerIcon className="animate-spin" />
    </main>
  );
}
