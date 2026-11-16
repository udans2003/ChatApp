
import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
} from "./profileApi";
import "./ProfilePanel.css";

export default function ProfilePanel({
  onClose,
  onProfileUpdated,
}) {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await getMyProfile();

        if (!active) return;

        setProfile(data.user);
        setUsername(data.user.username);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await updateMyProfile(username);

      setProfile(data.user);
      setUsername(data.user.username);
      setEditing(false);
      setSuccess("Profile updated successfully!");

      onProfileUpdated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-overlay">
      <div className="profile-panel">
        <div className="profile-panel-header">
          <h2>My Profile</h2>

          <button
            type="button"
            className="profile-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {loading ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <>
            <div className="profile-info">
              <div className="profile-large-avatar">
                {profile.username
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3>{profile.username}</h3>
              <p>{profile.email}</p>
            </div>

            {editing ? (
              <form
                onSubmit={handleSave}
                className="profile-edit-form"
              >
                <label htmlFor="profile-username">
                  Username
                </label>

                <input
                  id="profile-username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  minLength={3}
                  maxLength={30}
                  required
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="profile-save-btn"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile.username);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                }}
              >
                Edit Profile
              </button>
            )}
          </>
        ) : null}

        {error && (
          <p className="profile-error">{error}</p>
        )}

        {success && (
          <p className="profile-success">{success}</p>
        )}
      </div>
    </div>
  );
}
