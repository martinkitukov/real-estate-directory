# NovaDom - New Construction Real Estate Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2+-black.svg)](https://nextjs.org/)

NovaDom is a modern web application that connects prospective homebuyers directly with developers of new construction projects. The platform provides a transparent and efficient way for buyers to find new properties and for developers to generate leads.

## 🚀 Features

- **Multi-user Authentication**: Separate registration for buyers, developers, and admin users
- **Project Management**: Developers can create and manage property listings
- **Advanced Search**: Location-based search with PostGIS spatial queries
- **Interactive Maps**: Leaflet.js integration for property visualization
- **Admin Panel**: Manual verification system for developers
- **Subscription System**: Tiered plans for developer accounts
- **Internationalization**: Multi-language support (English/Bulgarian)

## 🏗️ Architecture

### Backend (FastAPI)
```
app/
├── api/v1/                 # API routes
├── business/               # Business logic layer
│   └── auth/              # Authentication services
├── infrastructure/         # Infrastructure layer
├── models/                # SQLAlchemy models
├── schemas/               # Pydantic schemas
├── core/                  # Core configuration
└── dependencies.py        # FastAPI dependencies
```

### Frontend (Next.js)
```
frontend/
├── app/                   # Next.js 13+ app directory
├── components/            # React components
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy 2.0** - Python SQL toolkit and ORM
- **PostgreSQL + PostGIS** - Database with geospatial capabilities
- **Alembic** - Database migration tool
- **JWT** - JSON Web Token authentication
- **Redis** - Caching and session storage

### Frontend
- **Next.js 15.2** - React framework
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library

### Infrastructure
- **Docker** - Containerization
- **PostgreSQL** - Primary database
- **Redis** - Caching layer

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/real-estate-directory.git
   cd real-estate-directory
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Development

### Backend Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
python -m pytest tests/

# Run development test script
python scripts/dev_test.py
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Operations

```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback migration
docker-compose exec backend alembic downgrade -1
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_auth.py

# Run with coverage
python -m pytest tests/ --cov=app
```

### Development Testing
```bash
# Run development API tests
python scripts/dev_test.py
```

## 📊 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/buyer` | Register buyer account |
| POST | `/api/v1/auth/register/developer` | Register developer account |
| POST | `/api/v1/auth/token` | OAuth2 token endpoint |
| GET | `/api/v1/auth/me` | Get current user profile |
| GET | `/api/v1/projects/` | List all projects |
| POST | `/api/v1/projects/` | Create new project |

## 🔐 Authentication

The platform uses JWT-based authentication with role-based access control:

- **Buyers**: Can browse projects, save listings
- **Developers**: Can create and manage projects (requires verification)
- **Admins**: Can verify developers, moderate content

## 🌍 Internationalization

The platform supports multiple languages with automatic detection:
1. Check `localStorage` for manual selection
2. Use IP geolocation for country detection
3. Default to Bulgarian for Bulgaria, English otherwise

## 📁 Project Structure

```
real-estate-directory/
├── app/                   # Backend application
├── frontend/              # Next.js frontend
├── tests/                 # Test files
├── scripts/               # Development scripts
├── config/                # Configuration files
├── alembic/               # Database migrations
├── docker-compose.yml     # Docker services
├── requirements.txt       # Python dependencies
└── README.md
```

## 🚀 Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

See `env.example` for required configuration variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact the development team

---

**NovaDom** - Connecting buyers with new construction developments across Bulgaria and beyond.