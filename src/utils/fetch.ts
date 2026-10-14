import { API_ROUTES } from "@/constants";

interface DecodedEmailResponse {
  data?: { decoded?: string };
}

interface ApiErrorResponse {
  error?: string;
}

export async function fetchDecodedEmail(
  EMEID: string,
  CUHID = "",
  signal?: AbortSignal,
): Promise<string | undefined> {
  const params = new URLSearchParams({ EMEID, ...(CUHID ? { CUHID } : {}) });
  const response = await fetch(`${API_ROUTES.DECODE_EMEID}?${params}`, {
    signal,
  });

  if (!response.ok) return undefined;

  const json = (await response.json()) as DecodedEmailResponse;
  return json.data?.decoded;
}

export async function postForm(
  url: string,
  body: URLSearchParams,
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;
    throw new Error(errorData.error ?? "Unsubscribe request failed");
  }
}
