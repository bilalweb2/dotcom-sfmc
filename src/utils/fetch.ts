import { API_ROUTES } from "@/constants";

interface DecodedEmailResponse {
  data?: { decoded?: string };
}

interface ApiErrorResponse {
  error?: string;
}

const FETCH_TIMEOUT_MS = 10_000;

async function withFetchTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  externalSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromExternalSignal = () =>
    controller.abort(externalSignal?.reason);

  if (externalSignal?.aborted) {
    abortFromExternalSignal();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternalSignal, {
      once: true,
    });
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  try {
    return await request(controller.signal);
  } catch (error) {
    if (timedOut) {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
}

export async function fetchDecodedEmail(
  EMEID: string,
  CUHID = "",
  signal?: AbortSignal,
): Promise<string | undefined> {
  const params = new URLSearchParams({ EMEID, ...(CUHID ? { CUHID } : {}) });
  return withFetchTimeout(async (requestSignal) => {
    const response = await fetch(`${API_ROUTES.DECODE_EMEID}?${params}`, {
      signal: requestSignal,
    });

    if (!response.ok) return undefined;

    const json = (await response.json()) as DecodedEmailResponse;
    return json.data?.decoded;
  }, signal);
}

export async function postForm(
  url: string,
  body: URLSearchParams,
): Promise<void> {
  await withFetchTimeout(async (signal) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ApiErrorResponse;
      throw new Error(errorData.error ?? "Unsubscribe request failed");
    }
  });
}
