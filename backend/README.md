# Amavya Backend

Small Spring Boot API for secure Cloudinary operations and Razorpay checkout.

## Endpoints

- `POST /api/cloudinary/sign-upload`
- `POST /api/cloudinary/delete-images`
- `POST /api/orders/payment-order`
- `POST /api/orders/verify-payment`

Cloudinary endpoints require:

```text
Authorization: Bearer <Firebase ID token>
```

Order payment endpoints are public customer checkout endpoints. The backend calculates totals from
Firestore, creates a Razorpay order, verifies the Razorpay payment signature, and only then reduces
stock.

## Local Run

Set environment variables:

```text
CLOUDINARY_CLOUD_NAME=akw21id4
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FIREBASE_SERVICE_ACCOUNT_JSON=<firebase-service-account-json>
ALLOWED_ORIGINS=http://localhost:4200
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
RAZORPAY_CURRENCY=INR
```

Run:

```bash
./gradlew bootRun
```

On Windows:

```powershell
.\gradlew.bat bootRun

from cmd
ShoppingCart\backend
gradlew.bat clean build
gradlew.bat bootRun
```

## Render

Create a Web Service from this repo.

```text
Language: Docker
Root Directory: backend
Dockerfile Path: ./Dockerfile
```

Environment variables:

```text
CLOUDINARY_CLOUD_NAME=akw21id4
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FIREBASE_SERVICE_ACCOUNT_JSON=<firebase-service-account-json>
ALLOWED_ORIGINS=https://<your-firebase-hosting-domain>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
RAZORPAY_CURRENCY=INR
```

After Render deploys, update the Angular backend URL in:

```text
src/environments/backend.config.ts
```
