import type { AuthProvider } from "@refinedev/core";
import { SignUpPayload, UserRole } from "@/types";
import { authClient } from "@/lib/auth-client";
import { BACKEND_BASE_URL } from "@/constants";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: UserRole;
  imageCldPubId?: string | null;
};

const normalizeSessionUser = (user: unknown): SessionUser => {
  const source = (user ?? {}) as Partial<SessionUser>;

  return {
    id: source.id ?? "",
    email: source.email ?? "",
    name: source.name ?? "",
    image: source.image ?? undefined,
    role: source.role ?? UserRole.STUDENT,
    imageCldPubId: source.imageCldPubId ?? undefined,
  };
};

const setUserState = (user: SessionUser | null) => {
  if (!user) {
    localStorage.removeItem("user");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
};

const getSessionUser = async () => {
  const { data, error } = await authClient.getSession();

  if (error || !data?.user) {
    return null;
  }

  return normalizeSessionUser(data.user);
};

const authEndpoint = (path: string) => `${BACKEND_BASE_URL}auth/${path}`;

export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
        role,
        imageCldPubId,
      } as SignUpPayload);

      if (error) {
        return {
          success: false,
          error: {
            name: "Registration failed",
            message:
              error?.message || "Unable to create account. Please try again.",
          },
        };
      }

      const user = normalizeSessionUser(data.user);
      setUserState(user);
      console.log("Authenticated user profile:", user);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: "Unable to create account. Please try again.",
        },
      };
    }
  },
  login: async ({ email, password }) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error from auth client:", error);
        return {
          success: false,
          error: {
            name: "Login failed",
            message: error?.message || "Please try again later.",
          },
        };
      }

      const user = normalizeSessionUser(data.user);
      setUserState(user);
      console.log("Authenticated user profile:", user);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Login exception:", error);
      return {
        success: false,
        error: {
          name: "Login failed",
          message: "Please try again later.",
        },
      };
    }
  },
  logout: async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: {
          name: "Logout failed",
          message: "Unable to log out. Please try again.",
        },
      };
    }

    setUserState(null);

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  forgotPassword: async ({ email }) => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const response = await fetch(authEndpoint("request-password-reset"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "Forgot password failed",
            message: "Unable to send reset link. Please try again.",
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Forgot password exception:", error);
      return {
        success: false,
        error: {
          name: "Forgot password failed",
          message: "Unable to send reset link. Please try again.",
        },
      };
    }
  },
  updatePassword: async ({ password, token }) => {
    try {
      const response = await fetch(authEndpoint("reset-password"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "Update password failed",
            message: "Unable to update password. Please request a new link.",
          },
        };
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      console.error("Update password exception:", error);
      return {
        success: false,
        error: {
          name: "Update password failed",
          message: "Unable to update password. Please request a new link.",
        },
      };
    }
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    const user = await getSessionUser();

    if (user) {
      setUserState(user);
      console.log("Authenticated user profile:", user);

      return {
        authenticated: true,
      };
    }

    setUserState(null);

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
      error: {
        name: "Unauthorized",
        message: "Check failed",
      },
    };
  },
  getPermissions: async () => {
    const user = await getSessionUser();

    if (!user) return null;

    return {
      role: user.role,
    };
  },
  getIdentity: async () => {
    const user = await getSessionUser();

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? undefined,
      role: user.role,
      imageCldPubId: user.imageCldPubId ?? undefined,
    };
  },
};
