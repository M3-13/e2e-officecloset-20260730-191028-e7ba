export default function HomePage() {
  return (
    <div style={{ textAlign: "center", paddingTop: "64px" }}>
      <h1
        style={{
          fontSize: "40px",
          color: "var(--color-accent)",
          textShadow: "0 0 20px rgba(201,168,76,0.3)",
        }}
      >
        Hollywood Closet
      </h1>
      <p style={{ color: "var(--color-fg_muted)", marginTop: "16px", fontSize: "16px" }}>
        Home Page
      </p>
    </div>
  );
}
