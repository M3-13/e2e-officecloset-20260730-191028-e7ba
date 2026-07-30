import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/wardrobe" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Bitte Benutzernamen und Passwort eingeben.");
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || "Login fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Willkommen zurück</h1>
        <p style={styles.subtitle}>Melde dich an, um deine Garderobe zu betreten.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="login-username">
            Benutzername
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            placeholder="Dein Benutzername"
            autoComplete="username"
            disabled={submitting}
          />

          <label style={styles.label} htmlFor="login-password">
            Passwort
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Dein Passwort"
            autoComplete="current-password"
            disabled={submitting}
          />

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>

        <p style={styles.footer}>
          Noch kein Konto?{" "}
          <Link to="/register" style={styles.link}>
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 96px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 70%), var(--color-bg)",
    padding: "var(--space-3)",
  },
  card: {
    background: "var(--color-bg_surface)",
    border: "1px solid var(--color-border_accent)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-5)",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 16px 64px rgba(0,0,0,0.6), 0 0 80px rgba(201,168,76,0.08)",
  },
  title: {
    fontFamily: "var(--heading-font-family)",
    fontWeight: "var(--heading-weight)",
    fontSize: "28px",
    color: "var(--color-accent)",
    textAlign: "center",
    marginBottom: "var(--space-1)",
    textShadow: "0 0 20px rgba(201,168,76,0.3)",
  },
  subtitle: {
    color: "var(--color-fg_muted)",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "var(--space-4)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  },
  label: {
    color: "var(--color-fg_muted)",
    fontSize: "14px",
    marginBottom: "calc(-1 * var(--space-2))",
  },
  input: {
    background: "var(--color-bg_surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "12px 16px",
    color: "var(--color-fg)",
    fontSize: "16px",
    fontFamily: "var(--font-family)",
    minHeight: "48px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  button: {
    background: "var(--color-accent)",
    color: "var(--color-bg)",
    fontFamily: "var(--heading-font-family)",
    fontWeight: "600",
    fontSize: "16px",
    padding: "12px 28px",
    borderRadius: "var(--radius-md)",
    border: "none",
    minHeight: "48px",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
    marginTop: "var(--space-1)",
  },
  error: {
    background: "rgba(196,75,75,0.12)",
    border: "1px solid var(--color-error)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-2) var(--space-3)",
    color: "var(--color-error)",
    fontSize: "14px",
    marginBottom: "var(--space-3)",
    textAlign: "center",
  },
  footer: {
    color: "var(--color-fg_muted)",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "var(--space-4)",
  },
  link: {
    color: "var(--color-accent)",
    textDecoration: "none",
  },
};
