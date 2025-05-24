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
- React
- Mapbox GL JS
- Tailwind CSS

### Infrastructure
- Docker
- PostgreSQL with PostGIS
- AWS/GCP (TBD)

## Development Setup

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

## Project Structure

```
novadom/
├── app/                    # Backend application
│   ├── api/               # API routes
│   ├── core/              # Core functionality
│   ├── db/                # Database models and migrations
│   ├── schemas/           # Pydantic models
│   └── services/          # Business logic
├── frontend/              # React frontend application
├── tests/                 # Test suite
└── alembic/              # Database migrations
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.