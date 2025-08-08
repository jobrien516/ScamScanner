import { DEMO_SITES } from '@/constants';

const base_api_url = 'http://127.0.0.1:8000';

export class WebsiteFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebsiteFetchError';
  }
}

export async function fetchWebsiteHtml(url: string): Promise<string> {
  // Normalize URL to easily match demo sites
  const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  if (DEMO_SITES[normalizedUrl]) {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve(DEMO_SITES[normalizedUrl]);
  }

  const response = await fetch(`${base_api_url}/fetch-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    throw new WebsiteFetchError(errorDetail || 'Failed to fetch website HTML from server.');
  }
  
  // The response body is the raw HTML text
  return response.text();
}

// export async function fetchWebsiteHtml(url: string): Promise<string> {
//   // Normalize URL to easily match demo sites
//   const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

//   if (DEMO_SITES[normalizedUrl]) {
//     // Simulate network delay
//     await new Promise(res => setTimeout(res, 500));
//     return Promise.resolve(DEMO_SITES[normalizedUrl]);
//   }

//   const response = await fetch(`${base_api_url}/download-site`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ url }),
//   });
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     throw new WebsiteFetchError(error.detail || 'Failed to fetch website');
//   }
//   return response.text();


  // In a real-world app, this would be a backend API call.
  // For this client-side example, we signal that we can't fetch it
  // due to browser security (CORS) and must rely on manual input.
  // throw new WebsiteFetchError("Automatic fetching is only available for demo sites due to browser security restrictions. Please provide the HTML source code manually.");
// }
