import { Home, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer id="contact" className="bg-[hsl(var(--brand-dark))] text-white/90">
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="bg-white inline-block px-4 py-2 rounded-full mb-5">
              <img src={logo} alt="Connection Aviation" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Welcome to Connection Aviation, where we redefine the skies with a commitment to personalized air travel experiences.
            </p>
          </div>

          <div>
            <h4 className="text-accent font-semibold tracking-widest text-sm mb-5">
              IMPORTANT LINKS
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-accent font-semibold tracking-widest text-sm mb-5">
              ENQUIRIES
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/services/private-jet-service" className="hover:text-accent transition-colors">Private Jet</Link></li>
              <li><Link to="/services/air-ambulance-service" className="hover:text-accent transition-colors">Air Ambulance</Link></li>
              <li><Link to="/services/aircraft-management-service" className="hover:text-accent transition-colors">Aircraft Management</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-accent font-semibold tracking-widest text-sm mb-5">
              CONTACT
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Home className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Salhiya St, Kuwait City, Kuwait</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="mailto:charter@connection-aviation.com" className="hover:text-accent break-all">
                  charter@connection-aviation.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <span>(+965) 90010418</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Copyright | All Rights Reserved | <span className="text-white">Connection Aviation</span>
      </div>
    </footer>
  );
};

export default Footer;
