# Amavya Backend

Small Spring Boot API for secure Cloudinary operations.

## Endpoints

- `POST /api/cloudinary/sign-upload`
- `POST /api/cloudinary/delete-images`

Both endpoints require:

```text
Authorization: Bearer <Firebase ID token>
```

## Local Run

Set environment variables:

```text
CLOUDINARY_CLOUD_NAME=akw21id4
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FIREBASE_SERVICE_ACCOUNT_JSON=<firebase-service-account-json>
ALLOWED_ORIGINS=http://localhost:4200
```

Run:

```bash
./gradlew bootRun
```

On Windows:

```powershell
.\gradlew.bat bootRun
```

## Render

Create a Web Service from this repo.

```text
Root Directory: backend
Build Command: chmod +x ./gradlew && ./gradlew clean build -x test
Start Command: java -jar build/libs/*.jar
```

Environment variables:

```text
CLOUDINARY_CLOUD_NAME=akw21id4
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
FIREBASE_SERVICE_ACCOUNT_JSON=<firebase-service-account-json>
ALLOWED_ORIGINS=https://<your-firebase-hosting-domain>
```

After Render deploys, update the Angular backend URL in:

```text
src/environments/backend.config.ts
```
