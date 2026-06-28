import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ContactModal from "../components/ContactModal.jsx";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setContacts(await api.getContacts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.phone, c.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [contacts, query]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditing(contact);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editing) {
      const updated = await api.updateContact(editing._id, payload);
      setContacts((list) =>
        list.map((c) => (c._id === updated._id ? updated : c))
      );
    } else {
      const created = await api.createContact(payload);
      setContacts((list) => [created, ...list]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}?`)) return;
    try {
      await api.deleteContact(contact._id);
      setContacts((list) => list.filter((c) => c._id !== contact._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const colorFor = (name) => {
    const colors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6"];
    let sum = 0;
    for (const ch of name || "?") sum += ch.charCodeAt(0);
    return colors[sum % colors.length];
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Your Contacts</h1>
          <p className="muted">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + Add contact
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by name, phone or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">📇</div>
          <h3>{query ? "No matches found" : "No contacts yet"}</h3>
          <p className="muted">
            {query
              ? "Try a different search."
              : "Add your first contact to get started."}
          </p>
          {!query && (
            <button className="btn btn-primary" onClick={openNew}>
              + Add contact
            </button>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((c) => (
            <div className="contact-card" key={c._id}>
              <div className="contact-top">
                <span
                  className="contact-avatar"
                  style={{ background: colorFor(c.name) }}
                >
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="contact-id">
                  <h3>{c.name}</h3>
                  {c.age != null && <span className="muted">Age {c.age}</span>}
                </div>
              </div>
              <div className="contact-body">
                <div className="contact-row">
                  <span className="contact-icon">📞</span>
                  <a href={`tel:${c.phone}`}>{c.phone}</a>
                </div>
                {c.email && (
                  <div className="contact-row">
                    <span className="contact-icon">✉️</span>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </div>
                )}
              </div>
              <div className="contact-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(c)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger-ghost"
                  onClick={() => handleDelete(c)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ContactModal
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
