"use client";

import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLink, useUpdatePassword } from "@refinedev/core";

export const ResetPasswordForm = () => {
  const Link = useLink();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError("Missing reset token. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    updatePassword(
      {
        password,
        token,
      },
      {
        onSuccess: (result) => {
          if (result?.success) {
            setIsSuccess(true);
          }
        },
      }
    );
  };

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "min-h-svh"
      )}
    >
      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-blue-600",
              "dark:text-blue-400",
              "text-3xl",
              "font-semibold"
            )}
          >
            Reset password
          </CardTitle>
          <CardDescription className={cn("text-muted-foreground", "font-medium")}>
            Enter your new password.
          </CardDescription>
        </CardHeader>

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleResetPassword} className={cn("space-y-4")}>
            <div className={cn("flex", "flex-col", "gap-2")}>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={cn("flex", "flex-col", "gap-2")}>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {localError ? (
              <p className={cn("text-sm", "text-red-600")}>{localError}</p>
            ) : null}

            {isSuccess ? (
              <p className={cn("text-sm", "text-green-600")}>
                Password updated. You can now sign in.
              </p>
            ) : null}

            <Button
              type="submit"
              className={cn("bg-blue-600", "hover:bg-blue-700", "text-white", "w-full")}
              disabled={isPending || !token}
            >
              {isPending ? "Updating..." : "Update password"}
            </Button>
          </form>

          <div className={cn("mt-8")}>
            <Link
              to="/login"
              className={cn(
                "inline-flex",
                "items-center",
                "gap-2",
                "text-sm",
                "text-muted-foreground",
                "hover:text-foreground",
                "transition-colors"
              )}
            >
              <ArrowLeft className={cn("w-4", "h-4")} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ResetPasswordForm.displayName = "ResetPasswordForm";
