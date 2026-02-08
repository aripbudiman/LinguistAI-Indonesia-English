
import { ChatMessage, ChatSession } from "../types";

const FIREBASE_URL = process.env.VITE_FIREBASE_URL || process.env.FIREBASE_URL || "https://aripbudiman-default-rtdb.firebaseio.com";

export const saveMessageToFirebase = async (sessionId: string, message: ChatMessage) => {
  try {
    const response = await fetch(`${FIREBASE_URL}/chats/${sessionId}/messages.json`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (error) {
    console.error("Firebase Save Error:", error);
  }
};

export const saveSessionMetadata = async (sessionId: string, title: string) => {
  try {
    await fetch(`${FIREBASE_URL}/sessions/${sessionId}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        id: sessionId,
        title: title.length > 30 ? title.substring(0, 30) + "..." : title,
        lastTimestamp: Date.now()
      }),
    });
  } catch (error) {
    console.error("Firebase Metadata Error:", error);
  }
};

export const getAllSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await fetch(`${FIREBASE_URL}/sessions.json`);
    const data = await response.json();
    if (!data) return [];
    return (Object.values(data) as ChatSession[]).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  } catch (error) {
    console.error("Firebase Load Sessions Error:", error);
    return [];
  }
};

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const response = await fetch(`${FIREBASE_URL}/chats/${sessionId}/messages.json`);
    const data = await response.json();
    if (!data) return [];
    return Object.values(data) as ChatMessage[];
  } catch (error) {
    console.error("Firebase Load Error:", error);
    return [];
  }
};

export const deleteChatFromFirebase = async (sessionId: string) => {
  try {
    await Promise.all([
      fetch(`${FIREBASE_URL}/chats/${sessionId}.json`, { method: 'DELETE' }),
      fetch(`${FIREBASE_URL}/sessions/${sessionId}.json`, { method: 'DELETE' })
    ]);
  } catch (error) {
    console.error("Firebase Delete Error:", error);
  }
};
