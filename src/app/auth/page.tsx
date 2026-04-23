"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          mode === "login"
            ? { email, password }
            : {
                name,
                email,
                password,
                phone
              }
        )
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-amber-100 bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Account</p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>

      <div className="mt-5 inline-flex rounded-full border border-amber-200 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-1 ${mode === "login" ? "bg-brand-600 text-white" : "text-ink/70"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-full px-4 py-1 ${mode === "register" ? "bg-brand-600 text-white" : "text-ink/70"}`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <label className="block text-sm">
            <span>Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span>Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2"
          />
        </label>

        {mode === "register" ? (
          <label className="block text-sm">
            <span>Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 px-3 py-2"
            />
          </label>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>

        {status ? <p className="text-sm text-rose-600">{status}</p> : null}
      </form>

      <p className="mt-4 text-xs text-ink/50">
        OTP and social login can be added later by integrating Firebase Auth or Auth.js providers.
      </p>
    </div>
  );
}
