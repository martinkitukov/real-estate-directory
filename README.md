# NovaDom - New Construction Real Estate Platform

NovaDom is a web application connecting prospective homebuyers directly with developers of new construction projects. The platform provides a transparent and efficient way for buyers to find new properties without brokers and for developers to generate leads and online traffic.

## Features

- Map-based property search
- User accounts for saving listings
- Developer verification system
- Subscription model for developers
- International support (initially focused on Bulgaria)
- Interactive property listings with detailed information

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy with Alembic
- PostgreSQL with PostGIS
- JWT Authentication

### Frontend
- Next.js 15+ with TypeScript
- React 18+
- Tailwind CSS
- shadcn/ui Components
- Mapbox GL JS (for maps)

### Infrastructure
- Docker
- PostgreSQL with PostGIS
- AWS/GCP (TBD)

## Development Setup

### Backend Setup
1. Clone the repository
2. Set up Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (copy .env.example to .env and configure)
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit http://localhost:3000

## Project Structure

```
novadom/
├── app/                    # FastAPI Backend
│   ├── api/               # API routes
│   ├── business/          # Business logic
│   ├── infrastructure/    # Database & auth utilities
│   ├── models/            # SQLAlchemy models
│   └── schemas/           # Pydantic schemas
├── frontend/              # Next.js Frontend Application
│   ├── app/               # Next.js App Router
│   ├── components/        # React Components
│   ├── lib/               # Utilities
│   └── public/            # Static assets
├── tests/                 # Test suite
└── alembic/              # Database migrations
```

## API Endpoints

The FastAPI backend is running at http://localhost:8000

- **Authentication**: `/api/v1/auth/`
- **Projects**: `/api/v1/projects/`
- **Developers**: `/api/v1/developers/`
- **Admin**: `/api/v1/admin/`

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.