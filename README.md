# MindTrace — Personal Gemini Journal

> "Think it. Explore it. Understand it."
> A calm, sophisticated dark editorial journal ("Midnight Paper") with multi-turn Gemini conversations, automatic summaries, AI reflection insights, per-user Cloud Firestore isolation, and Cloud Run deployment.

[![Cloud Run Challenge](https://img.shields.io/badge/Challenge-Cloud%20Run%20AI%20Challenge-blue)](https://cloud.google.com/run)
`dev-tutorial=cloud-run-ai-challenge`

---

## 1. Overview & Architecture

**MindTrace** is an enterprise-grade, secure, multi-turn reflective journaling and brainstorming application designed for the Google Cloud Run AI Challenge. It implements the **"Midnight Paper"** visual identity: a serene, dark editorial journal aesthetic with warm off-white typography, restrained lavender accents, and subtle amber/gold highlights for AI-generated reflection insights.

### Architecture

```
[Browser / Client]
       │
       ├─ (1) Firebase Google Sign-In ───> [Firebase Auth Service]
       │                                            │
       │                                     Returns ID Token
       │                                            │
       ├─ (2) POST /api/chat + Bearer Token ────────┼──────────────> [Cloud Run Express Server]
       │      POST /api/reflection                  │                       │
       │                                            │                       ├─ Validates token via Firebase Admin SDK
       │                                            │                       ├─ Reads GEMINI_API_KEY from Secret Manager
       │                                            │                       └─ Calls Gemini 2.5 Flash API
       │
       └─ (3) Firestore Client SDK (per-user CRUD) ─┴──────────────> [Cloud Firestore]
              Rules enforce: request.auth.uid == userId
              Path: /users/{userId}/entries/{entryId}
```

### Key Security & Design Highlights
- **Zero Frontend API Keys**: The Gemini API key is never exposed to the client or browser bundle. All LLM calls pass through the authenticated Cloud Run backend.
- **Strict Per-User Firestore Isolation**: Documents and collections are strictly isolated at `/users/{userId}/entries/{entryId}`. Firestore security rules reject any unauthorized read or write access across user boundaries.
- **Firebase ID Token Verification**: The backend verifies bearer tokens using the Firebase Admin SDK and binds the user identity to the cryptographically verified UID.
- **AI Reflection Insight**: Generates targeted emotional, thematic, and actionable reflections on the current session, persisted directly to Firestore.

---

## 2. Threat Modeling & Security Posture

| Risk Zone | Threat Scenario | Countermeasure Implemented | Verification |
| :--- | :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection, oversized payloads, or XSS attacks | Express payload limiting (1mb), prompt length caps (4,000 chars), strict sanitization, safe React rendering | Tested with long text, invalid types, and HTML payloads |
| **Planning & Reasoning** | Prompt injection attempting to extract instructions or credentials | System instructions with delimited contexts; user content is treated strictly as conversational reflection text | Tested with adversarial "ignore prior instructions" prompts |
| **Tool Execution & APIs** | SSRF, unauthenticated Gemini consumption, spoofed user IDs | `requireAuth` middleware verifies Firebase ID tokens; client-provided user IDs are rejected in favor of verified tokens | `curl /api/chat` without token returns 401 Unauthorized |
| **Memory & State** | Cross-tenant data leakage or tampering with other users' entries | Firestore security rules enforcing `request.auth.uid == userId`; subcollections bound to UID | Cross-UID query attempts blocked by Firestore security engine |
| **Inter-System Communication** | Key leakage to Git or browser bundle | Key stored in Google Cloud Secret Manager; zero keys embedded in frontend bundle | Audited client-side code and network inspection |

---

## 3. Local Development Setup

### Prerequisites
- Node.js 20+
- A Google Cloud Project with Billing and Firestore enabled
- A Gemini API Key from Google AI Studio

### Steps
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. Ensure `firebase-applet-config.json` is configured with your Firebase project credentials.

4. Start the development server (Express + Vite on port 3000):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Google Cloud Secret Manager Setup

For production deployments on Cloud Run, inject the Gemini API key securely from Secret Manager:

1. Enable the Secret Manager API:
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

2. Create the secret:
   ```bash
   echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
     --data-file=- \
     --replication-policy="automatic"
   ```

3. Grant your Cloud Run service account access to read the secret:
   ```bash
   gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

---

## 5. Cloud Firestore Security Rules

Deploy the included `firestore.rules` to enforce strict per-user boundaries:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Strict per-user isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /reflections/{reflectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 6. Cloud Run Deployment

Build and deploy the application container to Google Cloud Run:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Cloud Run with challenge label and Secret Manager binding
gcloud run deploy personal-gemini-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --labels="dev-tutorial=cloud-run-ai-challenge"
```

---

## 7. Functional & Security Testing Verification

Every core flow has corresponding test paths:

1. **Authentication Flow**:
   - Verify unauthenticated users only see the Google Sign-In prompt.
   - Verify signing in with Google reveals the personal dashboard and user avatar.
   - Verify signing out clears active state and returns to the lock screen.
2. **Multi-Turn Gemini Interactions**:
   - Send an initial journal prompt; verify Gemini responds empathetically.
   - Send follow-up messages; verify multi-turn context is maintained.
3. **Automatic Summaries**:
   - Verify a concise title and 1-2 sentence executive summary are generated and displayed.
4. **Cloud Firestore Persistence**:
   - Refresh the browser; verify entries and messages reload instantly.
   - Check Firestore console to confirm documents are stored strictly under `/users/{uid}/entries/`.
5. **AI Reflection Insight**:
   - Click "Extract Insight"; verify main theme, emotional tone, key observation, and daily takeaway are extracted and saved.
6. **Error & Resilience Handling**:
   - Verify graceful feedback when network is interrupted or rate limits occur (429 handling).

---

## 8. GitHub Secret Scanning & Key Security Guide

### Understanding GitHub Secret Scanning Alerts (`AIzaSy...`)
If GitHub Secret Scanning alerts on `AIzaSy...` in your repository (`ShreyaGupta12/mindtrace-gemini-journal`):
1. **Gemini API Key vs. Firebase Web Config**:
   - Your private **`GEMINI_API_KEY` was NEVER exposed or committed**. It is securely stored on the server-side backend via Secret Manager or environment variables.
   - The detected token (`AIzaSy...`) in `firebase-applet-config.json` is the **Firebase Web Client Identifier**. Firebase web apps use this configuration to allow the frontend to connect to Firebase Authentication and Cloud Firestore.
2. **Remediation & Key Hardening Steps**:
   - Open Google Cloud Console -> **APIs & Services** -> **Credentials**.
   - Select your Firebase web API key (`AIzaSyCHkW7nzn45dKs_vh-s6wfQvBpNF0d3EC8`).
   - Under **API restrictions**, choose **"Restrict key"** and select only:
     - `Firebase Authentication API` / `Identity Toolkit API`
     - `Cloud Firestore API`
     *(Ensure Generative Language API is NOT allowed on this key).*
   - Under **Application restrictions**, set "Websites" (HTTP referrers) to your app domain and `localhost`.
   - In GitHub Secret Scanning, you can now safely mark the alert as "False positive / Public Firebase web identifier (restricted)".
   - Alternatively, supply `VITE_FIREBASE_API_KEY` in environment variables and add `firebase-applet-config.json` to `.gitignore`.
