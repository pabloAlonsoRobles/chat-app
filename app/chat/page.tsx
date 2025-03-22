'use client';

import { useEffect, useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  getDocs,
  where,
  setDoc,
  doc
} from 'firebase/firestore';
import MessageItem from '../components/MessageItem';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  userId: string;
}

interface User {
  email: string;
  id: string;
  name?: string;
  photoURL?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Authentication check and user fetching
  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeUsers: () => void;

    const setupAuth = async () => {
      unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push('/');
          return;
        }

        try {
          // Set up real-time users listener
          const usersQuery = query(collection(db, 'users'));
          unsubscribeUsers = onSnapshot(usersQuery, 
            (snapshot) => {
              const usersList = snapshot.docs
                .map(doc => ({
                  id: doc.id,
                  email: doc.data().email,
                  name: doc.data().name,
                  photoURL: doc.data().photoURL
                }))
                .filter(u => u.email !== user.email);
              setUsers(usersList);
              setIsLoading(false);
            },
            (error) => {
              console.error('Error fetching users:', error);
              setError('Error loading users. Please try again later.');
              setIsLoading(false);
            }
          );
        } catch (error) {
          console.error('Error setting up users listener:', error);
          setError('Error connecting to the chat. Please refresh the page.');
          setIsLoading(false);
        }
      });
    };

    setupAuth();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [router]);

  // Get or create chat ID between two users
  const getChatId = async (user1Email: string, user2Email: string) => {
    try {
      // Sort emails to ensure consistent chat ID
      const sortedEmails = [user1Email, user2Email].sort();
      const chatId = `${sortedEmails[0]}_${sortedEmails[1]}`;

      // Create or update chat document
      await setDoc(doc(db, 'chats', chatId), {
        participants: sortedEmails,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return chatId;
    } catch (error) {
      console.error('Error getting/creating chat:', error);
      throw new Error('Could not create or find chat');
    }
  };

  // Handle user selection
  const handleUserSelect = async (user: User) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedUser(user);
      setMessages([]); // Clear previous messages
      
      if (!auth.currentUser?.email) {
        throw new Error('No authenticated user');
      }
      
      const chatId = await getChatId(auth.currentUser.email, user.email);
      setCurrentChatId(chatId);
      
      // Subscribe to messages for this chat
      const messagesQuery = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('timestamp', 'asc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages: Message[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            sender: data.sender,
            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
            userId: data.userId
          };
        });
        setMessages(newMessages);
        setIsLoading(false);
      }, (error) => {
        console.error('Error loading messages:', error);
        setError('Error loading messages. Please try again.');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error selecting user:', error);
      setError('Error loading chat. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || isSending || !currentChatId || !selectedUser) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setError(null);

    try {
      // Add message to the messages subcollection of the chat
      await addDoc(collection(db, `chats/${currentChatId}/messages`), {
        text: messageText,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp(),
        userId: auth.currentUser.uid
      });

      // Update chat's updatedAt timestamp
      await setDoc(doc(db, 'chats', currentChatId), {
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again.');
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Chat App</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {auth.currentUser?.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex gap-4">
        {/* Users list */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
          <div className="space-y-2">
            {users.length === 0 && !isLoading ? (
              <p className="text-gray-500 text-sm">No hay usuarios disponibles</p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {user.name || user.email}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex-1 bg-white rounded-lg shadow-sm mb-4 p-4 min-h-[500px] max-h-[500px] overflow-y-auto">
            {!selectedUser ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Selecciona un usuario para comenzar a chatear
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    {...message}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedUser ? "Escribe un mensaje..." : "Selecciona un usuario para chatear"}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || isSending || !selectedUser}
            />
            <button
              type="submit"
              disabled={isLoading || isSending || !newMessage.trim() || !selectedUser}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <>
                  <span>Enviar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 