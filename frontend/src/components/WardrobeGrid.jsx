const API_BASE = "http://localhost:8000";

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "var(--space-4)",
};

const CARD_STYLE = {
  background: "var(--color-bg_card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  transition: "box-shadow 0.3s ease, border-color 0.3s ease",
  cursor: "default",
};

const IMAGE_WRAPPER_STYLE = {
  aspectRatio: "3 / 4",
  background: "var(--color-bg_surface)",
  borderBottom: "2px solid var(--color-border_accent)",
  overflow: "hidden",
};

const IMAGE_STYLE = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const TEXT_AREA_STYLE = {
  padding: "12px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};

const NAME_STYLE = {
  fontSize: "var(--size-base, 16px)",
  fontWeight: 600,
  color: "var(--color-fg)",
};

const BADGE_STYLE = {
  fontSize: "var(--size-sm, 14px)",
  color: "var(--color-fg_muted)",
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-bg_surface)",
  border: "1px solid var(--color-border)",
  width: "fit-content",
};

const EMPTY_STYLE = {
  textAlign: "center",
  padding: "var(--space-7) var(--space-3)",
  color: "var(--color-fg_muted)",
  fontSize: "var(--size-lg, 20px)",
};

const CATEGORY_LABELS = {
  oberteile: "Oberteile",
  hosen: "Hosen",
  röcke: "Röcke",
  kleider: "Kleider",
  jacken: "Jacken",
  schuhe: "Schuhe",
  accessoires: "Accessoires",
};

export default function WardrobeGrid({ items, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div style={EMPTY_STYLE}>
        <p>Noch keine Kleidungsstücke in deiner Garderobe.</p>
        <p style={{ marginTop: "var(--space-1)", fontSize: "var(--size-sm, 14px)" }}>
          Klicke auf &quot;+ Upload&quot;, um das erste Teil hinzuzufügen.
        </p>
      </div>
    );
  }

  return (
    <div style={GRID_STYLE}>
      {items.map((item) => (
        <div
          key={item.id}
          style={CARD_STYLE}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border_accent)";
            e.currentTarget.style.boxShadow =
              "0 4px 32px rgba(201,168,76,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={IMAGE_WRAPPER_STYLE}>
            <img
              src={`${API_BASE}/${item.image_path}`}
              alt={item.name}
              style={IMAGE_STYLE}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div style={TEXT_AREA_STYLE}>
            <span style={NAME_STYLE}>{item.name}</span>
            <span style={BADGE_STYLE}>
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              style={{
                marginTop: "var(--space-1)",
                padding: "4px 12px",
                fontSize: "var(--size-sm, 14px)",
                background: "transparent",
                border: "1px solid var(--color-error)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-error)",
                cursor: "pointer",
                width: "fit-content",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(196,75,75,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
