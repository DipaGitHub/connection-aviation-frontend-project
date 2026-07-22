import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Subscribe from "@/components/Subscribe";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import PageHero from "@/components/PageHero";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { API, API_BASE_URL } from "@/services/api";

interface Service {
  id?: number;
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string[] | string;
  image_path: string;
}

interface ServiceFaq {
  id?: number;
  service_id: number;
  question: string;
  answer: string;
  display_order: number;
}

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());



  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(API.services)
      .then((res) => res.json())
      .then((data: Service[]) => {
        if (Array.isArray(data)) {
          const found = data.find((s) => s.slug === slug);

          if (found) {
            let normalizedLongDesc: string[] | string = found.longDesc;

            if (typeof normalizedLongDesc === "string") {
              try {
                normalizedLongDesc = JSON.parse(normalizedLongDesc) as string[] | string;
              } catch (e) {
                // Keep original string if parsing fails
              }
            }

            setService({ ...found, longDesc: normalizedLongDesc });

            // Fetch FAQs for this service
            if (found.id) {
              fetchServiceFaqs(found.id);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching service details:", err);
        setLoading(false);
      });
  }, [slug]);

  const fetchServiceFaqs = async (serviceId: number) => {
    setFaqLoading(true);
    try {
      const res = await fetch(`${API.serviceFaqs}/service/${serviceId}`);
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    } finally {
      setFaqLoading(false);
    }
  };

  const toggleFaq = (id: number) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFaqs(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light/20">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-brand-navy font-display text-xl tracking-wider"
        >
          Loading Services...
        </motion.div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-40 pb-20 text-center container mx-auto px-4">
          <h1 className="font-display text-4xl text-brand-navy mb-4">Service not found</h1>
          <Link to="/" className="text-accent hover:underline font-medium">Back to home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = service.image_path.startsWith('http')
    ? service.image_path
    : `${API_BASE_URL}${service.image_path}`;

  // Animation profiles
  const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        {/* Dynamic PageHero */}
        <PageHero
          title={service.title}
          image={imageUrl}
        />

        {/* Expanded Row Layout with Restored Luxury Side Padding Blocks */}
        <section className="py-16 md:py-24 bg-white">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="block after:content-[''] after:clear-both after:table">
              {/* Image Area (Floated Left on Desktop) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
                className="relative w-full md:w-[45%] lg:w-[45%] md:float-left md:mr-10 lg:mr-12 mb-8 rounded-xl overflow-hidden shadow-xl"
              >
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-[380px] sm:h-[450px] md:h-[550px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/20 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Text Content (Flows around the floated image) */}
              <div className="pt-2">
                {/* Header Sub-group */}
                <div className="mb-4">
                  <span className="text-accent font-bold tracking-widest text-xs uppercase mb-1.5 block">
                    Our Expertise
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-navy tracking-tight leading-tight font-bold">
                    {service.title}
                  </h2>
                </div>

                {/* Short Description */}
                <div className="mb-6 border-l-4 border-accent pl-4 py-1.5 bg-brand-light/5 rounded-r">
                  <p className="text-gray-700 text-lg md:text-xl font-medium leading-normal italic">
                    "{service.shortDesc}"
                  </p>
                </div>

                {/* Long Description */}
                <div className="prose prose-md text-gray-600 text-sm md:text-base leading-relaxed space-y-4 pt-4 border-t border-gray-100 text-justify text-justify-inter-word">
                  {Array.isArray(service.longDesc) ? (
                    service.longDesc.map((paragraph, i) => (
                      <p key={i} className="m-0">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="m-0">{service.longDesc}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service-Specific FAQ Section */}
        {service.id && (
          <section className="py-16 md:py-20 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 lg:px-16">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <span className="text-accent font-bold tracking-widest text-xs uppercase mb-2 block">
                  Common Questions
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-brand-navy font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                  Find answers to the most common questions about {service.title}
                </p>
              </motion.div>

              {faqLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-accent h-8 w-8" />
                </div>
              ) : faqs.length === 0 ? (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200"
                >
                  <p className="text-gray-500 text-lg">
                    No FAQs available for this service yet.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back soon for more information.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="space-y-4"
                >
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
                    >
                      <button
                        onClick={() => faq.id && toggleFaq(faq.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200 group"
                      >
                        <div className="flex items-center gap-4 pr-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                            {faq.display_order || index + 1}
                          </span>
                          <h3 className="font-semibold text-brand-navy text-base md:text-lg group-hover:text-accent transition-colors duration-200">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {faq.id && expandedFaqs.has(faq.id) ? (
                            <ChevronUp className="h-5 w-5 text-accent" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors duration-200" />
                          )}
                        </div>
                      </button>

                      {faq.id && expandedFaqs.has(faq.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="px-6 pb-5 pt-0"
                        >
                          <div className="border-t border-gray-100 pt-4">
                            <p className="text-gray-600 text-base leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* Supporting Modules */}
        <Features />

        {/* Global FAQ Section - Keep this if you want both */}
        {/* <FAQ /> */}

        <Subscribe />
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;