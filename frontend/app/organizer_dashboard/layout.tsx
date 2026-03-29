"use client";

import OrganzierSidepanel from "../../components/OrganzierSidepanel";
import { ReactNode } from "react";

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#efecfb]">
      
      {/* LEFT PANEL (fixed) */}
      <OrganzierSidepanel />

      {/* SPACER */}
      <div className="w-64"></div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-[#f6f3ff] p-6">
        {children}
      </div>

    </div>
  );
}