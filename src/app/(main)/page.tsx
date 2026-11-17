import { CorosFeatures } from "@features/coros";

export default async function Home(props: PageProps<"/">) {
  const { result } = await props.searchParams;

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div className="border border-gray-200 bg-white p-5 w-[calc(100%-40px)] max-w-100">
        <CorosFeatures result={result as string} />
      </div>
    </main>
  );
}
