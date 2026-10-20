"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header/Header";
import LoadingIndicator from "../../../../components/common/LoadingIndicator/LoadingIndicator";
import {
  clearAuthStorage,
  getCurrentUser,
  getStudentPortfolio,
  logoutUser,
  persistProfileInitial,
  updateStudentPortfolio,
  updateStudentProfile,
} from "../../../../lib/auth-api";
import styles from "./page.module.css";
import { userFacingError } from "../../../../lib/user-facing-error";

const EMPTY_PORTFOLIO = { skills: [], projects: [] };

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
  const [portfolio, setPortfolio] = useState(EMPTY_PORTFOLIO);
  const [draftSkills, setDraftSkills] = useState("");
  const [draftProjects, setDraftProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
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

        const currentPortfolio = await getStudentPortfolio(accessToken);
        if (!isCurrent) return;
        setPortfolio(currentPortfolio || EMPTY_PORTFOLIO);
      } catch (profileError) {
        if (profileError.status === 401) {
          clearAuthStorage();
          router.replace("/auth/student/login");
          return;
        }
        if (isCurrent) setError(userFacingError(profileError, "We couldn’t load your profile. Please try again."));
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
      setError(userFacingError(profileError, "We couldn’t update your profile. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  function startPortfolioEdit() {
    setDraftSkills(portfolio.skills.join("\n"));
    setDraftProjects(portfolio.projects.map((project) => ({
      ...project,
      technologies: project.technologies.join(", "),
    })));
    setError("");
    setNotice("");
    setIsEditingPortfolio(true);
  }

  async function handleSavePortfolio(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
    if (!accessToken) {
      router.replace("/auth/student/login");
      return;
    }

    const nextPortfolio = {
      skills: draftSkills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean),
      projects: draftProjects.map((project) => ({
        ...project,
        technologies: project.technologies.split(",").map((technology) => technology.trim()).filter(Boolean),
      })),
    };

    setIsSavingPortfolio(true);
    try {
      const savedPortfolio = await updateStudentPortfolio(accessToken, nextPortfolio);
      setPortfolio(savedPortfolio);
      setIsEditingPortfolio(false);
      setNotice("Your skills and projects have been updated.");
    } catch (portfolioError) {
      if (portfolioError.status === 401) {
        clearAuthStorage();
        router.replace("/auth/student/login");
        return;
      }
      setError(userFacingError(portfolioError, "We couldn’t update your skills and projects. Please try again."));
    } finally {
      setIsSavingPortfolio(false);
    }
  }

  function addProject() {
    setDraftProjects((projects) => [
      ...projects,
      { title: "", description: "", technologies: "", url: "" },
    ]);
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
      <LoadingIndicator
        className={styles.loadingPage}
        label="Loading your student profile…"
      />
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

        <section className={styles.portfolioCard} aria-labelledby="portfolio-title">
          <div className={styles.portfolioHeader}>
            <div>
              <p className={styles.cardEyebrow}>YOUR EXPERIENCE</p>
              <h2 id="portfolio-title">Skills &amp; projects</h2>
              <p>Showcase the skills you have learned and the projects you have built.</p>
            </div>
            {!isEditingPortfolio && (
              <button className={styles.editButton} type="button" onClick={startPortfolioEdit}>
                Edit skills &amp; projects
              </button>
            )}
          </div>

          {isEditingPortfolio ? (
            <form className={styles.portfolioForm} onSubmit={handleSavePortfolio}>
              <label className={styles.portfolioField}>
                <span>Skills</span>
                <textarea
                  value={draftSkills}
                  onChange={(event) => setDraftSkills(event.target.value)}
                  placeholder={"JavaScript\nReact\nUI design"}
                  maxLength={3000}
                  rows={4}
                />
                <small>Enter one skill per line or separate skills with commas (up to 30).</small>
              </label>

              <div className={styles.projectEditorHeader}>
                <h3>Projects</h3>
                <button className={styles.addProjectButton} type="button" onClick={addProject}>
                  Add project
                </button>
              </div>
              {draftProjects.map((project, index) => (
                <fieldset className={styles.projectEditor} key={`project-${index}`}>
                  <legend>Project {index + 1}</legend>
                  <button
                    className={styles.removeProjectButton}
                    type="button"
                    onClick={() => setDraftProjects((projects) => projects.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label={`Remove project ${index + 1}`}
                  >
                    Remove
                  </button>
                  <label className={styles.portfolioField}>
                    <span>Project name</span>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(event) => setDraftProjects((projects) => projects.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, title: event.target.value } : item))}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label className={styles.portfolioField}>
                    <span>Description</span>
                    <textarea
                      value={project.description}
                      onChange={(event) => setDraftProjects((projects) => projects.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, description: event.target.value } : item))}
                      maxLength={1000}
                      rows={3}
                    />
                  </label>
                  <label className={styles.portfolioField}>
                    <span>Technologies</span>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(event) => setDraftProjects((projects) => projects.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, technologies: event.target.value } : item))}
                      placeholder="React, Supabase"
                    />
                    <small>Separate technologies with commas.</small>
                  </label>
                  <label className={styles.portfolioField}>
                    <span>Project link</span>
                    <input
                      type="url"
                      value={project.url}
                      onChange={(event) => setDraftProjects((projects) => projects.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, url: event.target.value } : item))}
                      placeholder="https://example.com"
                    />
                  </label>
                </fieldset>
              ))}

              {error && <p className={styles.pageError} role="alert">{error}</p>}
              <div className={styles.editActions}>
                <button className={styles.saveButton} type="submit" disabled={isSavingPortfolio}>
                  {isSavingPortfolio ? "Saving..." : "Save skills & projects"}
                </button>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={() => {
                    setIsEditingPortfolio(false);
                    setError("");
                  }}
                  disabled={isSavingPortfolio}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.portfolioContent}>
              <div className={styles.portfolioGroup}>
                <h3>Skills</h3>
                {portfolio.skills.length ? (
                  <ul className={styles.skillList}>
                    {portfolio.skills.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}
                  </ul>
                ) : (
                  <p className={styles.emptyPortfolio}>No skills added yet.</p>
                )}
              </div>
              <div className={styles.portfolioGroup}>
                <h3>Projects</h3>
                {portfolio.projects.length ? (
                  <div className={styles.projectList}>
                    {portfolio.projects.map((project, index) => (
                      <article className={styles.projectCard} key={`${project.title}-${index}`}>
                        <h4>{project.title}</h4>
                        {project.description && <p>{project.description}</p>}
                        {project.technologies.length > 0 && (
                          <ul className={styles.projectTechnologies}>
                            {project.technologies.map((technology, technologyIndex) => (
                              <li key={`${technology}-${technologyIndex}`}>{technology}</li>
                            ))}
                          </ul>
                        )}
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noreferrer">
                            View project
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyPortfolio}>No projects added yet.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}