import { getViewCount } from "@features/analytics/actions";
import Link from "next/link";

export const Author = async () => {
  const viewCount = await getViewCount();

  return (
    <span className="text-xs text-gray-600 font-thin absolute bottom-5 left-1/2 -translate-x-1/2">
      a product developed by&nbsp;
      <Link
        href="https://github.com/nqhd3v"
        target="_blank"
        className="text-gray-900 font-normal"
      >
        @nqhd3v
      </Link>
      &nbsp;
      {viewCount !== null && <span>[{viewCount}]</span>}
    </span>
  );
};
