"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const initial = useMemo(() => (email ? email[0].toUpperCase() : "?"), [email]);

  if (!email) {
    return <div className="text-sm opacity-70">Not signed in</div>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800
                   flex items-center justify-center font-semibold"
        title={email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800
                        bg-white dark:bg-zinc-950 shadow-lg p-2">
          <div className="px-2 py-2 text-sm break-all">{email}</div>
          <button
            className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={async () => {
              await supabase.auth.signOut();
              setOpen(false);
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

