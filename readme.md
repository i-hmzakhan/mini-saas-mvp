# mini-saas-mvp

A lightweight EXIF metadata editor built with a React + Vite frontend and a FastAPI backend. Upload images, inspect GPS/timestamp/description EXIF data, modify values, download the updated image, and keep a per-user history of edits.

## What this project does

- Extracts EXIF metadata from uploaded images
- Displays image preview and live map location for GPS coordinates
- Allows updating:
  - latitude / longitude
  - EXIF timestamp
  - image description
- Downloads the modified image with updated EXIF
- Logs edit history per user
- Supports Supabase authentication

## Why it is useful

- Useful for photographers, analysts, or anyone who needs to edit image metadata
- Provides a simple workflow:
  1. upload image
  2. edit metadata
  3. download revised image
- Tracks historical metadata edits for each authenticated user

## Repository structure

- `Backend/`
  - `main.py` - FastAPI application entrypoint
  - `api/routes.py` - upload / modify / history routes
  - `core/exif_reader.py` - EXIF extraction logic
  - `core/exif_modifier.py` - EXIF writing logic
  - `db/connection.py` - database engine setup
  - `db/models.py` - `User` and `ImageRecord` models
  - `init_db.py` - creates database tables
  - `requirements.txt` - Python dependencies
- `Frontend/`
  - `src/App.jsx` - app routing and session checks
  - `src/pages/Auth.jsx` - sign-in / sign-up UI
  - `src/pages/Dashboard.jsx` - main dashboard and history UI
  - `src/components/ImageUploader.jsx` - upload + metadata extraction
  - `src/components/MetadataEditor.jsx` - edit metadata + download flow
  - `src/lib/supabase.js` - Supabase client config
  - `package.json` - frontend dependencies and scripts

## Getting started

### Backend

1. Open a terminal and go to `Backend/`
2. Create and activate a Python virtual environment
   - Windows:
     - `python -m venv .venv`
     - `.venv\Scripts\activate`
   - macOS / Linux:
     - `python -m venv .venv`
     - `source .venv/bin/activate`
3. Install dependencies
   - `pip install -r requirements.txt`
4. Create a `.env` file with at least:
   - `DATABASE_URL=...`
5. Initialize the database
   - `python init_db.py`
6. Start the API
   - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

> `Backend/db/connection.py` will fallback to a local SQLite file if `DATABASE_URL` is not defined.

### Frontend

1. Open a terminal and go to `Frontend/`
2. Install dependencies
   - `npm install`
3. Create a `.env` file with:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
4. Start the dev server
   - `npm run dev`
5. Open the app in the browser at the address shown by Vite

## Local API notes

The frontend currently uses hardcoded API URLs in:
- `Frontend/src/components/ImageUploader.jsx`
- `Frontend/src/components/MetadataEditor.jsx`
- `Frontend/src/pages/Dashboard.jsx`

For local backend testing, update the request URLs from the hosted API to:
- `http://localhost:8000/api/upload`
- `http://localhost:8000/api/modify`
- `http://localhost:8000/api/history/{user_id}`

## Key files

- Backend routes: [`Backend/api/routes.py`](Backend/api/routes.py)
- EXIF extraction: [`Backend/core/exif_reader.py`](Backend/core/exif_reader.py)
- EXIF modification: [`Backend/core/exif_modifier.py`](Backend/core/exif_modifier.py)
- Frontend auth: [`Frontend/src/pages/Auth.jsx`](Frontend/src/pages/Auth.jsx)
- Frontend dashboard: [`Frontend/src/pages/Dashboard.jsx`](Frontend/src/pages/Dashboard.jsx)

## Contributing

- Fork the repo
- Create a branch for your feature or fix
- Open a pull request with a clear summary of changes

If you need help, inspect the backend API and frontend fetch calls first, then follow up with issue details.