"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { initialActionState } from "@/actions/action-state";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);
  return <form className="auth-form" action={action}>
    <FormField label="Email" name="email" type="email" autoComplete="email" />
    <FormField label="Password" name="password" type="password" autoComplete="current-password" />
    {state.message && <p className="form-message error" role="alert">{state.message}</p>}
    <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
  </form>;
}
