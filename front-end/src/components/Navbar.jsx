import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-dot" />
          Contact<span className="brand-accent">Manager</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Contacts
          </NavLink>
          <NavLink to="/profile" className="nav-link">
            Profile
          </NavLink>
        </nav>

        <div className="nav-user">
          {user?.avatar ? (
            <img className="avatar" src={user.avatar} alt={user.username} />
          ) : (
            <span className="avatar avatar-fallback">{initials}</span>
          )}
          <span className="nav-username">{user?.username}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
