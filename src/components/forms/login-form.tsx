"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import type { UserRole } from "@/constants/roles";

const initialState: AuthActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : label}
    </Button>
  );
}

interface LoginFormProps {
  callbackUrl?: string;
  expectedRole?: UserRole;
  /** Pass null to hide the signup link (e.g. admin login). */
  signupHref?: string | null;
  submitLabel?: string;
}

export function LoginForm({
  callbackUrl,
  expectedRole,
  signupHref = "/signup",
  submitLabel = "Sign in",
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {expectedRole ? (
        <input type="hidden" name="expectedRole" value={expectedRole} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />

      {signupHref ? (
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={signupHref} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      ) : null}
    </form>
  );
}
