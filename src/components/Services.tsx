import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api.ts";

interface Service {
  slug: string;
  title: string;
  shortDesc: string;
  image_path: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        // Only show first 4 on homepage as per original logic
        setServices(data.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading services:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-24 text-center">Loading Services...</div>;

  return (
    <section id="services" className="bg-brand-light py-24 lg:py-32 mt-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-brand-navy mb-4">
            Our Services
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </div>

        <div className="space-y-20 lg:space-y-28">
          {services.map((s, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={s.slug}
                className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
              >
                {/* Image Section */}
                <div className="overflow-hidden rounded-[10px] rounded-tr-[30px] rounded-bl-[30px] shadow-brand-card">
                  <img
                    src={`${API_BASE_URL}${s.image_path}`}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Content Section */}
                <div className={reverse ? "md:text-right" : ""}>
                  <h3 className="font-display text-3xl md:text-4xl text-brand-navy mb-4">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto md:mx-0 md:[&]:max-w-none">
                    {s.shortDesc}
                  </p>
                  <Link
                    to={`/services/${s.slug}`}
                    className="inline-block text-accent font-semibold tracking-widest text-sm hover:text-[hsl(var(--brand-navy))] transition-colors"
                  >
                    READ MORE →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/services"
            className="inline-block bg-brand-gradient text-white px-10 py-3.5 rounded-full font-semibold tracking-widest text-xs hover:opacity-90 transition-opacity shadow-md"
          >
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;