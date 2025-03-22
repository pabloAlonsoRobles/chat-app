import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';

interface MessageProps {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  userId: string;
}

export default function MessageItem({ text, sender, timestamp }: MessageProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    setIsCurrentUser(sender === auth.currentUser?.email);
  }, [sender]);

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`
          relative
          max-w-[70%] 
          rounded-lg 
          px-4 
          py-2 
          ${isCurrentUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }
          transition-all
          duration-200
          hover:shadow-md
        `}
      >
        {!isCurrentUser && (
          <span className="absolute -top-5 left-0 text-xs text-gray-500">
            {sender.split('@')[0]}
          </span>
        )}
        
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        
        <div className="flex justify-between items-center mt-1 gap-2">
          <time className="text-xs opacity-75" dateTime={timestamp.toISOString()}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </div>
    </div>
  );
} 