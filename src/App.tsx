import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import AircraftModels from "./pages/AircraftModels.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import Contact from "./pages/Contact.tsx";
import Enquire from "./pages/Enquire.tsx";
import EnquiryForm from "./pages/EnquiryForm.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import Testimonials from "./pages/Testimonials.tsx";
import BlogPage from "./pages/Blog.tsx";
import ServicesList from "./pages/ServicesList.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/aircraft-models" element={<AircraftModels />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enquire" element={<Enquire />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/enquiry/:type" element={<EnquiryForm />} />
          <Route path="/blog" element={<BlogPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
