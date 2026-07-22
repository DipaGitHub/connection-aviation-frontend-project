import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { API_BASE_URL } from "../services/api.ts";

interface Service {
  slug: string;
  title: string;
  shortDesc: string;
  image_path: string;
}

const ServicesList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading services:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-zinc-800">
      <Header />
      <main>
        <PageHero
          title="Our Services"
          subtitle="Explore our comprehensive range of private aviation services tailored to meet your every need."
        />

        <section className="py-20 bg-zinc-50">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              <div className="text-center py-20 text-lg text-zinc-500">Loading Services...</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div
                    key={service.slug}
                    className="rounded-xl overflow-hidden shadow-lg bg-white border border-zinc-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      <div className="relative w-full h-64 bg-zinc-100 overflow-hidden">
                        <img
                          src={`${API_BASE_URL}${service.image_path}`}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-display text-2xl text-brand-navy font-bold mb-3 tracking-tight">
                          {service.title}
                        </h3>
                        <p className="text-zinc-600 line-clamp-3 text-sm leading-relaxed mb-4 text-justify text-justify-inter-word">
                          {service.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-zinc-50 flex items-center justify-end">
                      <Link
                        to={`/services/${service.slug}`}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors tracking-wide"
                      >
                        VIEW MORE
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesList;
