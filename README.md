# CHAT-APP Project Architecture & Technical Documentation

This document serves as the master technical blueprint and maintenance reference for the language learning chat application codebase. It provides a detailed, first-principles analysis of the entire system architecture, module specifications, data flows, and design decisions.
<img width="1030" height="887" alt="image" src="https://github.com/user-attachments/assets/1ba00103-227c-4f31-a0b3-a5d385c6790c" />

---

## 1. Project Overview

### Purpose
The application is a peer-to-peer real-time chat and calling platform tailored for language learners. It connects conversation partners globally, enabling them to chat, trigger live video calls, and share their screens while practicing their target language. The core value proposition is **context-aware Smart Reply suggestions** powered by Hugging Face AI, which dynamically recommend distinct reply choices (casual, inquisitive, expressive) tailored to the chat history, along with translations and grammatical tips.

### Main Features
1. **Google OAuth & Standard Authentication**: Sign-in/Sign-up using Google credentials or email/password.
2. **Onboarding Pipeline**: Prompts new users to specify their native language, target learning language, location, and biography.
3. **Friend Request Management**: Users can discover peers, send friend requests, view pending requests, and accept or reject them.
4. **Real-time Chat with GetStream**: Direct messaging powered by GetStream Chat SDK.
5. **Live Video Calling & Screen Sharing**: Seamless peer-to-peer video calls and screen sharing powered by `@stream-io/video-react-sdk`. Accessible directly from the chat conversation header.
6. **AI Smart Replies**: Dynamic, context-aware suggestions utilizing Hugging Face Serverless Inference Router and Qwen 2.5.
7. **Round Avatar Masking**: Perfect round circle representations of user profile pictures.
8. **Production-Ready DNS Failover**: Dynamically configured IPv4 result order priorities to solve Atlas SRV lookup failures on specific ISPs.

### Tech Stack
* **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, `google-auth-library` for Google OAuth, `stream-chat` Node SDK, and Native Fetch for Hugging Face completions.
* **Frontend**: React (Vite), Tailwind CSS (DaisyUI), Axios, `@react-oauth/google`, `@tanstack/react-query`, and `stream-chat-react` UI components.

---

## 2. Directory Structure

```
CHAT-APP/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── chat.controller.js
│   │   │   └── user.controller.js
│   │   ├── lib/
│   │   │   ├── db.js
│   │   │   └── stream.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── FriendRequest.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── chat.routes.js
│   │   │   └── user.route.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatLoader.jsx
│   │   │   ├── FriendCard.jsx
│   │   │   ├── GlobalMessageListener.jsx
│   │   │   └── SmartReplySuggestions.jsx
│   │   ├── constants/
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   ├── useAuthUser.js
│   │   │   ├── useGoogleLogin.js
│   │   │   ├── useLogin.js
│   │   │   ├── useLogout.js
│   │   │   └── useSignUp.js
│   │   ├── lib/
│   │   │   ├── Api.js
│   │   │   └── axios.js
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotificationPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── store/
│   │   │   ├── useNotificationStore.js
│   │   │   ├── useStreamChatStore.js
│   │   │   └── useTheme.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── package.json
```

---

## 3. Entry Points & Request Lifecycle

### Backend Entry Point: `backend/src/server.js`
1. Executes `dotenv.config()` immediately at line 3 to parse environment variables.
2. Overrides default DNS result order using `dns.setDefaultResultOrder("ipv4first")` to prevent querySrv Atlas resolution crashes.
3. Sets up base Express middlewares (`cors()`, `cookieParser()`, `express.json()`).
4. Registers `/api/auth`, `/api/users`, and `/api/chat` route paths.
5. In production mode, registers a static file server pointing to `frontend/dist` and maps wildcard requests (`^(?!\/api).*$`) to `index.html` to support client-side SPA routing.
6. Connects to MongoDB via `connectDB()` and binds to `process.env.PORT || 5001`.

### Request Lifecycle Flow
```
Client Request (HTTP/Cookie)
     ↓
Express Server (server.js)
     ↓
Route Middlewares (CORS, Parser, cookie-parser)
     ↓
Route Handlers (e.g., authRoutes, userRoutes)
     ↓
protect_route Middleware (JWT verify & User lookup)
     ↓
Controller Action (Business logic, MongoDB writes)
     ↓
Express JSON Response
```

---

## 4. Module-by-Module Explanation

### Backend Lib Module (`backend/src/lib`)
* **Responsibility**: External API integrations and core utilities.
* **Key Interactions**: `db.js` talks to MongoDB. `stream.js` talks to the GetStream REST API.

### Backend Models Module (`backend/src/models`)
* **Responsibility**: Mongoose schema declarations.
* **Key Interactions**: Referenced by controllers to query and save collection items.

### Backend Controllers Module (`backend/src/controllers`)
* **Responsibility**: HTTP handler endpoints. Maps request inputs to Mongoose queries and external API actions.
* **Key Interactions**: Consumed directly by routes. Executes data operations and emits JSON outputs.

### Frontend Hooks Module (`frontend/src/hooks`)
* **Responsibility**: Wraps API functions in React Query hooks (`useQuery` and `useMutation`).
* **Key Interactions**: Subscribed to by Page components to trigger network actions and access cached states.

### Frontend Store Module (`frontend/src/store`)
* **Responsibility**: Global client-side state management using Zustand.
* **Key Interactions**: Manages theme preferences, unread notification counts, and shared Stream Chat connections.

---

## 5. File-by-File Documentation & Critical Functions

### [backend/src/lib/db.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/backend/src/lib/db.js)
* **Purpose**: Manages connections to the MongoDB database using Mongoose.
* **Function**: `connectDB`
  * **Called by**: [server.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/backend/src/server.js)
  * **Calls**: `mongoose.connect`
  * **Inputs**: None (uses `process.env.MONGODB_URI`)
  * **Outputs**: Promise
  * **Side effects**: Connects globally to the MongoDB service. Exits the process (`process.exit(1)`) on failure.

### [backend/src/lib/stream.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/backend/src/lib/stream.js)
* **Purpose**: Initializes the GetStream server-side SDK and handles token generation.
* **Function**: `generateStreamToken`
  * **Called by**: `get_Stream_Token` controller
  * **Calls**: `streamClient.createToken`
  * **Inputs**: `UserId` (Mongoose ObjectId / String)
  * **Outputs**: Verified token (string)
  * **Side effects**: Signs a GetStream user token.

### [backend/src/controllers/auth.controller.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/backend/src/controllers/auth.controller.js)
* **Purpose**: Orchestrates user signups, signins, Google OAuth tokens, and logouts.
* **Function**: `googleLogin`
  * **Called by**: Express route POST `/api/auth/google`
  * **Calls**: `googleClient.verifyIdToken`, `User.findOne`, `User.create`, `UpsertStreamUser`, `jwt.sign`.
  * **Inputs**: `req.body.credential` (Google ID JWT Token string)
  * **Outputs**: JSON object `{ success: true, user }` + sets `_jwt` cookie.
  * **Side effects**: Creates user in MongoDB and GetStream if they are not already registered.

### [backend/src/controllers/chat.controller.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/backend/src/controllers/chat.controller.js)
* **Purpose**: Handles Stream Chat token retrieval and requests Hugging Face AI Smart Replies.
* **Function**: `get_Smart_Reply_Suggestions`
  * **Called by**: Express route POST `/api/chat/suggestions`
  * **Calls**: `extractJSONArray`, `fetch` (Hugging Face router completions), `getFallbackSuggestions`.
  * **Inputs**: `req.body.messages` (array of chat messages)
  * **Outputs**: JSON array of exactly 3 Suggestions: `{ text, translation, explanation }`.
  * **Side effects**: Queries external Hugging Face AI servers, logs transaction steps.
  * **Edge cases**: If token is missing or remote completions return credit depletion (402), returns error in development, or static fallback suggestions in production.

### [frontend/src/hooks/useGoogleLogin.js](file:///C:/Users/Rohit%20Halder/projects/CHAT-APP/frontend/src/hooks/useGoogleLogin.js)
* **Purpose**: Hook mapping the Google Login flow to the TanStack React Query cache.
* **Called by**: `LoginPage.jsx` and `SignUpPage.jsx`
* **Calls**: `googleLogin` (in `Api.js`), `queryClient.invalidateQueries`
* **Inputs**: None
* **Outputs**: React Query mutation object.
* **Side effects**: Invalidates the `authUser` query on success, triggering app-wide re-routing.

---

## 6. Detailed Data Flows

### Real-Time Chat Message Flow
```
User A (frontend)
     ↓ types message & clicks send
channel.sendMessage() (Stream React SDK)
     ↓
GetStream Servers
     ↓ WebSockets
User B (frontend)
     ↓ GlobalMessageListener.jsx hears incoming message event
Checks if active window is not targeted to User A
     ↓
Increments Notification count in useNotificationStore
```

### AI Smart Reply Suggestions Flow
```
Message list updates (new incoming message from target partner)
     ↓
SmartReplySuggestions.jsx triggers fetchSmartSuggestions()
     ↓
POST /api/chat/suggestions { messages }
     ↓
Controller reads HF_TOKEN and HF_MODEL ("Qwen/Qwen2.5-7B-Instruct")
     ↓
Translates last 6 messages into standard user/assistant completion array
     ↓
POST https://router.huggingface.co/v1/chat/completions
     ↓
Regex parses JSON array from raw model content block: [ ... ]
     ↓
Returns suggestions to frontend -> maps options to buttons
```

---

## 7. Important Design Decisions

1. **IPv4 Preference (`ipv4first`)**:
   DNS lookup configurations in Node.js v17+ prioritize IPv6 records, causing connection failures to MongoDB Atlas databases (which primarily resolve IPv4 endpoints on typical residential networks). Explicitly overriding default lookups globally resolves connection errors natively.
2. **Regex JSON Extractor**:
   Models sometimes return unstructured preamble/commentary before the expected JSON array. Using the regex pattern `/\[\s*\{[\s\S]*\}\s*\]/` isolates the JSON array reliably, eliminating JSON parsing crash risks.
3. **Environment-Aware Error Fallback**:
   To prevent development connection issues (like credit depletion or invalid tokens) from being hidden behind generic suggestions, the server throws status `500` errors in development and resorts to safe fallback lists only in production.
4. **Tailwind and DaisyUI Avatars**:
   DaisyUI circular avatar classes (`avatar`, `rounded-full`, `overflow-hidden`) are paired with `object-cover` styling to ensure square profile pictures are masked as perfect circles without distorting the image aspect ratio.
5. **Cookie Security**:
   JWT authentication cookies (`_jwt`) are set to `httpOnly: true` (preventing XSS access) and `sameSite: "lax"` in development to allow cross-origin credential sharing between Vite (port 5173) and Express (port 5001).

---

## 8. Future Improvements

1. **Dedicated AI Client SDK**:
   Integrate `@huggingface/inference` directly in the backend, replacing the custom fetch completion queries for standard completions management.
2. **Database Level Indexes**:
   Add compound indexes on the `FriendRequest` schema:
   ```javascript
   friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
   friendRequestSchema.index({ recipient: 1, status: 1 });
   ```
3. **AI Request Rate Limiter**:
   Add `express-rate-limit` middleware on `/api/chat/suggestions` to prevent client token abuse and budget drain.
