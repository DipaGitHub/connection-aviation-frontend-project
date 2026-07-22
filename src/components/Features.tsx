import { Award, Users, Eye, Lock } from "lucide-react";

const features = [
  { icon: Award, title: "EXPERIENCE", desc: "Air charter solutions for our clients since 2004" },
  { icon: Users, title: "KNOWLEDGE", desc: "Specialist team contactable 24/7" },
  { icon: Eye, title: "TRANSPARENCY", desc: "Meeting and exceeding expectations" },
  { icon: Lock, title: "PRIVACY", desc: "Guaranteed privacy for all your charter flights" },
];

const Features = () => {
  return (
    <section className="bg-brand-gradient py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-white/40 rounded-md p-6 text-center text-white hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-center mb-4">
                <f.icon className="w-10 h-10" strokeWidth={1.3} />
              </div>
              <h3 className="font-semibold tracking-widest text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-white/80 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
