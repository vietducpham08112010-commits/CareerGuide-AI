import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { UserProfile, ChatSession, ChatMessage, Milestone } from '../types';

let firebaseConfig: any = {};
const configs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const configFiles = Object.keys(configs);
if (configFiles.length > 0) {
  firebaseConfig = (configs[configFiles[0]] as any).default || {};
}

const fallbackConfig = {
  apiKey: "AIzaSyDRv2bfw0ncLYCUsjWrUeGoTwglyrpCRdU",
  authDomain: "careerguideaiforeveryone-1.firebaseapp.com",
  projectId: "careerguideaiforeveryone-1",
  storageBucket: "careerguideaiforeveryone-1.firebasestorage.app",
  messagingSenderId: "1024644813771",
  appId: "1:1024644813771:web:1d3ce4b9ba6e98f6efdc4e",
  measurementId: "G-M0QS8VL6XY",
  firestoreDatabaseId: 'default'
};

const hasConfigFile = Object.keys(configs).length > 0;
// Check if there is a non-default custom environment variable setup, otherwise default to the user's custom project
const useEnv = !!(import.meta.env.VITE_FIREBASE_PROJECT_ID && 
               import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'career-compass-ai-40718');

// Merge workspace config if it exists
const activeFirebaseConfig = {
  apiKey: firebaseConfig.apiKey || (useEnv ? import.meta.env.VITE_FIREBASE_API_KEY : null) || (hasConfigFile ? fallbackConfig.apiKey : null),
  authDomain: firebaseConfig.authDomain || (useEnv ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : null) || (hasConfigFile ? fallbackConfig.authDomain : null),
  projectId: firebaseConfig.projectId || (useEnv ? import.meta.env.VITE_FIREBASE_PROJECT_ID : null) || (hasConfigFile ? fallbackConfig.projectId : null),
  storageBucket: firebaseConfig.storageBucket || (useEnv ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : null) || (hasConfigFile ? fallbackConfig.storageBucket : null),
  messagingSenderId: firebaseConfig.messagingSenderId || (useEnv ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : null) || (hasConfigFile ? fallbackConfig.messagingSenderId : null),
  appId: firebaseConfig.appId || (useEnv ? import.meta.env.VITE_FIREBASE_APP_ID : null) || (hasConfigFile ? fallbackConfig.appId : null),
  measurementId: firebaseConfig.measurementId || (useEnv ? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID : null) || (hasConfigFile ? fallbackConfig.measurementId : null),
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || (useEnv ? import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID : null) || (hasConfigFile ? fallbackConfig.firestoreDatabaseId : null)
};

console.log("Firebase Active Config:", {
  ...activeFirebaseConfig,
  apiKey: activeFirebaseConfig.apiKey ? `${activeFirebaseConfig.apiKey.substring(0, 6)}...` : "NONE (Local Mode)"
});

// Initialize Firebase safely inside a single try-catch
let app: any = null;
let db: any = null;
let firebaseAuth: any = null;
let googleProvider: any = null;
let firebaseInitError: any = null;

try {
  if (activeFirebaseConfig && activeFirebaseConfig.apiKey && activeFirebaseConfig.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp(activeFirebaseConfig);
    db = activeFirebaseConfig.firestoreDatabaseId && activeFirebaseConfig.firestoreDatabaseId !== 'default'
      ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    firebaseAuth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    firebaseInitError = new Error("Firebase is running in local storage fallback mode.");
  }
} catch (error: any) {
  firebaseInitError = error;
  console.warn("Firebase initialization failed in firestoreService:", error);
}

// Export safe initialized variables
export { app, db, firebaseAuth, googleProvider, firebaseInitError };
export const auth = app; // Backwards compatibility if auth is imported as app elsewhere

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

const isOfflineError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  const msgLower = msg.toLowerCase();
  return (
    msgLower.includes('offline') ||
    msgLower.includes('network') ||
    msgLower.includes('unreachable') ||
    msgLower.includes('internet') ||
    msgLower.includes('not found') ||
    msgLower.includes('database') ||
    msgLower.includes('configuration') ||
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    code === 'not-found'
  );
};

// Global error handler as mandated by skill
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = firebaseAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid || null, 
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null
    }
  };
  console.error('[Firestore Error]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncUserProfileToCloud = async (userId: string, profile: UserProfile): Promise<void> => {
  if (!db) return;
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    // Cast profile cleanly
    const payload: any = {
      name: profile.name || 'User',
      email: profile.email || '',
      avatar: profile.avatar || 'counselor_female_1',
      streak: profile.streak || 0,
      lastCheckIn: profile.lastCheckIn || '',
      points: (profile as any).points || 0,
      level: (profile as any).level || 1,
      badges: (profile as any).badges || [],
      updatedAt: new Date().toISOString()
    };
    if (profile.careerGoal) payload.careerGoal = profile.careerGoal;
    if (profile.careerProfile) payload.careerProfile = profile.careerProfile;

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore syncUserProfileToCloud failed (client is offline). Cloud sync deferred.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchUserProfileFromCloud = async (userId: string): Promise<UserProfile | null> => {
  if (!db) {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) return JSON.parse(stored) as UserProfile;
    } catch (_) {}
    return null;
  }
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore fetchUserProfileFromCloud failed (client is offline). Returning cached local state if available.");
      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) return JSON.parse(stored) as UserProfile;
      } catch (_) {}
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const syncRoadmapToCloud = async (userId: string, milestones: Milestone[]): Promise<void> => {
  if (!db) return;
  const path = `users/${userId}/roadmaps/default`;
  try {
    const docRef = doc(db, 'users', userId, 'roadmaps', 'default');
    const cleanedMilestones = milestones.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      comments: m.comments || []
    }));
    await setDoc(docRef, {
      userId,
      milestones: cleanedMilestones,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore syncRoadmapToCloud failed (client is offline). Sync deferred.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchRoadmapFromCloud = async (userId: string): Promise<Milestone[] | null> => {
  if (!db) return null;
  const path = `users/${userId}/roadmaps/default`;
  try {
    const docRef = doc(db, 'users', userId, 'roadmaps', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.milestones || []) as Milestone[];
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore fetchRoadmapFromCloud failed (client is offline). Returning null to use local state.");
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// Backwards compatibility syncChatSessionToCloud
export const syncChatSessionToCloud = async (userId: string, session: ChatSession): Promise<void> => {
  if (!db) return;
  const path = `users/${userId}/chats/${session.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'chats', session.id);
    const msgs = session.messages.map(m => ({
      id: m.id,
      role: m.role,
      text: m.text,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
      pastedTexts: m.pastedTexts || []
    }));
    await setDoc(docRef, {
      userId,
      id: session.id,
      title: session.title,
      date: session.date instanceof Date ? session.date.toISOString() : String(session.date),
      messages: msgs,
      isStarred: !!session.isStarred,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`Firestore syncChatSessionToCloud failed (client is offline) for session: ${session.id}. Saved locally.`);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchChatSessionsFromCloud = async (userId: string): Promise<ChatSession[]> => {
  if (!db) return [];
  const path = `users/${userId}/chats`;
  try {
    const colRef = collection(db, 'users', userId, 'chats');
    const snap = await getDocs(colRef);
    const sessions: ChatSession[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      // Parse chats back
      const msgs = (d.messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: new Date(m.timestamp),
        pastedTexts: m.pastedTexts || []
      }));
      sessions.push({
        id: d.id || docSnap.id,
        title: d.title || 'Untitled Session',
        date: new Date(d.date),
        messages: msgs,
        isStarred: !!d.isStarred
      });
    });
    // Sort by date newest first
    sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
    return sessions;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore fetchChatSessionsFromCloud failed (client is offline). Returning empty list so local storage can load history.");
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const deleteChatSessionFromCloud = async (userId: string, chatId: string): Promise<void> => {
  if (!db) return;
  const path = `users/${userId}/chats/${chatId}`;
  try {
    const docRef = doc(db, 'users', userId, 'chats', chatId);
    await deleteDoc(docRef);
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore deleteChatSessionFromCloud failed (client is offline). Session deleted locally only.");
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveFeedbackToCloud = async (userId: string, rating: number, comment: string): Promise<void> => {
  if (!db) return;
  const feedbackId = `feedback_${userId}_${Date.now()}`;
  const path = `feedback/${feedbackId}`;
  try {
    const docRef = doc(db, 'feedback', feedbackId);
    await setDoc(docRef, {
      userId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn("Firestore saveFeedbackToCloud failed (client is offline). Feedback cannot be saved.");
      return;
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};
