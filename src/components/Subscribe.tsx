const Subscribe = () => {
  return (
    <section className="bg-brand-light py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">
              <span className="text-foreground">Subscribe to receive</span>
              <br />
              <span className="text-brand-navy">our exclusive offers</span>
            </h2>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button
              type="submit"
              className="bg-brand-gradient text-white px-6 py-3 font-semibold tracking-wider text-xs hover:opacity-90 transition-opacity"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
