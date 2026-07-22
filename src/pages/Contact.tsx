import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Subscribe from "@/components/Subscribe";
import heroImg from "@/assets/hero-jet.jpg";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks! We'll be in touch within 24 hours.");
    setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="container relative z-10 mx-auto px-4 lg:px-8 grid md:grid-cols-3 gap-8 text-white">
            <h1 className="font-display text-4xl md:text-5xl">24h Contact</h1>
            <div>
              <h3 className="text-accent font-semibold tracking-widest text-sm mb-3">REACH US</h3>
              <p className="text-sm"><span className="font-semibold">ADDRESS:</span> Salhiya St, Kuwait City, Kuwait</p>
              <p className="text-sm mt-1"><span className="font-semibold">CALL:</span> (+965) 90010418</p>
            </div>
            <div>
              <h3 className="text-accent font-semibold tracking-widest text-sm mb-3">CONNECT US</h3>
              <p className="text-sm"><span className="font-semibold">CALL:</span> (+965) 22261000</p>
              <p className="text-sm mt-1"><span className="font-semibold">EMAIL:</span> charter@connection-aviation.com</p>
            </div>
          </div>
        </section>

        <section className="bg-brand-light py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl text-brand-navy mb-2">Reach Us</h2>
              <div className="w-16 h-0.5 bg-accent mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-md shadow-brand-card">
              <iframe
                title="Connection Aviation location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=47.96%2C29.36%2C47.99%2C29.39&layer=mapnik&marker=29.375%2C47.975"
                className="w-full h-80 rounded-md border border-border"
                loading="lazy"
              />
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-brand-navy mb-1">First Name</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Your First Name"
                      className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-navy mb-1">Last Name</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Your Last Name"
                      className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-brand-navy mb-1">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Your Email Address"
                      className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-navy mb-1">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Your Phone"
                      className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-brand-navy mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your message"
                    className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-navy text-white py-3 font-semibold tracking-widest text-xs hover:opacity-90 transition-opacity rounded-sm"
                >
                  SUBMIT REQUEST
                </button>
              </form>
            </div>
          </div>
        </section>
        <Subscribe />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
