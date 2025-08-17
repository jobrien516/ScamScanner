export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const STRIPE_PUBLIC_ID = process.env.NEXT_PUBLIC_STRIPE_ID;

export * from "./pageContent";
