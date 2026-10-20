"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingIndicator from "../common/LoadingIndicator/LoadingIndicator";
import { adminRequest } from "../../lib/admin-api";
import {
  clearAuthStorage,
  getCurrentUser,
  logoutUser,
} from "../../lib/auth-api";
import styles from "./AdminDashboard.module.css";

const sections = {
  programs: {
    label: "Programs",
    path: "admin/programs",
    fields: [
      { name: "title", label: "Program title", required: true },
      { name: "slug", label: "URL slug", required: true, hint: "Lowercase, use hyphens, for example web-development." },
      { name: "category", label: "Category", required: true },
      { name: "shortDescription", label: "Short description", type: "textarea" },
      { name: "image", label: "Program image", type: "file", accept: "image/*", hint: "Choose an image to upload to Supabase Storage. Leave empty to keep the current image." },
      { name: "brochure", label: "Program brochure (PDF)", type: "file", accept: "application/pdf", hint: "Choose a PDF to upload to Supabase Storage. Leave empty to keep the current brochure." },
      { name: "status", label: "Publication status", type: "select", options: ["draft", "published", "archived"] },
      { name: "featured", label: "Featured program", type: "checkbox" },
      { name: "internship", label: "Includes internship", type: "checkbox" },
    ],
  },
  blogs: {
    label: "Blog posts",
    path: "admin/blogs",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "image", label: "Blog image", type: "file", accept: "image/*", hint: "Choose an image to upload to Supabase Storage. Leave empty to keep the current image." },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "link", label: "Article URL", type: "url", required: true },
    ],
  },
  testimonials: {
    label: "Testimonials",
    path: "admin/testimonials",
    fields: [
      { name: "name", label: "Learner name", required: true },
      { name: "profileImage", label: "Profile image", type: "file", accept: "image/*", hint: "Choose an image to upload to Supabase Storage. Leave empty to keep the current image." },
      { name: "designation", label: "Designation" },
      { name: "program", label: "Program" },
      { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, step: 0.5, required: true },
      { name: "content", label: "Testimonial", type: "textarea", required: true },
      { name: "featured", label: "Featured testimonial", type: "checkbox" },
      { name: "status", label: "Publication status", type: "select", options: ["draft", "approved", "rejected"] },
      { name: "order", label: "Display order", type: "number", min: 0 },
    ],
  },
  partners: {
    label: "Partners",
    path: "partners",
    createPath: "admin/partners",
    deletePath: "admin/partners",
    fields: [
      { name: "name", label: "Partner name", required: true },
      { name: "type", label: "Partner type", type: "select", options: ["brand", "hiring partners"] },
      { name: "logo", label: "Logo URL", type: "url" },
      { name: "logoFile", label: "Upload logo", type: "file", accept: "image/*", createOnly: true },
    ],
  },
};

const editableSections = new Set(["programs", "blogs", "testimonials"]);
const fileFieldsBySection = {
  programs: ["image", "brochure"],
  blogs: ["image"],
  testimonials: ["profileImage"],
  partners: ["logoFile"],
};
const apiFileFieldsBySection = {
  partners: { logoFile: "logo" },
};
const singularLabels = {
  programs: "Program",
  blogs: "Blog post",
  testimonials: "Testimonial",
  partners: "Partner",
};
const websiteNavLinks = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "ORVEXA", href: "/#orvexa-title" },
  { label: "About", href: "/About/About" },
  { label: "Contact", href: "/#contact" },
];

function emptyValues(section) {
  return Object.fromEntries(
    sections[section].fields
      .filter((field) => field.type !== "file")
      .map((field) => [
        field.name,
        field.type === "checkbox"
          ? false
          : field.name === "status"
            ? "draft"
            : field.name === "type"
              ? "brand"
              : "",
      ]),
  );
}

function recordValues(section, record) {
  if (!record) return emptyValues(section);
  const values = emptyValues(section);
  for (const key of Object.keys(values)) {
    if (record[key] !== undefined && record[key] !== null) values[key] = record[key];
  }
  return values;
}

function recordTitle(record) {
  return record.title || record.name || record.slug || "Untitled";
}

function recordSummary(section, record) {
  if (section === "programs") return `${record.category || "Uncategorized"} · ${record.status || "draft"}`;
  if (section === "blogs") return record.link || "No article link";
  if (section === "testimonials") return `${record.program || "General"} · ${record.status || "draft"}`;
  if (section === "partners") return record.type || "brand";
  return record.slug || "";
}

export default function AdminDashboard() {
  const router = useRouter();
  const editorRef = useRef(null);
  const [accessToken, setAccessToken] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [activeSection, setActiveSection] = useState("programs");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formValues, setFormValues] = useState(emptyValues("programs"));
  const [formKey, setFormKey] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isEditorOpen) return;

    const frame = window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [formKey, isEditorOpen]);

  useEffect(() => {
    if (!error && !notice) return;

    const timeout = window.setTimeout(() => {
      setError("");
      setNotice("");
    }, error ? 8000 : 4500);
    return () => window.clearTimeout(timeout);
  }, [error, notice]);

  useEffect(() => {
    let mounted = true;
    async function checkAccess() {
      const token = window.sessionStorage.getItem("innoknowvex_access_token");
      if (!token) {
        router.replace("/auth/admin/login");
        return;
      }
      try {
        const user = await getCurrentUser(token);
        if (!mounted) return;
        if (typeof user?.app_metadata?.role !== "string" || user.app_metadata.role.toLowerCase() !== "admin") {
          clearAuthStorage();
          router.replace("/auth/admin/login?access=pending");
          return;
        }
        setAccessToken(token);
        setIsAuthorized(true);
        try {
          const data = await adminRequest(sections.programs.path, token);
          if (mounted) setRecords(Array.isArray(data) ? data : []);
        } catch (loadError) {
          if (!mounted) return;
          if (loadError.status === 401 || loadError.status === 403) {
            clearAuthStorage();
            router.replace("/auth/admin/login?access=pending");
            return;
          }
          setError(loadError.message || "Unable to load programs.");
        }
      } catch (authError) {
        if (!mounted) return;
        clearAuthStorage();
        router.replace(authError.status === 403 ? "/auth/admin/login?access=pending" : "/auth/admin/login");
      } finally {
        if (mounted) setIsCheckingAccess(false);
      }
    }
    checkAccess();
    return () => {
      mounted = false;
    };
  }, [router]);

  const loadRecords = useCallback(async (section) => {
    if (!accessToken || !isAuthorized) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await adminRequest(sections[section].path, accessToken);
      setRecords(Array.isArray(data) ? data : []);
    } catch (loadError) {
      if (loadError.status === 401 || loadError.status === 403) {
        clearAuthStorage();
        router.replace("/auth/admin/login?access=pending");
        return;
      }
      setError(loadError.message || `Unable to load ${sections[section].label.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthorized, router]);

  const activeConfig = sections[activeSection];
  const canEdit = editableSections.has(activeSection);
  const visibleFields = useMemo(
    () => activeConfig.fields.filter((field) => !(field.createOnly && editingRecord)),
    [activeConfig.fields, editingRecord],
  );

  function selectSection(section) {
    setActiveSection(section);
    setRecords([]);
    setError("");
    setNotice("");
    closeEditor(section);
    loadRecords(section);
  }

  function closeEditor(section = activeSection) {
    setIsEditorOpen(false);
    setEditingRecord(null);
    setFormValues(emptyValues(section));
    setFormKey((key) => key + 1);
  }

  function startEditing(record = null) {
    setIsEditorOpen(true);
    setError("");
    setNotice("");
    setEditingRecord(record);
    setFormValues(recordValues(activeSection, record));
    setFormKey((key) => key + 1);
  }

  function updateField(name, value) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    const nativeFormData = new FormData(event.currentTarget);
    const fileFields = fileFieldsBySection[activeSection] || [];
    const selectedFiles = fileFields.filter((fieldName) => nativeFormData.get(fieldName)?.size > 0);
    const body = { ...formValues };

    for (const fieldName of fileFields) delete body[fieldName];
    for (const field of activeConfig.fields) {
      if (field.type === "file") continue;
      if (field.type === "checkbox") body[field.name] = nativeFormData.has(field.name);
      if (field.type === "number" && body[field.name] !== "") body[field.name] = Number(body[field.name]);
    }

    let requestBody = body;
    if (selectedFiles.length) {
      requestBody = new FormData();
      for (const [key, value] of Object.entries(body)) requestBody.append(key, String(value));
      for (const fieldName of selectedFiles) {
        const apiFieldName = apiFileFieldsBySection[activeSection]?.[fieldName] || fieldName;
        requestBody.append(apiFieldName, nativeFormData.get(fieldName));
      }
    }

    const editing = editingRecord;
    const createPath = activeConfig.createPath || activeConfig.path;
    const path = editing ? `${activeConfig.path}/${editing.id}` : createPath;
    const method = editing ? "PUT" : "POST";

    try {
      await adminRequest(path, accessToken, { method, body: requestBody });
      closeEditor();
      setNotice(`${singularLabels[activeSection]} ${editing ? "updated" : "created"} successfully.`);
      await loadRecords(activeSection);
    } catch (saveError) {
      setError(saveError.message || "Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(record) {
    if (!window.confirm(`Delete "${recordTitle(record)}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`${activeConfig.deletePath || activeConfig.path}/${record.id}`, accessToken, { method: "DELETE" });
      setNotice("Item deleted.");
      await loadRecords(activeSection);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this item.");
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutUser(accessToken);
    } catch {
      // Always remove the local session even if the logout request cannot reach the backend.
    } finally {
      clearAuthStorage();
      router.replace("/auth/admin/login");
    }
  }

  if (isCheckingAccess || !isAuthorized) {
    return <LoadingIndicator label="Checking admin access…" />;
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/" aria-label="Innoknowvex website home">
          <Image src="/3d.png" alt="" width={42} height={42} unoptimized />
          <span><strong>INNOKNOWVEX</strong><small>Website administration</small></span>
        </Link>
        <nav className={styles.siteNav} aria-label="Website navigation">
          {websiteNavLinks.map((item) => (
            <Link href={item.href} key={item.label}>{item.label}</Link>
          ))}
        </nav>
        <div className={styles.topActions}>
          <button className={styles.logout} type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.sideLabel}>MANAGE WEBSITE</p>
          <nav aria-label="Admin sections">
            {Object.entries(sections).map(([key, section]) => (
              <button
                aria-current={activeSection === key ? "page" : undefined}
                className={`${styles.navItem} ${activeSection === key ? styles.activeNav : ""}`}
                key={key}
                onClick={() => selectSection(key)}
                type="button"
              >
                <span>{section.label}</span>
                {activeSection === key && <span aria-hidden="true">›</span>}
              </button>
            ))}
          </nav>
          <p className={styles.sidebarHelp}>Changes save directly to the website content in Supabase.</p>
        </aside>

        <section className={styles.content}>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>CONTENT MANAGEMENT</p>
              <h1>{activeConfig.label}</h1>
              <p className={styles.description}>Create, edit, and publish content for your website.</p>
            </div>
            {(canEdit || activeSection === "partners") && (
              <button className={styles.primaryButton} onClick={() => startEditing()} type="button">
                + Add {singularLabels[activeSection].toLowerCase()}
              </button>
            )}
          </div>

          {(error || notice) && (
            <div className={styles.toastRegion}>
              <div className={`${styles.toast} ${error ? styles.errorToast : styles.successToast}`} role={error ? "alert" : "status"}>
                <span>{error || notice}</span>
                <button
                  aria-label="Dismiss notification"
                  className={styles.dismissToast}
                  onClick={() => {
                    setError("");
                    setNotice("");
                  }}
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {isEditorOpen ? (
            <form className={styles.editor} key={formKey} onSubmit={handleSave} ref={editorRef}>
              <div className={styles.editorHeading}>
                <div>
                  <h2>{editingRecord ? `Edit ${recordTitle(editingRecord)}` : `New ${singularLabels[activeSection].toLowerCase()}`}</h2>
                  <p>Fields marked required must be completed.</p>
                </div>
                <button className={styles.closeButton} onClick={() => closeEditor()} type="button" aria-label="Close editor">×</button>
              </div>
              <div className={styles.formGrid}>
                {visibleFields.map((field) => (
                  <label
                    className={`${styles.field} ${field.type === "textarea" ? styles.wideField : ""} ${field.type === "checkbox" ? styles.checkboxField : ""}`}
                    key={field.name}
                  >
                    {field.type === "checkbox" ? (
                      <>
                        <input
                          checked={Boolean(formValues[field.name])}
                          name={field.name}
                          onChange={(event) => updateField(field.name, event.target.checked)}
                          type="checkbox"
                        />
                        <span>{field.label}</span>
                      </>
                    ) : (
                      <>
                        <span>{field.label}{field.required ? " *" : ""}</span>
                        {field.type === "file" &&
                          editingRecord &&
                          ((field.name === "image" && editingRecord.imageUrl) ||
                            (field.name === "brochure" && editingRecord.brochureUrl) ||
                            (field.name === "profileImage" && editingRecord.profileImage)) && (
                            <span className={styles.currentAsset}>
                              Current {field.name === "brochure" ? "brochure" : field.name === "profileImage" ? "profile image" : activeSection === "blogs" ? "blog image" : "program image"} is saved. Choose a new file only if you want to replace it.
                            </span>
                          )}
                        {field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            onChange={(event) => updateField(field.name, event.target.value)}
                            required={field.required}
                            rows={4}
                            value={formValues[field.name] ?? ""}
                          />
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            onChange={(event) => updateField(field.name, event.target.value)}
                            value={formValues[field.name] ?? ""}
                          >
                            {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          <input
                            accept={field.accept}
                            max={field.max}
                            min={field.min}
                            name={field.name}
                            onChange={field.type === "file" ? undefined : (event) => updateField(field.name, event.target.value)}
                            required={field.required && !(field.type === "file" && formValues.profileImage)}
                            step={field.step}
                            type={field.type || "text"}
                            value={field.type === "file" ? undefined : formValues[field.name] ?? ""}
                          />
                        )}
                        {field.hint && <small>{field.hint}</small>}
                      </>
                    )}
                  </label>
                ))}
              </div>
              <div className={styles.editorActions}>
                <button className={styles.secondaryButton} onClick={() => closeEditor()} type="button">Cancel</button>
                <button className={styles.primaryButton} disabled={isSaving} type="submit">
                  {isSaving ? "Saving…" : editingRecord ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          ) : null}

          <div className={styles.listHeading}>
            <h2>All {activeConfig.label.toLowerCase()}</h2>
            <span>{records.length} {records.length === 1 ? "item" : "items"}</span>
          </div>
          {isLoading ? (
            <LoadingIndicator className={styles.listLoading} label={`Loading ${activeConfig.label.toLowerCase()}…`} />
          ) : records.length && activeSection === "programs" ? (
            <div className={styles.programGrid}>
              {records.map((record) => (
                <article className={styles.programCard} key={record.id}>
                  <div className={styles.programImageFrame}>
                    {record.imageUrl ? (
                      <Image
                        alt={`${record.title} program`}
                        className={styles.programImage}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                        src={record.imageUrl}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.programImagePlaceholder}>No program image</div>
                    )}
                    <span className={`${styles.statusBadge} ${record.status === "published" ? styles.publishedBadge : ""}`}>
                      {record.status || "draft"}
                    </span>
                  </div>
                  <div className={styles.programCardBody}>
                    <p className={styles.programCategory}>{record.category || "Uncategorized"}</p>
                    <h3>{record.title}</h3>
                    <p className={styles.programDescription}>{record.shortDescription || "No short description yet."}</p>
                    {record.brochureUrl && (
                      <a className={styles.brochureLink} href={record.brochureUrl} target="_blank" rel="noreferrer">
                        View brochure PDF
                      </a>
                    )}
                    <div className={styles.programCardActions}>
                      <button className={styles.secondaryButton} onClick={() => startEditing(record)} type="button">Edit program</button>
                      <button className={styles.deleteButton} onClick={() => deleteRecord(record)} type="button">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : records.length ? (
            <div className={styles.recordList}>
              {records.map((record) => (
                <article className={styles.record} key={record.id}>
                  <div className={styles.recordDetails}>
                    <h3>{recordTitle(record)}</h3>
                    <p>{recordSummary(activeSection, record)}</p>
                  </div>
                  <div className={styles.recordActions}>
                    {canEdit && (
                      <button className={styles.secondaryButton} onClick={() => startEditing(record)} type="button">Edit</button>
                    )}
                    <button className={styles.deleteButton} onClick={() => deleteRecord(record)} type="button">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !error && <div className={styles.empty}>No {activeConfig.label.toLowerCase()} yet. Add one to get started.</div>
          )}
        </section>
      </div>
    </main>
  );
}
