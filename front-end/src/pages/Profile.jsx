import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="container narrow">
      <div className="page-head">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-avatar-wrap">
          {user?.avatar ? (
            <img className="profile-avatar" src={user.avatar} alt={user.username} />
          ) : (
            <span className="profile-avatar profile-avatar-fallback">
              {initials}
            </span>
          )}
        </div>

        <div className="profile-body">
          <h2>{user?.username}</h2>
          <p className="muted">{user?.email}</p>

          <div className="profile-meta">
            <div className="meta-item">
              <span className="muted">Sign-in method</span>
              <span className="badge">
                {user?.authProvider === "google" ? "Google" : "Email & password"}
              </span>
            </div>
            <div className="meta-item">
              <span className="muted">User ID</span>
              <code className="mono">{user?._id}</code>
            </div>
          </div>

          <button className="btn btn-danger btn-block" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
