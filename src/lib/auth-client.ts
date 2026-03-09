import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "../constants";

const normalizeLocalBackendBaseURL = () => {
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

    return url.toString();
  } catch {
    return raw;
  }
};

export const authClient = createAuthClient({
  baseURL: `${normalizeLocalBackendBaseURL()}auth`,
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
