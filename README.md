# Hollywood Closet Manager

Ein glamouröser Kleiderschrank-Manager mit Web-GUI im Hollywood-Stil. Benutzer registrieren sich, legen Kleidungsstücke mit Bildern und festen Kategorien an, durchstöbern ihre Garderobe und kombinieren im Outfit-Creator Einzelteile zu gespeicherten Outfits – alles in eleganter Red-Carpet-Optik.

## Tech Stack

- **Frontend**: React mit Vite
- **Backend**: Python FastAPI
- **Datenbank**: SQLite
- **Authentifizierung**: JWT-basierte Sessions
- **Bildspeicherung**: Lokales Dateisystem (uploads-Ordner)

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Entwicklung starten

### Backend (API-Server auf Port 8000)

```bash
cd backend
uvicorn app.main:app --port 8000
```

### Frontend (Dev-Server auf Port 5173)

```bash
cd frontend
npm run dev
```

### Produktions-Build (Frontend)

```bash
cd frontend
npm run build
npm run preview
```

## Umgebungsvariablen

| Variable | Beschreibung | Standard |
|---|---|---|
| `DATABASE_URL` | SQLite-Datenbankpfad | `sqlite:///./data/closet.db` |
| `JWT_SECRET` | Signing-Key für JWT-Tokens (erforderlich für Auth) | — |
| `UPLOAD_DIR` | Verzeichnis für Bild-Uploads | `./uploads` |
| `FRONTEND_ORIGIN` | CORS-Origin des Frontends | `http://localhost:5173` |

Ohne `JWT_SECRET` startet das Backend, aber alle Auth-Endpunkte antworten mit 503.

## API-Endpunkte

### Health

- `GET /api/health` → `{"status": "ok"}`

### Auth

- `POST /api/auth/register` — Registrierung (derzeit Stub, 503)
- `POST /api/auth/login` — Login (derzeit Stub, 503)

### Kleidungsstücke

- `POST /api/items` — Kleidungsstück anlegen (derzeit Stub, 503)
- `GET /api/items` — Alle Kleidungsstücke abrufen (derzeit Stub, 503)
- `GET /api/items/{id}` — Einzelnes Kleidungsstück (derzeit Stub, 503)
- `DELETE /api/items/{id}` — Kleidungsstück löschen (derzeit Stub, 503)

### Outfits

- `POST /api/outfits` — Outfit erstellen (derzeit Stub, 503)
- `GET /api/outfits` — Alle Outfits abrufen (derzeit Stub, 503)
- `GET /api/outfits/{id}` — Einzelnes Outfit (derzeit Stub, 503)
- `DELETE /api/outfits/{id}` — Outfit löschen (derzeit Stub, 503)

### Benutzer

- `DELETE /api/user/account` — Konto löschen (derzeit Stub, 503)
- `GET /api/privacy` — Datenschutzerklärung

## Features

- Benutzerregistrierung und -login mit JWT
- Kleidungsstück-Verwaltung mit Bild-Upload und Kategorien
- Garderoben-Galerie mit Kategorie-Filter
- Outfit-Creator mit Live-Vorschau
- Outfit-Übersicht und -Verwaltung
- Benutzerkonto-Verwaltung (Profil, Konto-Löschung)
- Datenschutzerklärung
- Hollywood-Glamour-Design mit Gold-Akzenten auf dunklem Hintergrund
