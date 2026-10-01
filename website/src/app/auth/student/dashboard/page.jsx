"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header/Header";
import {
  clearAuthStorage,
  getCurrentUser,
  logoutUser,
  persistProfileInitial,
  updateStudentProfile,
} from "../../../../lib/auth-api";
import styles from "./page.module.css";

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getUserName(user) {
  const metadataName = user?.user_metadata?.full_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user?.email?.split("@")[0] || "Student";
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
      if (!accessToken) {
        router.replace("/auth/student/login");
        return;
      }

      try {
        const currentUser = await getCurrentUser(accessToken);
        if (!isCurrent) return;
        const currentName = getUserName(currentUser);
        setUser(currentUser);
        setFullName(currentName);
        setDraftName(currentName);
        persistProfileInitial(currentName);
      } catch (profileError) {
        if (profileError.status === 401) {
          clearAuthStorage();
          router.replace("/auth/student/login");
          return;
        }
        if (isCurrent) setError(profileError.message || "Unable to load your profile.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isCurrent = false;
    };
  }, [router]);

  async function handleSaveProfile(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const nextName = draftName.trim();
    if (!nextName) {
      setError("Enter your full name.");
      return;
    }

    const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
    if (!accessToken) {
      router.replace("/auth/student/login");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateStudentProfile(accessToken, nextName);
      const updatedName = getUserName(updatedUser);
      setUser(updatedUser);
      setFullName(updatedName);
      setDraftName(updatedName);
      persistProfileInitial(updatedName);
      setIsEditing(false);
      setNotice("Your profile has been updated.");
    } catch (profileError) {
      if (profileError.status === 401) {
        clearAuthStorage();
        router.replace("/auth/student/login");
        return;
      }
      setError(profileError.message || "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");

    try {
      if (accessToken) await logoutUser(accessToken);
    } catch {
      // Clear the local session even if the network logout request fails.
    } finally {
      clearAuthStorage();
      router.replace("/");
    }
  }

  if (isLoading) {
    return (
      <main className={styles.loadingPage}>
        <p>Loading your student profile...</p>
      </main>
    );
  }

  const displayName = fullName || "Student";
  const initials = getInitials(displayName) || "ST";

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.pageHeading}>
          <p className={styles.eyebrow}>STUDENT DASHBOARD</p>
          <h1>Welcome back, {displayName.split(/\s+/)[0]}</h1>
          <p>Your account and learning profile at a glance.</p>
        </div>

        {error && <p className={styles.pageError} role="alert">{error}</p>}
        {notice && <p className={styles.pageNotice} role="status">{notice}</p>}

        <section className={styles.profileCard} id="profile" aria-labelledby="profile-title">
          <div className={styles.profileHeader}>
            <div className={styles.avatar} aria-hidden="true">{initials}</div>
            <div className={styles.profileHeading}>
              <p className={styles.cardEyebrow}>YOUR PROFILE</p>
              <h2 id="profile-title">{displayName}</h2>
              <p>{user?.email || "Email unavailable"}</p>
            </div>
            <div className={styles.profileHeaderActions}>
              {!isEditing && (
                <button
                  className={styles.editButton}
                  type="button"
                  onClick={() => {
                    setDraftName(fullName);
                    setError("");
                    setNotice("");
                    setIsEditing(true);
                  }}
                >
                  Edit profile
                </button>
              )}
              <button
                className={styles.logoutButton}
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Log out"}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form className={styles.editForm} onSubmit={handleSaveProfile}>
              <label className={styles.nameField}>
                <span>Full name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  required
                />
              </label>
              {error && <p className={styles.pageError} role="alert">{error}</p>}
              <div className={styles.editActions}>
                <button className={styles.saveButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={() => {
                    setDraftName(fullName);
                    setError("");
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className={styles.profileDetails}>
              <div>
                <dt>Full name</dt>
                <dd>{displayName}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{user?.email || "Email unavailable"}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>Student</dd>
              </div>
              <div>
                <dt>Email status</dt>
                <dd>{user?.email_confirmed_at ? "Verified" : "Active account"}</dd>
              </div>
            </dl>
          )}
        </section>
      </main>
    </div>
  );
}