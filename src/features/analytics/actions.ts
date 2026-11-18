"use server";

export async function getViewCount() {
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=coros-connect-example`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    return data?.data?.pageViews ?? 0;
  } catch (e) {
    return null;
  }
}
