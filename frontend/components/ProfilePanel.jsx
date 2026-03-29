"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfilePanel({ isOpen, onClose, user, logout }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleManageEvents = () => {
    router.push("/organizer_dashboard/events");
    onClose();
  };
    const handleViewBookings = () => {
    router.push("/bookings");
    onClose();
  };


  return (
    <>
      {/* Backdrop */}
      <div
        className="profile-panel-backdrop"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`profile-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="profile-panel-header">
          <button className="back-button" onClick={onClose} title="Close">
            <ChevronLeft size={18} />
          </button>
          <h2>Profile</h2>
        </div>

        {/* User Info */}
        <div className="profile-user-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-user-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="profile-section">
          <button className="profile-action-item with-arrow" onClick={handleViewBookings}>
            <span>View all bookings</span>
            <ChevronRight size={16} className="arrow" />
          </button>
        </div>

        {user?.is_organizer && (
          <div className="profile-section">
            <h4 className="profile-section-title">Organizer Dashboard</h4>
            <button onClick={handleManageEvents} className="profile-action-item with-arrow">
              <span>Manage events</span>
              <ChevronRight size={16} className="arrow" />
            </button>
          </div>
        )}

        {/* Support Section */}
        <div className="profile-section">
          <h4 className="profile-section-title">Support</h4>
          <button className="profile-action-item with-arrow">
            <span>Chat with us</span>
            <ChevronRight size={16} className="arrow" />
          </button>
        </div>

        {/* More Section */}
        {/* <div className="profile-section">
          <h4 className="profile-section-title">More</h4>
          <button className="profile-action-item with-arrow">
            <span>Terms & Conditions</span>
            <span className="arrow">→</span>
          </button>
          <button className="profile-action-item with-arrow">
            <span>Privacy Policy</span>
            <span className="arrow">→</span>
          </button>
        </div> */}

        {/* Logout Button */}
        <div className="profile-section">
          <button
            onClick={handleLogout}
            className="profile-logout-btn"
          >
            <span className="action-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
