import { useCallback, useEffect, useState } from "react";
import { createItem, deleteItem, getItems } from "../api/items";
import WardrobeGrid from "../components/WardrobeGrid";
import ItemUploadForm from "../components/ItemUploadForm";

const CATEGORY_FILTERS = [
  { value: null, label: "Alle" },
  { value: "oberteile", label: "Oberteile" },
  { value: "hosen", label: "Hosen" },
  { value: "röcke", label: "Röcke" },
  { value: "kleider", label: "Kleider" },
  { value: "jacken", label: "Jacken" },
  { value: "schuhe", label: "Schuhe" },
  { value: "accessoires", label: "Accessoires" },
];

const PILL_CONTAINER_STYLE = {
  display: "flex",
  gap: "var(--space-1)",
  flexWrap: "wrap",
  marginBottom: "var(--space-4)",
};

const PILL_STYLE = {
  padding: "8px 20px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-bg_surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-fg_muted)",
  fontSize: "var(--size-sm, 14px)",
  cursor: "pointer",
  fontFamily: "var(--font-family)",
  transition: "all 0.2s",
};

const PILL_ACTIVE_STYLE = {
  ...PILL_STYLE,
  background: "var(--color-accent)",
  color: "var(--color-bg)",
  borderColor: "var(--color-accent)",
  fontWeight: 600,
};

const HEADER_ROW_STYLE = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "var(--space-3)",
  flexWrap: "wrap",
  gap: "var(--space-2)",
};

const TITLE_STYLE = {
  fontFamily: "var(--heading-font-family)",
  fontSize: "var(--size-2xl, 40px)",
  color: "var(--color-accent)",
  textShadow: "0 0 20px rgba(201,168,76,0.3)",
};

const UPLOAD_BUTTON_STYLE = {
  padding: "12px 28px",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "var(--color-bg)",
  fontFamily: "var(--heading-font-family)",
  fontWeight: 600,
  fontSize: "var(--size-base, 16px)",
  minHeight: "48px",
  border: "none",
  cursor: "pointer",
  transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
};

const ERROR_STYLE = {
  textAlign: "center",
  padding: "var(--space-3)",
  color: "var(--color-error)",
  fontSize: "var(--size-base, 16px)",
};

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setError(null);
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message || "Fehler beim Laden der Garderobe.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleCreate(formData) {
    const newItem = await createItem(formData);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }

  async function handleDelete(id) {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Fehler beim Löschen.");
    }
  }

  const filteredItems = activeFilter
    ? items.filter((item) => item.category === activeFilter)
    : items;

  return (
    <div>
      <div style={HEADER_ROW_STYLE}>
        <h1 style={TITLE_STYLE}>Garderobe</h1>
        <button
          type="button"
          style={UPLOAD_BUTTON_STYLE}
          onClick={() => setShowUpload(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-accent_light)";
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow =
              "0 0 24px rgba(201,168,76,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-accent)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          + Upload
        </button>
      </div>

      <div style={PILL_CONTAINER_STYLE}>
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            style={activeFilter === f.value ? PILL_ACTIVE_STYLE : PILL_STYLE}
            onClick={() => setActiveFilter(f.value)}
            onMouseEnter={(e) => {
              if (activeFilter !== f.value) {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-accent)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== f.value) {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-fg_muted)";
              }
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={ERROR_STYLE}>{error}</div>}

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-7)",
            color: "var(--color-fg_muted)",
          }}
        >
          Lade Garderobe…
        </div>
      ) : (
        <WardrobeGrid items={filteredItems} onDelete={handleDelete} />
      )}

      <ItemUploadForm
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onCreated={handleCreate}
      />
    </div>
  );
}
