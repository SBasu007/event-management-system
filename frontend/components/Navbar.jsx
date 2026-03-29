"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfilePanel from "./ProfilePanel";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
 

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <Link href="/">EventZen</Link>
        </div>

        <nav className="nav-center" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
        </nav>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="register-link">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="nav-user-name">{user.name}</span>

              <button
                onClick={() => setIsPanelOpen(true)}
                className="profile-button"
                title="Open profile"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
            </>
          )}
        </div>
      </header>

      <ProfilePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        user={user}
        logout={logout}
      />
    </>
  );
}