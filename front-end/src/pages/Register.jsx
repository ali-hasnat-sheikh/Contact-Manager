import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-dot big" />
          <h1>Create account</h1>
          <p className="muted">Start organising your contacts</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="pick a username"
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </label>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>
        <GoogleButton onError={setError} />

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
