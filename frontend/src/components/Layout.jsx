import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <header
        style={{
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
        }}
      >
        <NavLink
          to="/"
          style={{
            fontFamily: "var(--heading-font-family)",
            fontSize: "28px",
            color: "var(--color-accent)",
            letterSpacing: "1px",
            textShadow: "0 0 20px rgba(201,168,76,0.3)",
          }}
        >
          Hollywood Closet
        </NavLink>
        <nav style={{ display: "flex", gap: "8px" }}>
          <NavLink
            to="/wardrobe"
            style={({ isActive }) => ({
              fontSize: "16px",
              color: isActive ? "var(--color-accent)" : "var(--color-fg_muted)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              borderBottom: isActive
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            })}
          >
            Garderobe
          </NavLink>
          <NavLink
            to="/outfits"
            style={({ isActive }) => ({
              fontSize: "16px",
              color: isActive ? "var(--color-accent)" : "var(--color-fg_muted)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              borderBottom: isActive
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            })}
          >
            Outfits
          </NavLink>
          <NavLink
            to="/outfits/new"
            style={({ isActive }) => ({
              fontSize: "16px",
              color: isActive ? "var(--color-accent)" : "var(--color-fg_muted)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              borderBottom: isActive
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            })}
          >
            Outfit-Ersteller
          </NavLink>
          <NavLink
            to="/profile"
            style={({ isActive }) => ({
              fontSize: "16px",
              color: isActive ? "var(--color-accent)" : "var(--color-fg_muted)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              borderBottom: isActive
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
            })}
          >
            Profil
          </NavLink>
        </nav>
      </header>
      <main
        style={{
          paddingTop: "96px",
          paddingLeft: "32px",
          paddingRight: "32px",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </>
  );
}
