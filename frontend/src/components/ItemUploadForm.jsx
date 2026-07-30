import { useState, useRef } from "react";

const CATEGORIES = [
  { value: "", label: "Bitte wählen…" },
  { value: "oberteile", label: "Oberteile" },
  { value: "hosen", label: "Hosen" },
  { value: "röcke", label: "Röcke" },
  { value: "kleider", label: "Kleider" },
  { value: "jacken", label: "Jacken" },
  { value: "schuhe", label: "Schuhe" },
  { value: "accessoires", label: "Accessoires" },
];

const OVERLAY_STYLE = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  padding: "var(--space-3)",
};

const MODAL_STYLE = {
  background: "var(--color-bg_surface)",
  border: "1px solid var(--color-border_accent)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
  maxWidth: "520px",
  width: "100%",
  boxShadow:
    "0 16px 64px rgba(0,0,0,0.6), 0 0 80px rgba(201,168,76,0.08)",
  position: "relative",
  maxHeight: "90vh",
  overflowY: "auto",
};

const CLOSE_BUTTON_STYLE = {
  position: "absolute",
  top: "16px",
  right: "16px",
  background: "none",
  border: "none",
  color: "var(--color-fg_muted)",
  fontSize: "24px",
  cursor: "pointer",
  lineHeight: 1,
  padding: "0 4px",
};

const LABEL_STYLE = {
  display: "block",
  fontSize: "var(--size-sm, 14px)",
  color: "var(--color-fg_muted)",
  marginBottom: "var(--space-1)",
};

const INPUT_STYLE = {
  background: "var(--color-bg_surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "12px 16px",
  color: "var(--color-fg)",
  fontSize: "var(--size-base, 16px)",
  fontFamily: "var(--font-family)",
  minHeight: "48px",
  width: "100%",
  boxSizing: "border-box",
};

const SELECT_STYLE = {
  ...INPUT_STYLE,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: "pointer",
};

const ERROR_STYLE = {
  fontSize: "var(--size-sm, 14px)",
  color: "var(--color-error)",
  marginTop: "var(--space-0)",
};

const FILE_INPUT_STYLE = {
  ...INPUT_STYLE,
  padding: "10px 16px",
  cursor: "pointer",
};

const PREVIEW_STYLE = {
  width: "100%",
  maxHeight: "200px",
  objectFit: "contain",
  borderRadius: "var(--radius-md)",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  marginTop: "var(--space-2)",
};

const FOCUS_STYLE = {
  borderColor: "var(--color-accent)",
  boxShadow: "0 0 0 3px rgba(201,168,76,0.2)",
  outline: "none",
};

function validateImage(file) {
  if (!file) return "Bitte wähle eine Bilddatei aus.";
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    return "Nur JPEG- und PNG-Dateien sind erlaubt.";
  }
  return null;
}

export default function ItemUploadForm({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  function resetForm() {
    setName("");
    setCategory("");
    setImage(null);
    setPreview(null);
    setErrors({});
    setUploading(false);
    setProgress(0);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setImage(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  function validate() {
    const next = {};
    if (!name || name.trim().length === 0) {
      next.name = "Name ist erforderlich.";
    } else if (name.trim().length > 100) {
      next.name = "Name darf maximal 100 Zeichen lang sein.";
    }
    if (!category) {
      next.category = "Bitte wähle eine Kategorie.";
    }
    const imgErr = validateImage(image);
    if (imgErr) {
      next.image = imgErr;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("image", image);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (1 - prev) * 0.3;
          return next > 0.9 ? 0.9 : next;
        });
      }, 200);

      const result = await onCreated(formData);

      clearInterval(progressInterval);
      setProgress(1);
      setTimeout(() => {
        handleClose();
      }, 400);
    } catch (err) {
      setErrors({ form: err.message || "Upload fehlgeschlagen." });
      setUploading(false);
      setProgress(0);
    }
  }

  if (!open) return null;

  return (
    <div
      style={OVERLAY_STYLE}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) {
          handleClose();
        }
      }}
    >
      <div style={MODAL_STYLE}>
        <button
          type="button"
          style={CLOSE_BUTTON_STYLE}
          onClick={handleClose}
          disabled={uploading}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-fg_muted)";
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontFamily: "var(--heading-font-family)",
            fontSize: "var(--size-xl, 28px)",
            color: "var(--color-accent)",
            marginBottom: "var(--space-4)",
          }}
        >
          Neues Kleidungsstück
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <label style={LABEL_STYLE} htmlFor="item-name">
              Name
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
              style={{
                ...INPUT_STYLE,
                ...(errors.name
                  ? { borderColor: "var(--color-error)" }
                  : {}),
              }}
              placeholder="z.B. Schwarzes Abendkleid"
              maxLength={100}
              disabled={uploading}
              onFocus={(e) => {
                Object.assign(e.target.style, FOCUS_STYLE);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name
                  ? "var(--color-error)"
                  : "var(--color-border)";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.name && <div style={ERROR_STYLE}>{errors.name}</div>}
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="item-category">
              Kategorie
            </label>
            <select
              id="item-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.category;
                  return next;
                });
              }}
              style={{
                ...SELECT_STYLE,
                ...(errors.category
                  ? { borderColor: "var(--color-error)" }
                  : {}),
                color: category ? "var(--color-fg)" : "var(--color-fg_muted)",
                fontStyle: category ? "normal" : "italic",
              }}
              disabled={uploading}
              onFocus={(e) => {
                Object.assign(e.target.style, FOCUS_STYLE);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.category
                  ? "var(--color-error)"
                  : "var(--color-border)";
                e.target.style.boxShadow = "none";
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <div style={ERROR_STYLE}>{errors.category}</div>
            )}
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="item-image">
              Bild
            </label>
            <input
              id="item-image"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              style={{
                ...FILE_INPUT_STYLE,
                ...(errors.image
                  ? { borderColor: "var(--color-error)" }
                  : {}),
              }}
              disabled={uploading}
              onFocus={(e) => {
                Object.assign(e.target.style, FOCUS_STYLE);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.image
                  ? "var(--color-error)"
                  : "var(--color-border)";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.image && <div style={ERROR_STYLE}>{errors.image}</div>}
            {preview && (
              <img src={preview} alt="Vorschau" style={PREVIEW_STYLE} />
            )}
          </div>

          {errors.form && (
            <div
              style={{
                ...ERROR_STYLE,
                textAlign: "center",
                fontSize: "var(--size-base, 16px)",
              }}
            >
              {errors.form}
            </div>
          )}

          {uploading && (
            <div
              style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-pill)",
                height: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(progress * 100)}%`,
                  background: "var(--color-accent)",
                  borderRadius: "var(--radius-pill)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              marginTop: "var(--space-1)",
            }}
          >
            <button
              type="submit"
              disabled={uploading}
              style={{
                flex: 1,
                padding: "12px 28px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                fontFamily: "var(--heading-font-family)",
                fontWeight: 600,
                fontSize: "var(--size-base, 16px)",
                minHeight: "48px",
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.4 : 1,
                transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background =
                    "var(--color-accent_light)";
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 0 24px rgba(201,168,76,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-accent)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {uploading ? "Lädt…" : "Upload"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              style={{
                padding: "12px 28px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--color-accent)",
                border: "1.5px solid var(--color-accent)",
                fontFamily: "var(--heading-font-family)",
                fontWeight: 600,
                fontSize: "var(--size-base, 16px)",
                minHeight: "48px",
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.4 : 1,
                transition: "background 0.2s, color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.currentTarget.style.background =
                    "rgba(201,168,76,0.12)";
                  e.currentTarget.style.borderColor =
                    "var(--color-accent_light)";
                  e.currentTarget.style.color = "var(--color-accent_light)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-accent)";
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
