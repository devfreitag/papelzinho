"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { ErrorNote } from "./ui";
import { field, label } from "./styles";

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, undefined);
  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={label}>Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          aria-invalid={state?.error ? true : undefined}
          className={field}
        />
      </div>
      {state?.error && (
        <ErrorNote>{state.error}</ErrorNote>
      )}
      <SubmitButton>Entrar →</SubmitButton>
    </form>
  );
}
