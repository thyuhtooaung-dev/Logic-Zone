import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "../constants";

const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

export const normalizeLocalBackendBaseURL = () => {
  const fallback = "http://localhost:3000/api/";
  const raw = BACKEND_BASE_URL || fallback;

  try {
    const url = new URL(raw);

    if (typeof window !== "undefined") {
      const frontendHost = window.location.hostname;
      const backendIsLocal =
        url.hostname === "localhost" || url.hostname === "127.0.0.1";
      const frontendIsLocal =
        frontendHost === "localhost" || frontendHost === "127.0.0.1";

      // Keep both apps on the same local hostname so SameSite cookies work.
      if (backendIsLocal && frontendIsLocal) {
        url.hostname = frontendHost;
      }
    }

    return ensureTrailingSlash(url.toString());
  } catch {
    return ensureTrailingSlash(raw);
  }
};

export const getAuthBaseURL = () =>
  new URL("auth", normalizeLocalBackendBaseURL()).toString();

export const getAuthCredentialsMode = (): RequestCredentials => {
  if (typeof window === "undefined") return "include";

  try {
    const authURL = new URL(getAuthBaseURL());
    return authURL.origin === window.location.origin ? "same-origin" : "include";
  } catch {
    return "include";
  }
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  fetchOptions: {
    credentials: getAuthCredentialsMode(),
  },
  user: {
    additionalFields: {
      role: {
        type: USER_ROLES,
        required: true,
        defaultValue: "student",
        input: true,
      },
      department: {
        type: "string",
        required: false,
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
