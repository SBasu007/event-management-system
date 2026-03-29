"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  BarChart3,
  Utensils,
} from "lucide-react";

export default function OrganzierSidepanel() {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    myEvents: true,
    venues: false,
    vendors: false,
    attendees: false,
    budget: false,
    reports: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionItem = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    <Link href={href}>
      <div className="ml-4 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors hover:text-blue-600">
        {label}
      </div>
    </Link>
  );

  const SectionHeader = ({
    label,
    icon: Icon,
    section,
  }: {
    label: string;
    icon: React.ReactNode;
    section: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        {Icon}
        {label}
      </div>
      <ChevronDown
        size={18}
        className={`transition-transform ${
          expandedSections[section] ? "rotate-180" : ""
        }`}
      />
    </button>
  );

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 fixed left-0 top-[70px] h-[calc(100vh-70px)] overflow-y-auto shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Organizer Hub</h2>
        <p className="text-xs text-gray-500 mt-1">Welcome, {user?.name}</p>
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-2">
        {/* MY EVENTS SECTION */}
        <SectionHeader
          label="My Events"
          icon={<Calendar size={18} className="text-blue-600" />}
          section="myEvents"
        />
        {expandedSections.myEvents && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/events"
              label="Manage Events"
            />
          </div>
        )}

        {/* VENUES SECTION */}
        <SectionHeader
          label="Venues"
          icon={<MapPin size={18} className="text-green-600" />}
          section="venues"
        />
        {expandedSections.venues && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/venues"
              label="Browse Venues"
            />
          </div>
        )}

        {/* VENDORS SECTION */}
        <SectionHeader
          label="Vendors"
          icon={<Utensils size={18} className="text-orange-600" />}
          section="vendors"
        />
        {expandedSections.vendors && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/vendors"
              label="View Vendor List"
            />
          </div>
        )}

        {/* ATTENDEES SECTION */}
        <SectionHeader
          label="Attendees"
          icon={<Users size={18} className="text-purple-600" />}
          section="attendees"
        />
        {expandedSections.attendees && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/attendees"
              label="View Attendees List"
            />
            <SectionItem
              href="/organizer_dashboard/attendees/rsvp"
              label="RSVP Status"
            />
          </div>
        )}

        {/* BUDGET & EXPENSES SECTION */}
        <SectionHeader
          label="Budget & Expenses"
          icon={<DollarSign size={18} className="text-green-700" />}
          section="budget"
        />
        {expandedSections.budget && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/budget"
              label="Set Budget"
            />
            <SectionItem
              href="/organizer_dashboard/expenses"
              label="Add Expenses"
            />
            <SectionItem
              href="/organizer_dashboard/budget/remaining"
              label="View Remaining Budget"
            />
            <SectionItem
              href="/organizer_dashboard/budget/report"
              label="Generate Report"
            />
          </div>
        )}

        {/* REPORTS SECTION */}
        <SectionHeader
          label="Reports"
          icon={<BarChart3 size={18} className="text-red-600" />}
          section="reports"
        />
        {expandedSections.reports && (
          <div className="space-y-1 mb-3">
            <SectionItem
              href="/organizer_dashboard/reports/attendees"
              label="Attendee Count"
            />
            <SectionItem
              href="/organizer_dashboard/reports/expenses"
              label="Expense Summary"
            />
            <SectionItem
              href="/organizer_dashboard/reports/performance"
              label="Event Performance"
            />
          </div>
        )}
      </div>
    </div>
  );
}