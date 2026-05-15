# Mini SaaS MVP - EXIF Metadata Editor

A full-stack application for uploading images, extracting and editing EXIF metadata (GPS coordinates, timestamps, descriptions), and downloading modified images with complete edit history tracking.

## Overview

**Mini SaaS MVP** is a lightweight but powerful EXIF metadata editor built with a modern tech stack:
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLModel + PostgreSQL/SQLite
- **Authentication**: Supabase Auth

Perfect for photographers, data analysts, geospatial professionals, or anyone needing to programmatically edit image metadata.

## Key Features

- 📸 **Extract EXIF Data** - Instantly read GPS coordinates, timestamps, and descriptions from uploaded images
- ✏️ **Edit Metadata** - Modify latitude/longitude, EXIF timestamps, and image descriptions
- 📍 **Live Map Preview** - Visualize GPS coordinates on an interactive map before saving
- 💾 **Download Modified Images** - Export images with updated EXIF data
- 📋 **Edit History** - Track all metadata changes per user with full audit trail
- 🔐 **Secure Authentication** - Supabase Auth integration for user management
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+ (or use built-in SQLite for local development)
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `Backend/` directory:
   ```env
   # Optional: PostgreSQL connection string (falls back to SQLite if not set)
   DATABASE_URL=postgresql://user:password@localhost:5432/exif_db
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Frontend/` directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   Get these values from your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

4. Start the development server:
   ```bash
   npm run dev
   ```

   Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Local Development Notes

The frontend currently uses hardcoded API URLs pointing to a hosted backend. For local testing:

1. Update the API endpoints in these files to point to `http://localhost:8000/api`:
   - [Frontend/src/components/ImageUploader.jsx](Frontend/src/components/ImageUploader.jsx)
   - [Frontend/src/components/MetadataEditor.jsx](Frontend/src/components/MetadataEditor.jsx)
   - [Frontend/src/pages/Dashboard.jsx](Frontend/src/pages/Dashboard.jsx)

2. Endpoints to update:
   - `/api/upload` - Image upload and EXIF extraction
   - `/api/modify` - Metadata modification and download
   - `/api/history/{user_id}` - Retrieve edit history

## Project Structure

```
mini-saas-mvp/
├── Backend/
│   ├── main.py                  # FastAPI application entrypoint
│   ├── init_db.py              # Database initialization
│   ├── requirements.txt         # Python dependencies
│   ├── api/
│   │   └── routes.py           # API endpoints (upload, modify, history)
│   ├── core/
│   │   ├── exif_reader.py      # EXIF data extraction logic
│   │   └── exif_modifier.py    # EXIF data modification logic
│   └── db/
│       ├── connection.py        # Database connection setup
│       └── models.py            # SQLModel data models
└── Frontend/
    ├── package.json             # Frontend dependencies
    ├── vite.config.js          # Vite configuration
    ├── tailwind.config.js       # Tailwind CSS config
    ├── src/
    │   ├── App.jsx              # Main app with routing
    │   ├── App.css              # Global styles
    │   ├── main.jsx             # Entry point
    │   ├── pages/
    │   │   ├── Auth.jsx         # Authentication UI
    │   │   └── Dashboard.jsx    # Main dashboard with history
    │   ├── components/
    │   │   ├── ImageUploader.jsx    # Image upload component
    │   │   └── MetadataEditor.jsx   # Metadata editing UI
    │   └── lib/
    │       └── supabase.js      # Supabase client configuration
    └── public/                  # Static assets
```

## API Documentation

The FastAPI server provides automatic interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

- `POST /api/upload` - Upload image and extract EXIF metadata
- `POST /api/modify` - Modify image metadata and download
- `DELETE /api/history/{record_id}` - Remove a history record
- `GET /` - Health check endpoint

## Usage Example

1. **Sign up** using Supabase Auth
2. **Upload an image** via the dashboard
3. **View extracted metadata** - GPS coordinates display on an interactive map
4. **Edit metadata** - Modify GPS coordinates, timestamp, or description
5. **Download** - Save the modified image with updated EXIF data
6. **Review history** - Browse all past edits for audit purposes

## Technology Stack

### Backend
- **FastAPI** - Modern async web framework
- **SQLModel** - SQL database ORM combining SQLAlchemy and Pydantic
- **Pillow** - Image processing
- **piexif** - EXIF data handling

### Frontend
- **React 19** - UI framework
- **Vite** - Next-generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Supabase JS** - Authentication and API client

## Support & Troubleshooting

**Issue**: Database connection fails
- Ensure PostgreSQL is running or set `DATABASE_URL` correctly
- The app falls back to SQLite if `DATABASE_URL` is not set

**Issue**: Frontend can't reach backend
- Verify both servers are running (`localhost:8000` for backend, `localhost:5173` for frontend)
- Update hardcoded API URLs in frontend components as described above
- Check CORS settings in [Backend/main.py](Backend/main.py)

**Issue**: Supabase authentication not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set
- Check Supabase project is active at supabase.com

For additional help, review the backend routes in [Backend/api/routes.py](Backend/api/routes.py) and frontend components to understand the data flow.

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add feature description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description of your changes

## License

This project is open source and available under the MIT License.