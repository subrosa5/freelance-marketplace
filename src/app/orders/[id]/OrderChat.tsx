"use client";
import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher-client";
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
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-neutral-800 tracking-widest uppercase">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] px-4 py-3 text-xs leading-relaxed ${
                isOwn
                  ? "bg-red-600 text-white"
                  : "bg-neutral-900 text-neutral-300 border-l-2 border-neutral-800"
              }`}>
                {!isOwn && (
                  <p className="text-[10px] font-semibold mb-1.5 text-neutral-600 tracking-widest uppercase">
                    {msg.sender.name}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1.5 ${isOwn ? "text-red-300" : "text-neutral-700"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-neutral-900 flex gap-2">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#080808] border border-neutral-800 text-neutral-300 text-xs px-4 py-2.5 focus:outline-none focus:border-red-600 transition-colors duration-200 placeholder-neutral-800"
        />
        <button
          type="submit" disabled={sending || !content.trim()}
          className="bg-red-600 text-white w-9 h-9 flex items-center justify-center hover:bg-red-500 disabled:opacity-40 transition-colors duration-200 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
