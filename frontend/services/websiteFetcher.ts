import { DEMO_SITES } from "@/constants";
import { BACKEND_API_URL } from "@/constants";

export class WebsiteFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebsiteFetchError";
  }
}

export async function fetchWebsiteHtml(url: string): Promise<string> {
  // Normalize URL to easily match demo sites
  const normalizedUrl = url
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "");

  if (DEMO_SITES[normalizedUrl]) {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 500));
    return Promise.resolve(DEMO_SITES[normalizedUrl]);
  }

  const response = await fetch(`${BACKEND_API_URL}/fetch-html`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    throw new WebsiteFetchError(
      errorDetail || "Failed to fetch website HTML from server."
    );
  }

  return response.text();
}
