"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfilePanel from "./ProfilePanel";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };
 

  return (
    <>
      <header className="navbar">
        <div className="nav-brand">
          <Link href="/">EventZen</Link>
        </div>

        <nav className="nav-center" aria-label="Primary navigation">
          <Link href="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
            Home
          </Link>
          <Link
            href="/events"
            className={`nav-link ${isActive("/events") ? "nav-link-active" : ""}`}
          >
            Events
          </Link>
          {/* <Link
            href="/admin"
            className={`nav-link ${isActive("/admin") ? "nav-link-active" : ""}`}
          >
            Admin
          </Link> */}
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