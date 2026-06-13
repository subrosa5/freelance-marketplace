"use client";
import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { Send } from "lucide-react";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
};

export default function OrderChat({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages?orderId=${orderId}`)
      .then(r => r.json())
      .then(setMessages);
  }, [orderId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`order-${orderId}`);
    channel.bind("new-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { pusherClient.unsubscribe(`order-${orderId}`); };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, content }),
    });
    setContent("");
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                {!isOwn && <p className="text-xs font-medium mb-1 text-gray-500">{msg.sender.name}</p>}
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" disabled={sending || !content.trim()}
          className="bg-indigo-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
