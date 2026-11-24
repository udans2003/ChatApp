
import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
} from "./profileApi";

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
  const [profilePicture, setProfilePicture] = useState("");
  const [originalProfilePicture, setOriginalProfilePicture] = useState("");

  function handlePictureChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please select a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture(String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await getMyProfile();

        if (!active) return;

        setProfile(data.user);
        setUsername(data.user.username);
        setProfilePicture(data.user.profilePicture || "");
        setOriginalProfilePicture(data.user.profilePicture || "");
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
      const data = await updateMyProfile(username, profilePicture);

      setProfile(data.user);
      setUsername(data.user.username);
      setProfilePicture(data.user.profilePicture || "");
      setOriginalProfilePicture(data.user.profilePicture || "");
      setEditing(false);
      setSuccess("Profile updated successfully!");

      onProfileUpdated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-5">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">My Profile</h2>

          <button
            type="button"
            className="text-2xl text-slate-500 hover:text-slate-800"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading profile...</p>
        ) : profile ? (
          <>
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="relative h-20 w-20">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={`${profile.username}'s profile`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-teal-100 text-3xl font-bold text-teal-800">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-slate-900">{profile.username}</h3>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>

            {editing ? (
              <form
                onSubmit={handleSave}
                className="flex flex-col gap-3"
              >
                <label
                  htmlFor="profile-picture"
                  className="mx-auto cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Change Profile Picture
                </label>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePictureChange}
                  className="hidden"
                />

                <label htmlFor="profile-username" className="text-xs font-bold text-slate-700">
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
                  className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-lg bg-teal-700 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="h-11 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile.username);
                    setProfilePicture(originalProfilePicture);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="h-11 w-full rounded-lg bg-teal-700 text-sm font-bold text-white hover:bg-teal-800"
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
