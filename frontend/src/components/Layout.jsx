import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header style={styles.header}>
        <NavLink to="/" style={styles.logo}>
          Hollywood Closet
        </NavLink>
        <nav style={styles.nav}>
          {user ? (
            <>
              <NavLink to="/wardrobe" style={navStyle}>
                Garderobe
              </NavLink>
              <NavLink to="/outfits" style={navStyle}>
                Outfits
              </NavLink>
              <NavLink to="/outfits/new" style={navStyle}>
                Outfit-Ersteller
              </NavLink>
              <NavLink to="/profile" style={navStyle}>
                Profil
              </NavLink>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={navStyle}>
                Anmelden
              </NavLink>
              <NavLink to="/register" style={navStyle}>
                Registrieren
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

function navStyle({ isActive }) {
  return {
    fontSize: "16px",
    color: isActive ? "var(--color-accent)" : "var(--color-fg_muted)",
    padding: "8px 16px",
    borderRadius: "var(--radius-sm)",
    borderBottom: isActive
      ? "2px solid var(--color-accent)"
      : "2px solid transparent",
    textDecoration: "none",
  };
}

const styles = {
  header: {
    background: "var(--color-bg)",
    borderBottom: "1px solid var(--color-border)",
    padding: "16px 32px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "var(--heading-font-family)",
    fontSize: "28px",
    color: "var(--color-accent)",
    letterSpacing: "1px",
    textShadow: "0 0 20px rgba(201,168,76,0.3)",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  main: {
    paddingTop: "96px",
    paddingLeft: "32px",
    paddingRight: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
    minHeight: "100vh",
  },
  logoutButton: {
    fontSize: "16px",
    color: "var(--color-error)",
    padding: "8px 16px",
    borderRadius: "var(--radius-sm)",
    background: "none",
    border: "1.5px solid var(--color-error)",
    cursor: "pointer",
    fontFamily: "var(--heading-font-family)",
    fontWeight: "600",
  },
};
