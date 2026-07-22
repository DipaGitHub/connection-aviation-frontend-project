import heroImg from "@/assets/hero-jet.jpg";

interface Props {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  image?: string;
}

const PageHero = ({ title, subtitle, ctaLabel, image }: Props) => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
      <img
        src={image ?? heroImg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center text-white">
        <h1 className="font-display text-4xl md:text-6xl mb-5 drop-shadow">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl mx-auto text-sm md:text-base text-white/90 leading-relaxed mb-8">
            {subtitle}
          </p>
        )}
        {ctaLabel && (
          <a
            href="#contact"
            className="inline-block bg-brand-gradient text-white px-7 py-3 rounded-full font-semibold tracking-widest text-xs hover:opacity-90 transition-opacity"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
};

export default PageHero;
