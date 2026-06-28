import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
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
          <h1>Welcome back</h1>
          <p className="muted">Log in to manage your contacts</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="your username"
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </label>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>
        <GoogleButton onError={setError} />

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
