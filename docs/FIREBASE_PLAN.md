# Life Dashboard - Firebase Backend & Security Architecture

Transitioning to **Google Firebase** is an exceptional choice for **Life Dashboard**. It eliminates server maintenance, scales automatically, offers an extremely generous free tier, and simplifies user authentication and data persistence.

This document details the Firebase database structure, authentication flow, security rule designs, and client-side integration guide.

---

## 💎 1. Firebase Free Tier (Spark Plan) Feasibility

Firebase's **Spark Plan (Free Tier)** is more than sufficient for a personal or small-scale productivity dashboard. There are **zero upfront costs**, and your daily usage limits are highly generous:

| Firebase Service | Spark Plan (Free) Daily Limits | Life Dashboard Fit |
| :--- | :--- | :--- |
| **Authentication** | Unlimited email/password accounts | 100% Free |
| **Cloud Firestore (Storage)** | 1 GiB total storage | Easily stores hundreds of thousands of tasks/habits |
| **Cloud Firestore (Reads)** | 50,000 document reads / day | Perfect for active daily usage across multiple devices |
| **Cloud Firestore (Writes)** | 20,000 document writes / day | More than enough for task creation, logs, and updates |
| **Cloud Firestore (Deletes)** | 20,000 document deletes / day | Fully covers task and log management operations |

---

## 🗂️ 2. Firestore Database Architecture (NoSQL)

Firestore is a document-oriented NoSQL database. We will structure our data in collections where each document is securely tied to the user's Firebase Auth Unique ID (`uid`).

```
firestore-database/
├── users/ (Collection)
│   └── {uid}/ (Document)
│       ├── email: string
│       ├── name: string
│       └── createdAt: timestamp
│
├── tasks/ (Collection)
│   └── {taskId}/ (Document)
│       ├── userId: string  <-- Links to authenticated user's uid
│       ├── title: string
│       ├── description: string
│       ├── priority: string ("low" | "medium" | "high")
│       ├── category: string ("Work" | "Personal" | "Health" | "Learning" | "Finance")
│       ├── status: string ("todo" | "in-progress" | "completed")
│       ├── dueDate: timestamp
│       ├── estimatedTime: number
│       ├── createdAt: timestamp
│       └── completedAt: timestamp or null
│
├── habits/ (Collection)
│   └── {habitId}/ (Document)
│       ├── userId: string
│       ├── name: string
│       ├── icon: string
│       ├── completions: Map (date string "YYYY-MM-DD" -> boolean)
│       └── createdAt: timestamp
│
├── moods/ (Collection)
│   └── {userId}_{dateString}/ (Document: e.g., "uid123_2026-05-22")
│       ├── userId: string
│       ├── date: string ("YYYY-MM-DD")
│       ├── level: number (1 | 2 | 3 | 4 | 5)
│       └── createdAt: timestamp
│
└── scratchpads/ (Collection)
    └── {userId}/ (Document: One per user)
        ├── content: string
        └── updatedAt: timestamp
```

---

## 🛡️ 3. Security Architecture & Firestore Security Rules

Since Firestore is accessed directly from the client application without a middle server, **Firestore Security Rules** are your primary line of defense. They run directly on Google’s servers and validate every single query, read, write, and update request.

We have designed a highly secure, audit-compliant rule set to prevent data leaks, self-role escalations, and database spamming (DoS protection):

### Proposed `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions for readability and safety
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // --- Users Collection Rules ---
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() 
        && request.auth.uid == userId
        && request.resource.data.email is string
        && request.resource.data.email.size() < 100;
      allow update: if isOwner(userId) 
        && request.resource.data.email == resource.data.email; // Email cannot be modified casually
    }

    // --- Tasks Collection Rules ---
    match /tasks/{taskId} {
      // Users can only read tasks they own
      allow read, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Validation on Create
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 200 // Prevent resource exhaustion
        && request.resource.data.priority in ['low', 'medium', 'high']
        && request.resource.data.category in ['Work', 'Personal', 'Health', 'Learning', 'Finance']
        && request.resource.data.status in ['todo', 'in-progress', 'completed'];

      // Validation on Update
      allow update: if isAuthenticated() 
        && resource.data.userId == request.auth.uid             // Must be the owner
        && request.resource.data.userId == resource.data.userId  // Cannot transfer ownership
        && request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 200
        && request.resource.data.priority in ['low', 'medium', 'high']
        && request.resource.data.category in ['Work', 'Personal', 'Health', 'Learning', 'Finance']
        && request.resource.data.status in ['todo', 'in-progress', 'completed'];
    }

    // --- Habits Collection Rules ---
    match /habits/{habitId} {
      allow read, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 100;

      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == resource.data.userId
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 100;
    }

    // --- Moods Collection Rules ---
    match /moods/{moodId} {
      allow read, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      allow create, update: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.level is int
        && request.resource.data.level >= 1 
        && request.resource.data.level <= 5
        && moodId.startsWith(request.auth.uid + '_'); // Enforce strict ID format matching user auth
    }

    // --- Scratchpads Collection Rules ---
    match /scratchpads/{userId} {
      allow read: if isOwner(userId);
      allow create, update: if isOwner(userId)
        && request.resource.data.content is string
        && request.resource.data.content.size() <= 50000; // Limit content size (DoS prevention)
    }
  }
}
```

---

## 🛠️ 4. Phase-by-Phase Integration Roadmap

Integrating Firebase into **Life Dashboard** takes 4 straightforward phases:

### Phase 1: Firebase Project Setup
1. Create a free project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (turn on Email/Password provider).
3. Create a **Cloud Firestore** database (select "Start in production mode" to protect data immediately).
4. Register your web app in the console to obtain your config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "life-dashboard.firebaseapp.com",
     projectId: "life-dashboard",
     storageBucket: "life-dashboard.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

### Phase 2: Client Package Installation
Run the following installation command in your workspace directory:
```bash
npm install firebase
```

### Phase 3: Setup Firebase Client Scaffolding
Create **`src/firebase.ts`** to initialize the services:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Phase 4: Sync React Store (`src/store.tsx`)
Create a real-time listener using Firebase SDKs so your UI refreshes instantly whenever actions take place:
```typescript
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Inside StoreProvider or custom hook:
useEffect(() => {
  const unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (user) {
      // 1. Fetch tasks dynamically
      const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
        const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        dispatch({ type: 'SET_TASKS', payload: tasksList });
      });

      // 2. Fetch habits
      const qHabits = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
        const habitsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
        dispatch({ type: 'SET_HABITS', payload: habitsList });
      });

      return () => {
        unsubscribeTasks();
        unsubscribeHabits();
      };
    }
  });
  return () => unsubscribeAuth();
}, []);
```

---

## 💡 5. Next Steps

If you prefer this route over a custom backend:
1. **I can set up the basic Firebase client code and libraries** inside your workspace.
2. **I can draft a simple Login/Register screen** that seamlessly integrates into your existing Google NotebookLM design styling.

*Let me know if you would like me to install the `firebase` npm package and scaffold the configuration files for you!*
