

## Developer Assignment: "NovaDom" - New Construction Real Estate Platform

**Project Overview:**
NovaDom will be a web application connecting prospective homebuyers directly with developers of new construction projects (apartment buildings, housing complexes). The platform aims to provide a transparent and efficient way for buyers to find new properties without brokers and for developers to generate leads and online traffic. The platform will be worldwide, with an initial launch focus on Bulgaria. It will feature a map-based search, user accounts for saving listings, and a subscription model for developers to list their projects. Developer accounts will require manual verification.

**Core Technologies:**
*   **Backend:** Python 3.9+, FastAPI
*   **ORM:** SQLAlchemy (with Alembic for database migrations)
*   **Database:** PostgreSQL (with PostGIS extension for geospatial capabilities)
*   **Frontend:** React (or Vue.js as an alternative, both are well-suited for development with tools like Cursor due to strong tooling and community support)
*   **Map Integration:** Leaflet.js (open-source) or Mapbox GL JS (offers more advanced features, has a free tier)
*   **Payment Gateway:** Stripe (good international support) or a Bulgarian local alternative if preferred for initial launch (e.g., ePay.bg, Borica).
*   **Deployment:** Docker for containerization, with options like AWS, Google Cloud Platform, or a reputable Bulgarian VPS/Cloud provider.

---

**Phase 1: Core Backend & Database Setup (Sprint 1-2)**

*   **Task 1.1: Project Setup & Environment Configuration**
    *   **Description:** Initialize FastAPI project. Set up virtual environment (e.g., venv, Poetry). Configure linters (Flake8, Black), formatters, and pre-commit hooks. Set up basic project structure (routers, models, services, config). Integrate SQLAlchemy and set up Alembic for database migrations.
    *   **Deliverables:** Runnable basic FastAPI application, `requirements.txt` or `pyproject.toml`, initial Alembic migration scripts.
*   **Task 1.2: Database Schema Design & SQLAlchemy Models (PostgreSQL)**
    *   **Description:** Design the initial database schema for PostgreSQL. Define SQLAlchemy models for the following tables. Crucially, use PostGIS data types (e.g., `Geometry` or `Geography`) for storing `latitude` and `longitude` to leverage geospatial querying capabilities.
        *   `users` (for buyers: id, email, password_hash, first_name, last_name, created_at, updated_at)
        *   `developers` (for builders: id, email, password_hash, company_name, contact_person, phone, address, website, verification_status, created_at, updated_at)
        *   `projects` (id, developer_id, title, description, location_text, **location_point (PostGIS Geometry/Geography type)**, city, neighborhood, country, project_type (e.g., apartment_building, house_complex), status (e.g., planning, under_construction, completed), expected_completion_date, cover_image_url, gallery_urls, amenities_list, created_at, updated_at, is_active, is_verified)
        *   `saved_listings` (user_id, project_id, created_at)
        *   `subscriptions` (id, developer_id, plan_id, start_date, end_date, status, payment_transaction_id)
        *   `subscription_plans` (id, name, price_bgn, price_usd, price_eur, duration_months, listing_limit, features_list)
        *   `admin_users` (for manual verification team)
    *   **Deliverables:** SQLAlchemy model definitions, Alembic migration script reflecting the schema.
*   **Task 1.3: User Authentication & Authorization (Buyers & Developers)**
    *   **Description:** Implement registration, login (email/password), and logout functionality for both Buyers and Developers using SQLAlchemy for database interactions. Use JWT for session management. Implement password hashing (e.g., bcrypt). Create basic protected routes. Differentiate roles (buyer, developer, unverified_developer, admin).
    *   **Deliverables:** API endpoints for user and developer registration, login, logout. Middleware for authentication. CRUD operations on user models via SQLAlchemy.
*   **Task 1.4: Developer Profile & Basic Verification System (Backend Stub)**
    *   **Description:** Create API endpoints for developers to manage their profiles (CRUD operations on the `developers` SQLAlchemy model). Add a `verification_status` field. Create placeholder logic for an admin to change this status. Unverified developers cannot post listings.
    *   **Deliverables:** API endpoints for developer profile CRUD. Backend logic for `verification_status`.
*   **Task 1.5: Project Listing Model & Basic CRUD APIs**
    *   **Description:** Implement Pydantic models for project listings that align with the SQLAlchemy `projects` model. Create FastAPI routers and service logic for developers to Create, Read, Update, and Delete (CRUD) their own project listings using SQLAlchemy. For location input, ensure it can be converted to a PostGIS point.
    *   **Deliverables:** API endpoints for project listing CRUD operations by authenticated and verified developers, interacting with the PostgreSQL database via SQLAlchemy.

---

**Phase 2: Core Frontend Development (Sprint 3-4)**

*   **Task 2.1: Frontend Project Setup ([Chosen Framework: React/Vue])**
    *   **Description:** Initialize the frontend project using Create React App or Vue CLI. Set up project structure, routing (e.g., React Router, Vue Router), state management (e.g., Redux, Zustand for React; Pinia, Vuex for Vue), and basic styling architecture (e.g., CSS Modules, Styled Components, Tailwind CSS).
    *   **Deliverables:** Basic runnable frontend application.
*   **Task 2.2: Basic UI Layout & Navigation (Inspired by Airbnb)**
    *   **Description:** Create the main application layout including header (Logo, Navigation links, User/Developer Login/Register buttons), footer, and main content area. Design should be clean, modern, and intuitive, taking inspiration from Airbnb's user experience.
    *   **Deliverables:** Responsive main layout components.
*   **Task 2.3: User Registration & Login Pages (Buyers & Developers)**
    *   **Description:** Create forms and UI for Buyer registration and login. Create separate forms and UI for Developer registration and login. Integrate with backend authentication APIs.
    *   **Deliverables:** Functional registration and login pages for both user types.
*   **Task 2.4: Developer Registration Flow (Frontend part)**
    *   **Description:** Implement the frontend part of the developer registration, collecting necessary information (company details, contact info). Display information about the manual verification process.
    *   **Deliverables:** Developer registration form and informational pages.
*   **Task 2.5: Static Pages**
    *   **Description:** Create basic static pages: About Us, Contact Us, Terms of Service, Privacy Policy. Content can be placeholder initially.
    *   **Deliverables:** Frontend routes and components for static pages.

---

**Phase 3: Project Listing & Map Integration (Sprint 5-7)**

*   **Task 3.1: Developer Dashboard - Project Creation & Management UI**
    *   **Description:** Develop the UI for the developer dashboard where verified developers can create new project listings (form with all fields from the `projects` model including image uploads, location input – which will need to be translated to coordinates for PostGIS). Allow developers to view, edit, and manage their existing listings.
    *   **Deliverables:** Functional developer dashboard for project management.
*   **Task 3.2: Public Project Listing Display (List & Detail Views)**
    *   **Description:** Create UI to display active and verified project listings to the public.
        *   **List View:** Show multiple projects with key information (image, title, location, price indication if available, status).
        *   **Detail View:** Show all information for a single project, including image gallery, detailed description, amenities, map location, and a way to contact the developer.
    *   **Deliverables:** Project list page and project detail page.
*   **Task 3.3: Map Integration - Displaying Projects on a Map**
    *   **Description:** Integrate a map (Leaflet.js or Mapbox GL JS) on the main search page. Fetch project locations (from the PostGIS `location_point` field) from the backend and display them as markers on the map. Clicking a marker should show a brief info pop-up and potentially link to the project detail view. The map should allow users to pan and zoom.
    *   **Deliverables:** Interactive map displaying project locations.
*   **Task 3.4: Search & Filtering Functionality (Leveraging PostGIS)**
    *   **Description:** Implement search functionality. Users should be able to search by city, neighborhood, or keywords. Implement filters for project type, status, etc. For location-based searches (e.g., "near me", "in this area"), utilize PostGIS spatial query capabilities (e.g., `ST_DWithin`, `ST_Contains`) on the backend for efficient filtering.
    *   **Deliverables:** Backend API (using SQLAlchemy to construct PostGIS queries) and frontend UI for search and filtering.
*   **Task 3.5: User "Saved Listings" Feature (Frontend & Backend)**
    *   **Description:**
        *   **Backend:** Create API endpoints (using SQLAlchemy) for authenticated buyers to save/unsave a project listing and to retrieve their list of saved listings.
        *   **Frontend:** Add a "save" button to project listings. Create a "My Saved Listings" page for logged-in buyers.
    *   **Deliverables:** Full "saved listings" functionality.

---

**Phase 4: Subscription & Payment Integration (Sprint 8-9)**

*   **Task 4.1: Subscription Plan Model & Management (Backend)**
    *   **Description:** Define subscription plans. Create SQLAlchemy models and service logic to manage developer subscriptions (activation, deactivation, renewal) based on these plans.
    *   **Deliverables:** API endpoints for managing subscription plans and developer subscriptions.
*   **Task 4.2: Payment Gateway Integration**
    *   **Description:** Integrate a payment gateway (e.g., Stripe) to handle developer subscription payments. Implement secure payment processing. Handle successful payments, failures, and webhooks for subscription status updates (updating SQLAlchemy models).
    *   **Deliverables:** Functional payment processing for subscriptions.
*   **Task 4.3: Developer Subscription Management UI**
    *   **Description:** In the developer dashboard, create a section for managing subscriptions. Developers should be able to choose a plan, make payments, view their current subscription status, and see billing history.
    *   **Deliverables:** UI for developer subscription management.
*   **Task 4.4: Listing Visibility based on Subscription Status**
    *   **Description:** Implement logic (queries via SQLAlchemy) so that project listings are only publicly visible if the developer has an active subscription and has not exceeded their plan's listing limit.
    *   **Deliverables:** Backend logic and checks for listing visibility tied to subscriptions.

---

**Phase 5: Internationalization (i18n) & Localization (l10n) (Sprint 10)**

*   **Task 5.1: Backend i18n Setup**
    *   **Description:** Configure FastAPI to support multiple languages for API responses where applicable.
    *   **Deliverables:** Backend prepared for i18n.
*   **Task 5.2: Frontend i18n Setup**
    *   **Description:** Integrate an i18n library (e.g., `react-i18next` for React, `vue-i18n` for Vue). Structure the frontend to use translation keys for all display text.
    *   **Deliverables:** Frontend prepared for i18n with translation key usage.
*   **Task 5.3: Language Detection Logic**
    *   **Description:** Implement the specified language detection logic:
        1.  Check `localStorage` for manual selection.
        2.  Use IP geolocation (e.g., `ipapi.co`).
        3.  Default to Bulgarian (`bg`) for `country_code == 'BG'`, otherwise English (`en`).
        4.  Store choice in `localStorage`.
    *   **Deliverables:** Functional language detection and switching mechanism.
*   **Task 5.4: Translation Files for English & Bulgarian (Initial Set)**
    *   **Description:** Create initial translation files (`en.json`, `bg.json`) for all UI text elements.
    *   **Deliverables:** Populated translation files for English and Bulgarian.

---

**Phase 6: Admin Panel & Moderation (Sprint 11-12)**

*   **Task 6.1: Full Admin Panel Development**
    *   **Description:** Develop a dedicated admin panel. Features:
        *   User management (view, activate/deactivate buyers and developers - using SQLAlchemy).
        *   Developer verification queue and tools.
        *   Project listing management (view all, approve, reject, edit, delete - using SQLAlchemy).
        *   Subscription management overview.
    *   **Deliverables:** Functional admin panel with core features.
*   **Task 6.2: Developer Verification Workflow (Admin UI)**
    *   **Description:** Implement the UI in the admin panel for team members to review developer registration details. Admins should be able to approve or reject developer accounts (updating status in the PostgreSQL DB via SQLAlchemy).
    *   **Deliverables:** Admin interface for managing developer verification.
*   **Task 6.3: Listing Moderation Tools**
    *   **Description:** Admins should be able to review newly submitted or edited project listings. Tools to approve, reject, or request changes (updating status in the PostgreSQL DB via SQLAlchemy).
    *   **Deliverables:** Admin interface for moderating project listings.

---

**Phase 7: Testing, Deployment & Post-Launch (Sprint 13-14)**

*   **Task 7.1: Unit & Integration Testing**
    *   **Description:** Write unit tests for critical backend logic (SQLAlchemy service layers, authentication, payment logic) using PyTest. Write unit/component tests for frontend components. Write integration tests for API endpoints, including those interacting with the PostgreSQL database.
    *   **Deliverables:** Comprehensive test suite.
*   **Task 7.2: End-to-End Testing**
    *   **Description:** Implement end-to-end tests for key user flows.
    *   **Deliverables:** Automated E2E tests.
*   **Task 7.3: Deployment Strategy & Setup**
    *   **Description:**
        *   **Containerization:** Dockerize the FastAPI backend (with PostgreSQL client libraries) and the frontend application.
        *   **Infrastructure:** Choose a hosting provider.
            *   **Cloud Providers:** AWS (e.g., RDS for PostgreSQL, EC2/ECS), Google Cloud (e.g., Cloud SQL for PostgreSQL, Compute Engine/GKE).
            *   **PaaS:** Heroku (PostgreSQL add-on), DigitalOcean App Platform.
            *   Ensure the chosen PostgreSQL service supports the PostGIS extension.
        *   **CI/CD:** Set up a CI/CD pipeline.
    *   **Process:**
        1.  Set up environments.
        2.  Configure PostgreSQL database (with PostGIS enabled), object storage.
        3.  Deploy containerized applications.
        4.  Configure domains, SSL.
    *   **Deliverables:** Deployed application, CI/CD pipeline, deployment documentation.
*   **Task 7.4: Performance Optimization & Security Hardening**
    *   **Description:**
        *   **Performance:** Optimize SQLAlchemy queries (use `selectinload` or `joinedload` appropriately, analyze generated SQL). Implement caching. Optimize PostGIS spatial indexing and queries.
        *   **Security:** Standard web security practices.
    *   **Deliverables:** Audit report, implemented optimizations.
*   **Task 7.5: Monitoring & Logging Setup**
    *   **Description:** Implement comprehensive logging and APM.
    *   **Deliverables:** Logging and monitoring systems in place.

---

**Additional Considerations & Ongoing Tasks:**

*   **API Documentation:** Auto-generate with FastAPI.
*   **Email Notifications:** Integrate an email service.
*   **SEO Best Practices:** Consider SSR/pre-rendering for public listing pages.
*   **Scalability:** Design with PostgreSQL scalability features in mind (e.g., connection pooling, read replicas).
*   **Backup Strategy:** Regular automated backups for the PostgreSQL database and user files.
*   **Legal Compliance:** GDPR, etc.

---

