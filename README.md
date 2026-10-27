# RETECH AI — AI-Powered Smart Device Resale, Exchange & Repair Platform
> *"Smart Value. Smarter Decisions."*

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5.1-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic%20MIT-lightgrey.svg)](LICENSE)

---

## 1. Project Overview
**RETECH AI** is an original full-stack, enterprise-grade college project platform that modernizes the pre-owned electronics lifecycle. Second-hand device sellers, buyers, and service technicians converge on an intelligent web platform powered by real Machine Learning regression models and Computer Vision image analysis.

The central intelligence pipeline calculates fair market valuations for smartphones, laptops, tablets, and smartwatches by evaluating hardware specs, age depreciation curves, battery health metrics, cosmetic condition scores, and verified accessories.

```
DEVICE DETAILS + CONDITION + ML MODEL
              ↓
       RESALE PRICE PREDICTION
              ↓
       ESTIMATED MARKET VALUE
```

---

## 2. Key Features

### Customer Experience
- **Interactive 7-Step Valuation Wizard**: Dynamic cascading category, brand, and model selection with hardware spec inputs (RAM, storage, processor, battery health slider).
- **AI Price Prediction with Confidence Intervals**: Returns estimated resale value (e.g. ₹28,500), minimum and maximum price bounds (₹27,000 - ₹30,000), 88% confidence score, and composite condition score (0-10).
- **Transparent Price Breakdown**: Itemized accounting of base original price, age deduction, cosmetic penalty, battery health penalty, and accessories bonus.
- **Doorstep Resale Pickup**: Select pickup address, date, and preferred time window. Generates unique tracking code `SELL-2026-XXXX`.
- **Smart Device Exchange**: Upgrade old device for new models, automatically calculating the net difference payable.
- **Doorstep Repair Booking**: Instant repair estimates across 7 categories (Screen, Battery, Camera, Speaker, Port, Software, Other) with a 6-month warranty badge.
- **Live Status Timeline**: Visual progress tracking (`Requested` → `Confirmed` → `Agent Assigned` → `Pickup Scheduled` → `Picked Up` → `Inspection` → `Final Offer` → `Completed`).
- **In-App Notification Center**: Real-time alerts on status transitions and agent assignments.

### Administration & Field Operations
- **Admin Analytics Dashboard**: Recharts visualization of monthly transactions, category distributions, and top brands with live KPI metrics.
- **Dynamic Device Catalog**: Admin can add, update, and manage brands, models, base prices, and specs without touching frontend code.
- **Agent Assignment System**: Assign certified field staff to pending pickups and inspections.
- **Agent Field Tasks Portal**: Technicians can inspect devices on-site, enter verified condition scores, revise final offers, and complete transactions.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts, Axios, React Router 6.
- **Backend**: Python 3.12, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Werkzeug security, python-dotenv.
- **Machine Learning**: Scikit-Learn (Linear Regression, Random Forest, Gradient Boosting), Pandas, NumPy, Joblib.
- **Computer Vision**: OpenCV (`cv2`), Pillow (`PIL`).
- **Database**: SQLite (Development) / MySQL 8.0 compatible.
- **Testing**: Pytest with in-memory SQLite fixtures.

---

## 4. Folder Structure

```
retech-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Footer, Button, Card, Modal, Loader, Timeline
│   │   │   ├── layout/       # DashboardLayout, ProtectedRoute
│   │   │   └── wizard/       # DeviceWizard, ValuationResult, ImageUploader
│   │   ├── pages/            # Landing, Login, Register, Dashboard, Valuation, Sell, Exchange, Repair, Admin, Agent
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── services/         # Axios api client & endpoint modules
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py                # Main Flask application factory
│   ├── config.py             # Configuration classes
│   ├── extensions.py         # SQLAlchemy & JWT initializers
│   ├── seed.py               # Comprehensive database seed script
│   ├── requirements.txt      # Python dependencies
│   ├── models/               # Relational ORM models
│   ├── routes/               # Modular Flask Blueprints
│   ├── services/             # Prediction, CV, and notification services
│   ├── ml/
│   │   ├── train_model.py    # Training & evaluation pipeline
│   │   ├── predict.py        # Production inference service
│   │   ├── dataset/          # Training data
│   │   └── models/           # Serialized joblib models
│   ├── tests/                # Automated pytest suite
│   ├── uploads/              # Device inspection uploads
│   └── .env.example
│
├── docs/
│   ├── SRS.md                # Software Requirements Specification (IEEE 830)
│   ├── API_DOCUMENTATION.md  # REST API endpoint catalog
│   └── DATABASE_SCHEMA.md    # ER diagram and database dictionary
│
├── README.md
└── .gitignore
```

---

## 5. Getting Started & Installation

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm

### 5.1 Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Setup environment variables
cp .env.example .env

# 6. Seed demo database (Admin, Agents, 10 Customers, 20 Devices, Valuations & Requests)
python seed.py

# 7. Start the Flask Backend Server
python app.py
```
Backend API will be running at: `http://127.0.0.1:5000`

### 5.2 Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start Vite development server
npm run dev
```
Frontend web application will be running at: `http://localhost:5173`

---

## 6. Machine Learning Model Training

The ML training pipeline compares three regression algorithms (**Linear Regression**, **Random Forest Regressor**, and **Gradient Boosting Regressor**) using $R^2$, MAE, and RMSE metrics:

```bash
cd backend
python -m ml.train_model
```

The champion model is automatically serialized using Joblib to `backend/ml/models/device_price_model.pkl` and used immediately by the inference service.

---

## 7. Demo Credentials (Development Mode)

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@retechai.com` | `Admin@123` | Full control center, analytics, catalog manager, staff assigner |
| **Field Agent 1** | `agent1@retechai.com` | `Agent@123` | Field task queue, on-site diagnostics, inspection approval |
| **Field Agent 2** | `agent2@retechai.com` | `Agent@123` | Field task queue, on-site diagnostics, inspection approval |
| **Customer Demo** | `user1@example.com` | `User@123` | Customer portal, sell, exchange, repair, portfolio tracking |

*(Note: These credentials are provided for development and academic evaluation purposes. Change secrets before production deployment.)*

---

## 8. Running Automated Tests

Run the test suite using `pytest`:

```bash
cd backend
pytest tests/ -v
```

Tests cover:
- User registration, duplicate checks, password confirmation, and login
- JWT token authentication and role guardrails (Admin/Agent/Customer)
- Device creation and automated ML price prediction linking
- Resale, exchange difference math, and repair bookings
- Admin assignment and field agent physical inspection workflow

---

## 9. Security & Compliance
- **Password Hashing**: Cryptographic salt-and-hash via Werkzeug.
- **SQL Injection Prevention**: SQLAlchemy parameterized queries.
- **Authorization Verification**: Protected endpoints enforced by JWT and `@admin_required` / `@agent_required`.
- **Upload Hardening**: Validation of allowed image MIME types, random UUID hashing with `secure_filename`, 16MB file size caps.

---

## 10. License & Credits
Developed as an original full-stack academic software engineering project.
Licensed under the MIT License.
