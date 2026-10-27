# RETECH AI — REST API Documentation
**Platform Version:** 1.0.0  
**Base URL:** `http://127.0.0.1:5000/api`  
**Authentication Scheme:** Bearer JWT Token (`Authorization: Bearer <token>`)  
**Standard Response Envelope:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new customer account.
- **Request Body:**
  ```json
  {
    "full_name": "Aarav Patel",
    "email": "aarav@example.com",
    "phone": "9811223344",
    "password": "Password@123",
    "confirm_password": "Password@123",
    "address": "Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038"
  }
  ```
- **Responses:**
  - `201 Created`: Returns JWT token and sanitized User dictionary.
  - `400 Bad Request`: Validation error or password mismatch.
  - `409 Conflict`: Email already registered.

### `POST /api/auth/login`
Authenticates a user and returns a JWT access token.
- **Request Body:**
  ```json
  {
    "email": "admin@retechai.com",
    "password": "Admin@123"
  }
  ```
- **Responses:**
  - `200 OK`: Returns access token and user role.
  - `401 Unauthorized`: Invalid credentials.

### `GET /api/auth/me`
Retrieves the authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with user details.

### `PUT /api/auth/profile`
Updates profile contact information and default address.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "full_name": "Aarav Patel",
    "phone": "9811223344",
    "address": "42 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  }
  ```

---

## 2. Hardware Catalog Endpoints

### `GET /api/catalog/categories`
Returns distinct supported device categories (Smartphones, Laptops, Tablets, Smartwatches).

### `GET /api/catalog/brands?category={category}`
Returns distinct brands for a chosen category (e.g. Apple, Samsung, OnePlus, Dell, HP).

### `GET /api/catalog/models?category={category}&brand={brand}`
Returns distinct models with their default hardware options (RAM, storage, processor).

### `GET /api/catalog`
Returns all active catalog hardware specifications.

---

## 3. Device & Image Endpoints

### `POST /api/devices`
Registers a used device in the user's portfolio and runs automatic ML valuation.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "category": "Smartphone",
    "brand": "Apple",
    "model": "iPhone 13",
    "purchase_year": 2022,
    "ram": 4,
    "storage": 128,
    "battery_health": 88,
    "screen_condition": "Good",
    "body_condition": "Good",
    "overall_condition": "Good",
    "has_box": true,
    "has_charger": true,
    "has_bill": true,
    "has_warranty": false
  }
  ```
- **Response:** `201 Created` with created `device` and `prediction`.

### `GET /api/devices`
Lists all devices owned by the authenticated customer (or all if admin).

### `POST /api/devices/{id}/images`
Uploads a photo for a device and performs prototype Computer Vision defect and blur analysis.
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `image`: File (PNG, JPG, JPEG, WEBP)
  - `image_type`: String (`front`, `back`, `screen`, `damage`)
- **Response:** `201 Created` with file path and OpenCV `cv_analysis` payload:
  ```json
  {
    "blur_score": 142.5,
    "is_blurry": false,
    "edge_density": 0.042,
    "abrasion_indicator": "Clean - Minimal surface disruptions observed",
    "quality_score": 8.5
  }
  ```

---

## 4. Machine Learning Valuation Endpoints

### `POST /api/predict`
Calculates instant market valuation based on hardware specifications and cosmetic factors. Can be accessed anonymously or authenticated.
- **Request Body:**
  ```json
  {
    "category": "Smartphone",
    "brand": "Apple",
    "model": "iPhone 14",
    "purchase_year": 2022,
    "ram": 6,
    "storage": 128,
    "battery_health": 88,
    "screen_condition": "Good",
    "body_condition": "Good",
    "overall_condition": "Good",
    "has_box": true,
    "has_charger": true,
    "has_bill": true,
    "has_warranty": false
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "predicted_price": 38500.0,
      "minimum_price": 36200.0,
      "maximum_price": 40800.0,
      "confidence_score": 90.5,
      "condition_score": 8.2,
      "model_version": "1.0",
      "breakdown": {
        "original_base_price": 69900.0,
        "age_deduction": 24500.0,
        "condition_deduction": 6900.0,
        "battery_adjustment": 0.0,
        "accessories_credit": 1900.0,
        "warranty_credit": 0.0
      }
    }
  }
  ```

---

## 5. Resale & Pickup Endpoints

### `POST /api/sell`
Initiates a sell transaction and generates a scheduled doorstep pickup.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "device_id": 1,
    "pickup_address": "42 MG Road, Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038",
    "pickup_date": "2026-09-18",
    "pickup_time": "10:00 AM - 01:00 PM",
    "notes": "Call before arrival"
  }
  ```
- **Response:** `201 Created` with `request_code` (e.g. `SELL-2026-1042`).

### `GET /api/sell/{id}`
Returns request details, device profile, assigned executive, and live status.

---

## 6. Exchange Endpoints

### `POST /api/exchange`
Creates an exchange booking to trade in an existing device for a new model.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "old_device_id": 1,
    "new_device_id": 2,
    "target_device_name": "iPhone 15 Pro Max",
    "target_device_price": 159900.0,
    "old_device_value": 38500.0,
    "pickup_address": "42 MG Road",
    "pickup_date": "2026-09-18",
    "pickup_time": "10:00 AM - 01:00 PM"
  }
  ```
- **Response:** `201 Created` with computed `additional_amount: 121400.0`.

---

## 7. Repair Service Endpoints

### `GET /api/repair/estimate?repair_type=Screen&category=Smartphone`
Returns base component repair estimate and warranty terms.

### `POST /api/repair`
Books a doorstep collection for device repair.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "repair_type": "Screen",
    "device_name": "iPhone 13",
    "problem_description": "Cracked front glass, touch functional",
    "estimated_cost": 3500.0,
    "pickup_address": "42 MG Road",
    "pickup_date": "2026-09-18"
  }
  ```

---

## 8. Admin Management Endpoints

- `GET /api/admin/dashboard`: Platform telemetry, KPI counters, and chart datasets.
- `GET /api/admin/users`: User directory with role filters.
- `PUT /api/admin/users/{id}/role`: Elevate or change role (`CUSTOMER`, `AGENT`, `ADMIN`).
- `DELETE /api/admin/users/{id}`: Delete user account.
- `GET /api/admin/requests`: Combined requests feed across sell, exchange, and repair.
- `PUT /api/admin/assign-agent`: Assigns a field agent to a request.
- `POST /api/admin/catalog`: Creates a new device in the master catalog.
- `DELETE /api/admin/catalog/{id}`: Removes a device from the master catalog.

---

## 9. Agent Operations Endpoints

- `GET /api/agent/tasks`: Retrieves assigned pickups, inspections, and repair jobs.
- `POST /api/agent/inspection/{sell_id}`: Submits verified physical condition, adjusts final price, and completes the sale.
