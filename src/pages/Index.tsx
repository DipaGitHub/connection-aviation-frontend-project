import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Subscribe from "@/components/Subscribe";
import Footer from "@/components/Footer";
import Testimonials from "@/pages/Testimonials";
import BlogSection from "@/components/BlogSection";
import { API } from "@/services/api";

// --- LIVE CHATBOT: topics + follow-ups come from the backend, leads are submitted back ---
interface ChatTopic {
  id: number;
  topic_name: string;
  initial_answer: string;
  follow_up_questions: string[] | string | null;
}

type ChatMessage = { sender: "bot" | "user"; text: string };
type ChatStage = "topics" | "followup" | "contact" | "done";

const WELCOME_MESSAGE: ChatMessage = {
  sender: "bot",
  text: "Welcome to Connection Aviation. How may our operations team assist your flight plans today?",
};

const CONTACT_PROMPT =
  "Great! Could you share your name and phone number so our operations team can follow up? (Email is optional)";

const normalizeFollowUps = (raw: ChatTopic["follow_up_questions"]): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Topics fetched from the backend ---
  const [topics, setTopics] = useState<ChatTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState(false);

  // --- Conversation state ---
  const [stage, setStage] = useState<ChatStage>("topics");
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", phone_number: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch active topics once on mount
  useEffect(() => {
    fetch(API.chatbotPublicTopics)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => setTopicsError(true))
      .finally(() => setLoadingTopics(false));
  }, []);

  // Auto-scroll logic inside chat terminal window
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const pushBotMessage = (text: string, delay = 400) => {
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "bot", text }]);
    }, delay);
  };

  const resetConversation = () => {
    setChatMessages([WELCOME_MESSAGE]);
    setStage("topics");
    setSelectedTopic(null);
    setFollowUpIndex(0);
    setTextInput("");
    setContactForm({ name: "", phone_number: "", email: "" });
    setSubmitError(null);
  };

  const handleTopicClick = (topic: ChatTopic) => {
    setChatMessages((prev) => [...prev, { sender: "user", text: topic.topic_name }]);
    setSelectedTopic(topic);

    pushBotMessage(topic.initial_answer, 300);

    const followUps = normalizeFollowUps(topic.follow_up_questions);
    if (followUps.length > 0) {
      setFollowUpIndex(0);
      pushBotMessage(followUps[0], 900);
      setStage("followup");
    } else {
      pushBotMessage(CONTACT_PROMPT, 900);
      setStage("contact");
    }
  };

  const handleFollowUpAnswer = () => {
    const answer = textInput.trim();
    if (!answer || !selectedTopic) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: answer }]);
    setTextInput("");

    const followUps = normalizeFollowUps(selectedTopic.follow_up_questions);
    const nextIndex = followUpIndex + 1;

    if (nextIndex < followUps.length) {
      setFollowUpIndex(nextIndex);
      pushBotMessage(followUps[nextIndex], 500);
    } else {
      pushBotMessage(CONTACT_PROMPT, 500);
      setStage("contact");
    }
  };

  const handleContactSubmit = async () => {
    if (!contactForm.name.trim() || !contactForm.phone_number.trim()) {
      setSubmitError("Please provide both your name and phone number.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const finalTranscript = [
      ...chatMessages,
      { sender: "user" as const, text: `${contactForm.name.trim()} — ${contactForm.phone_number.trim()}` },
    ];

    try {
      const res = await fetch(API.chatbotSubmitLead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          phone_number: contactForm.phone_number.trim(),
          email: contactForm.email.trim() || null,
          selected_topic: selectedTopic?.topic_name || "General Enquiry",
          chat_transcript: finalTranscript,
        }),
      });
      if (!res.ok) throw new Error();

      setChatMessages(finalTranscript);
      pushBotMessage("Thank you! Our operations team will contact you shortly. ✈️", 400);
      setStage("done");
    } catch {
      setSubmitError("Something went wrong submitting your details. Please try WhatsApp instead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <main>
        <Hero />
        <Services />
        <Features />
        <Testimonials />
        <FAQ />
        <BlogSection />
        <Subscribe />
      </main>
      <Footer />

      {/* --- STICKY SIDE BAR (80% Top Margin, Right Side) --- */}
      <div
        className="fixed right-0 z-50 flex flex-col items-end gap-3 px-4 pointer-events-none"
        style={{ top: "70%" }}
      >
        <div className="flex flex-col gap-3 pointer-events-auto items-end">

          {/* 1. Official WhatsApp Brand Button */}
          <a
            href="https://wa.me/your-number-here"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat via WhatsApp"
            className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group relative"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.854.002-2.634-1.02-5.11-2.881-6.974-1.86-1.865-4.343-2.891-6.985-2.893-5.44 0-9.866 4.417-9.869 9.855-.001 1.77.463 3.5 1.34 5.01l-.995 3.635 3.716-.975zM17.486 14.4c-.269-.135-1.594-.786-1.841-.875-.246-.09-.427-.135-.607.135-.179.27-.696.875-.853 1.056-.157.18-.314.202-.583.067-.27-.135-1.138-.419-2.167-1.338-.802-.715-1.343-1.599-1.5-1.869-.157-.27-.017-.417.118-.552.121-.122.27-.315.405-.472.134-.157.179-.27.269-.45.09-.18.045-.337-.022-.472-.068-.135-.607-1.463-.832-2.003-.219-.527-.441-.456-.607-.464-.157-.008-.337-.009-.517-.009-.18 0-.472.067-.719.337-.247.27-.943.922-.943 2.248s.965 2.611 1.099 2.791c.135.18 1.9 2.901 4.604 4.069.643.277 1.144.443 1.536.567.646.206 1.234.177 1.7.107.519-.078 1.594-.652 1.819-1.282.225-.63.225-1.17.157-1.282-.068-.113-.247-.18-.517-.315z" />
            </svg>
            <span className="absolute right-full mr-3 bg-zinc-900 text-white text-[11px] font-semibold tracking-wider px-2 py-1 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              WhatsApp
            </span>
          </a>

          {/* 2. Official Facebook Brand Button */}
          <a
            href="https://facebook.com/your-page-here"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow us on Facebook"
            className="w-12 h-12 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group relative"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="absolute right-full mr-3 bg-zinc-900 text-white text-[11px] font-semibold tracking-wider px-2 py-1 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              Facebook
            </span>
          </a>

          {/* 3. Live Chatbot Trigger */}
          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 group relative ${isChatOpen
              ? "bg-zinc-900 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-zinc-950"
              }`}
          >
            {isChatOpen ? (
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            )}

            {!isChatOpen && (
              <span className="absolute right-full mr-3 bg-zinc-900 text-white text-[11px] font-semibold tracking-wider px-2 py-1 rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                Live Support
              </span>
            )}
          </button>

        </div>
      </div>

      {/* --- LIVE CHATBOT MODAL WINDOW --- */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 w-[92vw] sm:w-[380px] h-[480px] bg-white rounded-xl shadow-2xl border border-zinc-100 z-50 overflow-hidden flex flex-col transition-all duration-200">

          {/* Header */}
          <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-xs tracking-wide uppercase">Aviation Assistant</h3>
                <p className="text-[9px] text-zinc-400">Connection Aviation Context Engine</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Feed Viewport */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2 text-xs whitespace-pre-line shadow-sm border ${msg.sender === "user"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-800 border-zinc-200 leading-relaxed"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Stage 1: Topic selection (fetched from backend) */}
          {stage === "topics" && (
            <div className="p-3 bg-white border-t border-zinc-100 space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                Select an option to ask:
              </p>
              {loadingTopics ? (
                <div className="text-center py-3 text-[11px] text-zinc-400">Loading options…</div>
              ) : topicsError ? (
                <div className="text-center py-3 text-[11px] text-red-500">
                  Couldn't load topics. Please use WhatsApp instead.
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-zinc-400">
                  No topics available right now.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicClick(topic)}
                      className="w-full text-left bg-zinc-50 hover:bg-amber-500/10 hover:text-amber-600 border border-zinc-200/80 hover:border-amber-500/30 rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-all duration-150"
                    >
                      {topic.topic_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stage 2: Follow-up question, free text */}
          {stage === "followup" && (
            <div className="p-3 bg-white border-t border-zinc-100 space-y-2">
              <div className="flex gap-2">
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFollowUpAnswer()}
                  placeholder="Type your answer…"
                  className="flex-1 text-xs border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleFollowUpAnswer}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 text-xs font-semibold transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Contact capture -> submitted as a lead */}
          {stage === "contact" && (
            <div className="p-3 bg-white border-t border-zinc-100 space-y-2">
              <input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your name *"
                className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                value={contactForm.phone_number}
                onChange={(e) => setContactForm({ ...contactForm, phone_number: e.target.value })}
                placeholder="Phone number *"
                className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="Email (optional)"
                className="w-full text-xs border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {submitError && (
                <p className="text-[10px] text-red-500">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleContactSubmit}
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-zinc-950 rounded-lg px-3 py-2 text-xs font-bold transition-colors"
              >
                {submitting ? "Sending…" : "Submit"}
              </button>
            </div>
          )}

          {/* Stage 4: Done */}
          {stage === "done" && (
            <div className="p-3 bg-white border-t border-zinc-100 space-y-2 text-center">
              <p className="text-[11px] text-zinc-500">Thanks — our team will reach out shortly.</p>
              <button
                type="button"
                onClick={resetConversation}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 underline"
              >
                Ask something else
              </button>
            </div>
          )}

          {/* Verified System Tray Signature Footer */}
          <div className="bg-zinc-50 px-4 py-2 border-t border-zinc-100 text-[9px] text-center text-zinc-400 font-medium">
            🔒 Connection Aviation
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;