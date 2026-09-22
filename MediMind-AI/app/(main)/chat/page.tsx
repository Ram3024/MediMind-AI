"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, MicOff, Volume2, VolumeX, Trash2, Plus,
  Bot, User, ChevronDown, Settings2, AlertTriangle,
  MessageSquare, X, Sparkles, Paperclip, FileText
} from "lucide-react";
import { useChatStore, type PersonalityMode, type Message } from "@/store/chatStore";
import { getAIResponse } from "@/lib/ai";
import { detectEmergency } from "@/lib/utils";
import { quickReplies } from "@/lib/mockData";

// =============================================
// TYPING INDICATOR
// =============================================
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-3 mb-4"
    >
      <div className="ai-orb flex-shrink-0" style={{ width: 36, height: 36 }} />
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================
// VOICE WAVE
// =============================================
function VoiceWave() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

// =============================================
// EMERGENCY ALERT
// =============================================
function EmergencyAlert({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="emergency-alert p-4 mb-4 flex items-start gap-3"
    >
      <AlertTriangle size={20} style={{ color: "#ef4444" }} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: "#ef4444" }}>Emergency Detected!</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Life-threatening symptoms detected. Please call <strong>112</strong> (Emergency) or <strong>102</strong> (Ambulance) immediately.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "#dc2626", color: "white" }}
            onClick={() => alert("Calling Emergency Services: 112")}
          >
            📞 Call 112
          </button>
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(220,38,38,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
            onClick={() => alert("Opening Hospital Finder...")}
          >
            🏥 Find Hospital
          </button>
        </div>
      </div>
      <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}>
        <X size={16} />
      </button>
    </motion.div>
  );
}

// =============================================
function MessageBubble({ message, isStreaming }: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-base"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            👨
          </div>
        ) : (
          <div className="ai-orb" style={{ width: 36, height: 36 }} />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm"
            : `rounded-tl-sm ${message.isEmergency ? "emergency-alert" : "glass"}`
        }`}
        style={
          isUser
            ? {
                background: "linear-gradient(135deg, rgba(20,184,166,0.3), rgba(217,70,239,0.2))",
                border: "1px solid rgba(20,184,166,0.3)",
              }
            : {}
        }
      >
        {/* Render attachment if present */}
        {message.attachment && (
          <div className="mb-2 rounded-xl overflow-hidden border max-w-xs" style={{ borderColor: "var(--glass-border)", background: "rgba(0,0,0,0.1)" }}>
            {message.attachment.type === "image" ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-h-60 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment?.url, "_blank")}
              />
            ) : (
              <div 
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = message.attachment?.url || "#";
                  link.download = message.attachment?.name || "Report.pdf";
                  link.click();
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white">{message.attachment.name}</p>
                  <p className="text-[10px] opacity-70 truncate" style={{ color: "var(--color-text-muted)" }}>PDF Document • Click to Download</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Render markdown-like content */}
        <div className="whitespace-pre-wrap">
          {message.content.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
            }
            // Bold inline text
            const parts = line.split(/(\*\*[^*]+\*\*)/);
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j}>{part.slice(2, -2)}</strong>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
        </div>
        {isStreaming && (
          <span
            className="inline-block w-1.5 h-4 ml-1 animate-pulse"
            style={{ background: "var(--color-primary)", borderRadius: 2 }}
          />
        )}
      </div>
    </motion.div>
  );
}

// =============================================
// PERSONALITY SELECTOR
// =============================================
const personalities: { id: PersonalityMode; label: string; emoji: string; desc: string; color: string }[] = [
  { id: "doctor", label: "Doctor", emoji: "🩺", desc: "Medical diagnosis & advice", color: "#14b8a6" },
  { id: "therapist", label: "Therapist", emoji: "💆", desc: "Mental health support", color: "#d946ef" },
  { id: "fitnessCoach", label: "Fitness Coach", emoji: "💪", desc: "Workouts & fitness", color: "#f59e0b" },
  { id: "nutritionExpert", label: "Nutritionist", emoji: "🥗", desc: "Diet & nutrition plans", color: "#22c55e" },
  { id: "general", label: "Assistant", emoji: "🤖", desc: "General health info", color: "#3b82f6" },
];

// =============================================
// CHAT PAGE
// =============================================
export default function ChatPage() {
  const {
    conversations, currentConversationId, personality, isHindi, isTyping,
    setPersonality, setHindi, setTyping, createConversation,
    selectConversation, deleteConversation, addMessage, getCurrentConversation,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [showPersonalityMenu, setShowPersonalityMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [attachment, setAttachment] = useState<{
    name: string;
    type: string;
    url: string;
    mimeType: string;
    base64: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image helper using canvas
  const compressAndConvertToBase64 = (file: File): Promise<{ base64: string; url: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Limit image dimensions
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // compress to 70% quality JPEG
          const base64 = dataUrl.split(",")[1];
          resolve({ base64, url: dataUrl });
        };
        img.onerror = () => reject(new Error("Failed to load image for compression"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Convert PDF to base64 helper
  const convertPdfToBase64 = (file: File): Promise<{ base64: string; url: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, url: dataUrl });
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 1.5MB for PDFs, images will be compressed anyway)
    if (file.type === "application/pdf" && file.size > 1.5 * 1024 * 1024) {
      alert("PDF size should be less than 1.5MB to prevent memory issues.");
      return;
    }

    try {
      setUploading(true);
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      
      if (!isImage && !isPdf) {
        alert("Please upload only images or PDF files.");
        setUploading(false);
        return;
      }

      let fileData;
      if (isImage) {
        fileData = await compressAndConvertToBase64(file);
      } else {
        fileData = await convertPdfToBase64(file);
      }

      setAttachment({
        name: file.name,
        type: isImage ? "image" : "pdf",
        url: fileData.url,
        mimeType: file.type,
        base64: fileData.base64
      });
    } catch (err) {
      console.error("Error processing file:", err);
      alert("Failed to process the uploaded file. Please try again.");
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKey(localStorage.getItem("medimind-gemini-key") || "");
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const currentConversation = getCurrentConversation();

  useEffect(() => {
    if (conversations.length === 0) {
      const id = createConversation();
      // Add welcome message
      setTimeout(() => {
        addMessage(id, {
          role: "assistant",
          content: isHindi
            ? "Namaste! Main MediMind AI hoon. Aap mujhse Hinglish (chat language) ya English mein baat kar sakte hain. Aaj aapko kya health problem/issue hai? 😊"
            : "Hello! I'm MediMind AI, your intelligent health assistant. 🏥\n\nI can help you with symptom analysis, medical advice, diet planning, and more. How can I help you today? 😊",
        });
      }, 150);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages, isTyping]);

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as { webkitSpeechRecognition: new () => { continuous: boolean; interimResults: boolean; lang: string; start: () => void; stop: () => void; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onend: (() => void) | null } }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? "hi-IN" : "en-IN";
      recognition.onresult = (event: { results: { transcript: string }[][] }) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [isHindi]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if ((!trimmed && !attachment) || isTyping) return;

    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const currentAttachment = attachment;
    setAttachment(null);

    setInput("");
    const isEmergency = detectEmergency(trimmed);
    if (isEmergency) setShowEmergency(true);

    const finalMessage = trimmed || (currentAttachment?.type === "image" ? "📷 Attached an image" : "📄 Attached a PDF report");

    // Add user message with attachment
    addMessage(convId, { 
      role: "user", 
      content: finalMessage,
      attachment: currentAttachment || undefined
    });

    // Get AI response from server-side API route
    setTyping(true);
    try {
      const history = currentConversation?.messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })) || [];

      // Call server-side API (so Gemini key stays secure & works correctly)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: isHindi ? `${finalMessage} (Reply strictly in Hinglish / Romanized Hindi / Chat language only. Do NOT use Devanagari script.)` : finalMessage,
          personality,
          history,
          attachment: currentAttachment ? {
            base64: currentAttachment.base64,
            mimeType: currentAttachment.mimeType,
            type: currentAttachment.type,
            name: currentAttachment.name
          } : undefined
        }),
      });

      const data = await res.json();
      const response = data.response || data.error || "Something went wrong. Please try again.";

      setTyping(false);

      // Stream the response word by word for a smooth feel
      const msgId = `stream-${Date.now()}`;
      setStreamingMessageId(msgId);
      setStreamingContent("");

      const words = response.split(" ");
      let currentContent = "";

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? " " : "") + words[i];
        setStreamingContent(currentContent);
        await new Promise((r) => setTimeout(r, 10));
      }

      setStreamingMessageId(null);
      addMessage(convId, {
        role: "assistant",
        content: response,
        isEmergency,
      });

      // Auto speak if enabled
      if (isSpeaking && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response.replace(/[*#]/g, ""));
        utterance.lang = isHindi ? "hi-IN" : "en-IN";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setTyping(false);
      addMessage(convId, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment. 🔄",
      });
    }
  }, [input, isTyping, currentConversationId, currentConversation, personality, isHindi, isSpeaking, createConversation, addMessage, setTyping, attachment]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const currentPersonality = personalities.find((p) => p.id === personality);
  const currentQuickReplies = quickReplies[personality as keyof typeof quickReplies] || quickReplies.general;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex gap-4">
      {/* Conversation Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-72 glass-card flex flex-col hide-mobile"
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-bold text-sm">Conversations</h3>
              <button
                onClick={() => {
                  const id = createConversation();
                  addMessage(id, {
                    role: "assistant",
                    content: "Hello! I'm MediMind AI. How can I help you today? 😊",
                  });
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(20,184,166,0.2)", color: "var(--color-primary)" }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <p className="text-center text-sm p-4" style={{ color: "var(--color-text-muted)" }}>
                  No conversations yet
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`p-3 rounded-xl mb-1 cursor-pointer flex items-start gap-2 group transition-all ${
                      conv.id === currentConversationId ? "bg-primary-500/10 border border-primary-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    <MessageSquare size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{conv.title}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {conv.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-8 h-8 glass rounded-lg flex items-center justify-center hide-mobile"
            style={{ color: "var(--color-text-muted)" }}
          >
            <MessageSquare size={15} />
          </button>

          <div className="ai-orb flex-shrink-0" style={{ width: 36, height: 36 }} />
          <div className="flex-1">
            <h2 className="font-bold text-sm">MediMind AI</h2>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Online • {currentPersonality?.emoji} {currentPersonality?.label} Mode</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Hindi toggle */}
            <button
              onClick={() => setHindi(!isHindi)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                isHindi ? "badge-primary" : "glass"
              }`}
              style={isHindi ? { color: "var(--color-primary)" } : { color: "var(--color-text-muted)" }}
            >
              {isHindi ? "🇮🇳 Hinglish" : "🇬🇧 EN"}
            </button>

            {/* Voice output */}
            <button
              onClick={() => setIsSpeaking(!isSpeaking)}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center"
              style={{ color: isSpeaking ? "var(--color-primary)" : "var(--color-text-muted)" }}
            >
              {isSpeaking ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Personality selector */}
            <div className="relative">
              <button
                onClick={() => setShowPersonalityMenu(!showPersonalityMenu)}
                className="w-8 h-8 glass rounded-lg flex items-center justify-center"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Settings2 size={15} />
              </button>
              <AnimatePresence>
                {showPersonalityMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-10 w-56 glass rounded-2xl border overflow-hidden z-50"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="p-2">
                      <p className="text-xs font-semibold px-2 py-1 mb-1" style={{ color: "var(--color-text-muted)" }}>AI Personality</p>
                      {personalities.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setPersonality(p.id); setShowPersonalityMenu(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                            personality === p.id ? "text-left" : "hover:bg-white/5 text-left"
                          }`}
                          style={personality === p.id ? { background: `${p.color}20`, color: p.color } : { color: "var(--color-text)" }}
                        >
                          <span className="text-lg">{p.emoji}</span>
                          <div>
                            <div className="font-semibold">{p.label}</div>
                            <div className="text-xs opacity-70">{p.desc}</div>
                          </div>
                          {personality === p.id && <Sparkles size={12} className="ml-auto" />}
                        </button>
                      ))}

                      {/* Client-Side Gemini API Key Configurator */}
                      <div className="mt-2 pt-2 border-t border-dashed" style={{ borderColor: "var(--color-border)" }}>
                        <p className="text-[10px] font-bold px-2 py-1 mb-1 uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>🔑 Gemini API Key</p>
                        <div className="px-2 pb-1">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                              setApiKey(e.target.value);
                              localStorage.setItem("medimind-gemini-key", e.target.value);
                            }}
                            placeholder="Paste AI key here..."
                            className="input-glass text-xs py-1.5 px-2.5 rounded-lg w-full bg-white/5 focus:bg-white/10 transition-all"
                            style={{ outline: "none", border: "1px solid var(--glass-border)" }}
                          />
                          <p className="text-[9px] mt-1.5 leading-normal" style={{ color: "var(--color-text-muted)" }}>
                            Saved in browser. Get a key from{" "}
                            <a
                              href="https://aistudio.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold underline hover:text-teal-400"
                              style={{ color: "var(--color-primary)" }}
                            >
                              Google AI Studio
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Emergency Alert */}
          <AnimatePresence>
            {showEmergency && <EmergencyAlert onClose={() => setShowEmergency(false)} />}
          </AnimatePresence>

          {/* Messages */}
          {currentConversation?.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming message */}
          {streamingMessageId && streamingContent && (
            <MessageBubble
              message={{ id: streamingMessageId, role: "assistant", content: streamingContent }}
              isStreaming={true}
            />
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && !streamingMessageId && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {currentQuickReplies.map((reply: string) => (
            <button
              key={reply}
              onClick={() => { setInput(reply); inputRef.current?.focus(); }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:bg-primary-500/20 hover:border-primary-500/30"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 pt-0">
          {/* File attachment preview */}
          <AnimatePresence>
            {attachment && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mb-3 p-2.5 rounded-xl flex items-center justify-between gap-3 border"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                      style={{ borderColor: "var(--glass-border)" }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-white">{attachment.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      {attachment.type === "image" ? "Ready to analyze image" : "Ready to analyze report PDF"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div
            className="flex items-end gap-3 rounded-2xl p-3"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHindi ? "Apne symptoms yahan likhein (Hinglish/Chat lang)..." : "Describe your symptoms or ask a health question..."}
              className="flex-1 bg-transparent outline-none resize-none text-sm max-h-28"
              style={{ color: "var(--color-text)" }}
              rows={1}
            />
            <div className="flex items-center gap-2">
              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5 disabled:opacity-50"
                style={{
                  background: "var(--glass-bg)",
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {uploading ? (
                  <span className="w-4.5 h-4.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip size={16} />
                )}
              </button>

              {/* Voice input */}
              <button
                onClick={handleVoiceInput}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isListening ? "rgba(217,70,239,0.2)" : "var(--glass-bg)",
                  color: isListening ? "#d946ef" : "var(--color-text-muted)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {isListening ? <VoiceWave /> : <Mic size={16} />}
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachment) || isTyping}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: "var(--gradient-primary)", color: "white" }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "var(--color-text-muted)" }}>
            ⚕️ AI assistance only — not a substitute for professional medical advice
          </p>
        </div>
      </div>
    </div>
  );
}
