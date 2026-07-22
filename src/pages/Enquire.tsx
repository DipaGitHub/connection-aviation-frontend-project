import { Link } from "react-router-dom";
import { Plane, Stethoscope, Wind } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API } from "@/services/api";

const options = [
  { label: "PRIVATE JET", slug: "private-jet", Icon: Plane },
  { label: "AIR AMBULANCE", slug: "air-ambulance", Icon: Stethoscope },
  { label: "HELICOPTER", slug: "helicopter", Icon: Wind },
];

const Enquire = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-brand-gradient py-32 px-4">
        <div className="text-center text-white w-full">
          <h1 className="font-display text-5xl md:text-6xl mb-3">Enquire Now</h1>
          <div className="w-20 h-px bg-white/70 mx-auto mb-12" />
          <div className="flex flex-wrap justify-center gap-6">
            {options.map(({ label, slug, Icon }) => (
              <Link
                key={slug}
                to={`/enquiry/${slug}`}
                className="flex items-center gap-3 bg-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-purple))] transition-colors px-7 py-4 rounded-md min-w-[200px] justify-center shadow-brand-card"
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm tracking-widest font-semibold">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Enquire;
