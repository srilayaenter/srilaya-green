"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm font-bold text-red-600 hover:text-red-800"
    >
      Sign Out
    </button>
  );
}
