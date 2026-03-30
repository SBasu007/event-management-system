"use client";

import { useEffect, useMemo, useState } from "react";
import { adminLogin, getAdminMe } from "@/services/auth.service";
import {
  createAdminVendor,
  createAdminVenue,
  getAdminMasterEvents,
  getVendors,
  getVenues,
  updateAdminVendor,
  updateAdminVenue,
} from "@/services/event.service";

const EMPTY_VENUE = {
  name: "",
  location: "",
  capacity: "",
  price: "",
  imgUrl: "",
};

const EMPTY_VENDOR = {
  name: "",
  type: "",
  contact: "",
  price: "",
  imgUrl: "",
};

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [masterEvents, setMasterEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [newVenue, setNewVenue] = useState(EMPTY_VENUE);
  const [newVendor, setNewVendor] = useState(EMPTY_VENDOR);
  const [saving, setSaving] = useState(false);

  const [venueEdits, setVenueEdits] = useState({});
  const [vendorEdits, setVendorEdits] = useState({});

  const hydrateAdmin = async (token) => {
    const [adminRes, venuesRes, vendorsRes, masterEventsRes] = await Promise.all([
      getAdminMe(token),
      getVenues(),
      getVendors(),
      getAdminMasterEvents(token),
    ]);

    setAdminProfile(adminRes.data ?? null);
    setVenues(Array.isArray(venuesRes.data) ? venuesRes.data : []);
    setVendors(Array.isArray(vendorsRes.data) ? vendorsRes.data : []);
    setMasterEvents(Array.isArray(masterEventsRes.data) ? masterEventsRes.data : []);
  };

  const loadDashboard = async (token) => {
    try {
      setDataLoading(true);
      setDataError("");
      await hydrateAdmin(token);
    } catch (err) {
      setDataError(err?.response?.data?.error || "Unable to load admin dashboard.");
      throw err;
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("adminToken");

    if (!stored) {
      setInitializing(false);
      return;
    }

    setAdminToken(stored);

    loadDashboard(stored)
      .catch(() => {
        localStorage.removeItem("adminToken");
        setAdminToken("");
        setAdminProfile(null);
        setAuthError("Session expired. Please login again.");
      })
      .finally(() => setInitializing(false));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setAuthError("");

      const res = await adminLogin(loginForm);
      const token = res.data?.token;

      if (!token) {
        setAuthError("No admin token received.");
        return;
      }

      localStorage.setItem("adminToken", token);
      setAdminToken(token);
      await loadDashboard(token);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      setAuthError(err?.response?.data?.error || "Invalid admin credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken("");
    setAdminProfile(null);
    setMasterEvents([]);
    setVenues([]);
    setVendors([]);
  };

  const refreshAll = async () => {
    if (!adminToken) return;
    await loadDashboard(adminToken);
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      setSaving(true);
      await createAdminVenue(adminToken, {
        ...newVenue,
        capacity: Number(newVenue.capacity || 0),
        price: Number(newVenue.price || 0),
      });
      setNewVenue(EMPTY_VENUE);
      await refreshAll();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Unable to create venue");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      setSaving(true);
      await createAdminVendor(adminToken, {
        ...newVendor,
        price: Number(newVendor.price || 0),
      });
      setNewVendor(EMPTY_VENDOR);
      await refreshAll();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Unable to create vendor");
    } finally {
      setSaving(false);
    }
  };

  const visibleEvents = useMemo(() => {
    return [...masterEvents].sort((a, b) => {
      const aDate = String(a.eventDate || "");
      const bDate = String(b.eventDate || "");
      return aDate.localeCompare(bDate);
    });
  }, [masterEvents]);

  if (initializing) {
    return (
      <div className="mx-auto w-[min(1120px,92%)] py-6">
        <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
          Loading admin panel...
        </div>
      </div>
    );
  }

  if (!adminToken) {
    return (
      <div className="flex min-h-screen items-center justify-center py-6">
        <section className="grid max-w-[520px] gap-4 rounded-2xl border border-violet-300 bg-gradient-to-b from-violet-100 to-white p-6 shadow-[0_12px_30px_rgba(109,40,217,0.12)]">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Admin Portal</p>
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-600">Manage venues, vendors, and an event-level master view from one place.</p>

          <form onSubmit={handleLoginSubmit} className="mt-2 grid gap-4">
            <label className="grid gap-1 text-sm font-semibold text-violet-950">
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                className="rounded-xl border border-violet-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-600"
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-violet-950">
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="rounded-xl border border-violet-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-600"
                required
              />
            </label>

            {authError ? <p className="text-sm font-semibold text-red-700">{authError}</p> : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#4338ca] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Login as Admin"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-[min(1120px,92%)] gap-5 py-6">
      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-100 to-fuchsia-50 p-5 md:flex-row">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Admin Control Center</p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Welcome{adminProfile?.name ? `, ${adminProfile.name}` : ""}</h1>
          <p className="mt-1 text-sm text-slate-600">Use this panel to add and edit vendors/venues and review all events at a glance.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={handleAdminLogout}
        >
          Logout
        </button>
      </section>

      {dataError ? <p className="text-sm font-semibold text-red-700">{dataError}</p> : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-violet-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-violet-900">Venues</h2>
          <form className="grid gap-2.5" onSubmit={handleCreateVenue}>
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Name" value={newVenue.name} onChange={(e) => setNewVenue((p) => ({ ...p, name: e.target.value }))} required />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Location" value={newVenue.location} onChange={(e) => setNewVenue((p) => ({ ...p, location: e.target.value }))} />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Capacity" type="number" min="0" value={newVenue.capacity} onChange={(e) => setNewVenue((p) => ({ ...p, capacity: e.target.value }))} />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Price" type="number" min="0" step="0.01" value={newVenue.price} onChange={(e) => setNewVenue((p) => ({ ...p, price: e.target.value }))} />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Image URL" value={newVenue.imgUrl} onChange={(e) => setNewVenue((p) => ({ ...p, imgUrl: e.target.value }))} />
            <button
              className="inline-flex items-center justify-center rounded-xl bg-[#4338ca] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-65"
              type="submit"
              disabled={saving}
            >
              Add Venue
            </button>
          </form>

          <div className="mt-3 grid max-h-[340px] gap-2.5 overflow-auto pr-1">
            {venues.map((venue) => {
              const draft = venueEdits[venue.id] || {
                name: venue.name || "",
                location: venue.location || "",
                capacity: String(venue.capacity ?? ""),
                price: String(venue.price ?? ""),
                imgUrl: venue.imgUrl || "",
              };

              return (
                <div key={venue.id} className="grid gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3">
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.name} onChange={(e) => setVenueEdits((prev) => ({ ...prev, [venue.id]: { ...draft, name: e.target.value } }))} />
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.location} onChange={(e) => setVenueEdits((prev) => ({ ...prev, [venue.id]: { ...draft, location: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" type="number" min="0" value={draft.capacity} onChange={(e) => setVenueEdits((prev) => ({ ...prev, [venue.id]: { ...draft, capacity: e.target.value } }))} placeholder="Capacity" />
                    <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setVenueEdits((prev) => ({ ...prev, [venue.id]: { ...draft, price: e.target.value } }))} placeholder="Price" />
                  </div>
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.imgUrl} onChange={(e) => setVenueEdits((prev) => ({ ...prev, [venue.id]: { ...draft, imgUrl: e.target.value } }))} placeholder="Image URL" />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        await updateAdminVenue(adminToken, venue.id, {
                          ...draft,
                          capacity: Number(draft.capacity || 0),
                          price: Number(draft.price || 0),
                        });
                        await refreshAll();
                      } catch (err) {
                        window.alert(err?.response?.data?.error || "Unable to update venue");
                      }
                    }}
                  >
                    Save Venue
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-violet-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-violet-900">Vendors</h2>
          <form className="grid gap-2.5" onSubmit={handleCreateVendor}>
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Name" value={newVendor.name} onChange={(e) => setNewVendor((p) => ({ ...p, name: e.target.value }))} required />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Type (catering, music...)" value={newVendor.type} onChange={(e) => setNewVendor((p) => ({ ...p, type: e.target.value }))} required />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Contact" value={newVendor.contact} onChange={(e) => setNewVendor((p) => ({ ...p, contact: e.target.value }))} />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Price" type="number" min="0" step="0.01" value={newVendor.price} onChange={(e) => setNewVendor((p) => ({ ...p, price: e.target.value }))} />
            <input className="rounded-xl border border-violet-300 px-3 py-2 text-sm outline-none focus:border-violet-600" placeholder="Image URL" value={newVendor.imgUrl} onChange={(e) => setNewVendor((p) => ({ ...p, imgUrl: e.target.value }))} />
            <button
              className="inline-flex items-center justify-center rounded-xl bg-[#4338ca] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-65"
              type="submit"
              disabled={saving}
            >
              Add Vendor
            </button>
          </form>

          <div className="mt-3 grid max-h-[340px] gap-2.5 overflow-auto pr-1">
            {vendors.map((vendor) => {
              const draft = vendorEdits[vendor.id] || {
                name: vendor.name || "",
                type: vendor.type || "",
                contact: vendor.contact || "",
                price: String(vendor.price ?? ""),
                imgUrl: vendor.imgUrl || "",
              };

              return (
                <div key={vendor.id} className="grid gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3">
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.name} onChange={(e) => setVendorEdits((prev) => ({ ...prev, [vendor.id]: { ...draft, name: e.target.value } }))} />
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.type} onChange={(e) => setVendorEdits((prev) => ({ ...prev, [vendor.id]: { ...draft, type: e.target.value } }))} />
                  <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.contact} onChange={(e) => setVendorEdits((prev) => ({ ...prev, [vendor.id]: { ...draft, contact: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setVendorEdits((prev) => ({ ...prev, [vendor.id]: { ...draft, price: e.target.value } }))} placeholder="Price" />
                    <input className="rounded-lg border border-violet-300 px-2.5 py-2 text-sm outline-none focus:border-violet-600" value={draft.imgUrl} onChange={(e) => setVendorEdits((prev) => ({ ...prev, [vendor.id]: { ...draft, imgUrl: e.target.value } }))} placeholder="Image URL" />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        await updateAdminVendor(adminToken, vendor.id, {
                          ...draft,
                          price: Number(draft.price || 0),
                        });
                        await refreshAll();
                      } catch (err) {
                        window.alert(err?.response?.data?.error || "Unable to update vendor");
                      }
                    }}
                  >
                    Save Vendor
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-violet-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold text-violet-900">Master Events View</h2>
        {dataLoading ? <p className="text-sm text-slate-600">Loading events...</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-violet-100 px-2 py-2 text-left text-sm font-bold text-violet-800">Event</th>
                <th className="border-b border-violet-100 px-2 py-2 text-left text-sm font-bold text-violet-800">Date</th>
                <th className="border-b border-violet-100 px-2 py-2 text-left text-sm font-bold text-violet-800">Time</th>
                <th className="border-b border-violet-100 px-2 py-2 text-left text-sm font-bold text-violet-800">Venue</th>
                <th className="border-b border-violet-100 px-2 py-2 text-left text-sm font-bold text-violet-800">Vendors</th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.map((event) => (
                <tr key={event.id}>
                  <td className="border-b border-violet-50 px-2 py-2 text-sm text-slate-800">{event.title || "Untitled"}</td>
                  <td className="border-b border-violet-50 px-2 py-2 text-sm text-slate-800">{event.eventDate || "-"}</td>
                  <td className="border-b border-violet-50 px-2 py-2 text-sm text-slate-800">{event.eventTime || "-"}</td>
                  <td className="border-b border-violet-50 px-2 py-2 text-sm text-slate-800">{event.venue?.name || "-"}</td>
                  <td className="border-b border-violet-50 px-2 py-2 text-sm text-slate-800">{Array.isArray(event.vendors) && event.vendors.length > 0 ? event.vendors.map((v) => v.name).join(", ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
