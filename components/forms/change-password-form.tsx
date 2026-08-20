"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/profile-actions";
import { initialActionState } from "@/actions/action-state";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialActionState);
  return <form className="auth-form profile-form" action={action}>
    <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
    <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" />
    <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" />
    {state.message && <p className={`form-message ${state.status}`} role="status">{state.message}</p>}
    <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
  </form>;
}
