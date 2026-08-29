import Image from "next/image";
import { SITE } from "@/lib/site";

/**
 * Shown instead of the site when the Supabase keys are missing, so a fresh
 * checkout explains itself instead of throwing a stack trace.
 */
export function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-brand-100 bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-brand-200"
          />
          <div>
            <h1 className="font-display text-xl font-bold text-brand-800">{SITE.name} — one step left</h1>
            <p className="text-sm text-ink/55">Connect your Supabase project to start the store.</p>
          </div>
        </div>

        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
            <span>
              Create a free project at <strong>supabase.com</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
            <span>
              Open <strong>SQL Editor</strong>, paste everything from{" "}
              <code className="rounded bg-brand-50 px-1">supabase/schema.sql</code> and run it. This creates the
              tables and adds the starting product.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">3</span>
            <span>
              Go to <strong>Project Settings → API</strong> and copy the Project URL and the{" "}
              <strong>service_role</strong> key into <code className="rounded bg-brand-50 px-1">.env.local</code>:
              <span className="mt-2 block rounded-lg bg-brand-50 p-3 font-mono text-xs">
                SUPABASE_URL=https://xxxx.supabase.co
                <br />
                SUPABASE_SERVICE_ROLE_KEY=eyJhbG…
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">4</span>
            <span>Restart the dev server. That is it — the store will load.</span>
          </li>
        </ol>

        <p className="mt-6 rounded-lg bg-cream p-3 text-xs leading-relaxed text-ink/60">
          The service_role key is used only on the server and is never sent to the browser. Keep it out of any file
          that gets committed.
        </p>
      </div>
    </div>
  );
}

export default SetupNotice;
