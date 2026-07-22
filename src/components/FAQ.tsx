import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { API_BASE_URL } from "../services/api.ts";

interface FAQItem {
  id?: number;
  question: string;
  answer: string;
  display_order?: number;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate tracking for left and right columns to keep heights and interactions independent
  const [openLeft, setOpenLeft] = useState<number | null>(0); // First item on left open by default
  const [openRight, setOpenRight] = useState<number | null>(null);



  useEffect(() => {
    fetch(`${API_BASE_URL}/api/faqs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("FAQ Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Split the data dynamically into two distinct streams to maintain a proper grid pattern
  const leftColumnFaqs = faqs.filter((_, index) => index % 2 === 0);
  const rightColumnFaqs = faqs.filter((_, index) => index % 2 !== 0);

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Header section remains prominent and centered */}
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-brand-navy mb-3 font-bold">
            Frequently Asked Questions
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto" />
        </div>

        {/* Responsive Layout Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column (Even Elements) */}
          <div className="space-y-4">
            {leftColumnFaqs.map((f, i) => {
              const isOpen = openLeft === i;
              return (
                <div
                  key={f.id || `left-${i}`}
                  className={`border rounded-lg transition-all duration-300 bg-white ${
                    isOpen ? "border-accent shadow-sm" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenLeft(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-brand-navy font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <span className="pr-4">{f.question}</span>
                    <div className="shrink-0">
                      {isOpen ? (
                        <Minus className="w-5 h-5 text-accent" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-50 pt-4">
                      {f.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (Odd Elements) */}
          <div className="space-y-4">
            {rightColumnFaqs.map((f, i) => {
              const isOpen = openRight === i;
              return (
                <div
                  key={f.id || `right-${i}`}
                  className={`border rounded-lg transition-all duration-300 bg-white ${
                    isOpen ? "border-accent shadow-sm" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenRight(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-brand-navy font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <span className="pr-4">{f.question}</span>
                    <div className="shrink-0">
                      {isOpen ? (
                        <Minus className="w-5 h-5 text-accent" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-50 pt-4">
                      {f.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;