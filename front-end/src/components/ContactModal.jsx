import { useEffect, useState } from "react";

const EMPTY = { name: "", phone: "", email: "", age: "" };

export default function ContactModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        phone: initial.phone || "",
        email: initial.email || "",
        age: initial.age ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        age: form.age === "" ? undefined : Number(form.age),
      };
      await onSave(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? "Edit contact" : "New contact"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Name *</span>
            <input name="name" value={form.name} onChange={onChange} required />
          </label>
          <label className="field">
            <span>Phone *</span>
            <input name="phone" value={form.phone} onChange={onChange} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
            />
          </label>
          <label className="field">
            <span>Age</span>
            <input
              type="number"
              name="age"
              min="0"
              value={form.age}
              onChange={onChange}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
