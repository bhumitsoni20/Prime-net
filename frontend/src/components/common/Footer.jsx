import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaXTwitter,
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";
import { HiShieldCheck, HiClock, HiSupport } from "react-icons/hi";

const Footer = () => {
  const columns = [
    {
      title: "Marketplace",
      links: [
        { label: "All Categories", to: "/products" },
        { label: "Features", to: "/about" },
        { label: "Pricing", to: "/products" },
        { label: "How it Works", to: "/about" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", to: "/about" },
        { label: "Careers", to: "/about" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
    { title: "Resources", links: [{ label: "Help Center", to: "/contact" }] },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms and Conditions", to: "/terms" },
        { label: "Refund Policy", to: "/refund" },
        { label: "Seller Policy", to: "/seller-policy" },
        {
          label: "Seller Verification Policy",
          to: "/seller-verification-policy",
        },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaXTwitter, href: "https://twitter.com", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: FaGithub, href: "https://github.com", label: "GitHub" },
    { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-[#0F172A] mt-auto text-white">
      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 ">
              <Link to="/" className="hover:opacity-90 transition-opacity">
                <img
                  src="/streamkart-logo-nav.png"
                  alt="StreamKart"
                  className="h-14 scale-[3.0] origin-left w-auto object-contain drop-shadow-md"
                />
              </Link>
            </div>
            <p className="text-[#94A3B8] text-[13px] leading-relaxed mb-6 max-w-xs">
              Your one-stop marketplace for premium digital subscriptions.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center text-[#94A3B8] hover:text-white bg-white/[0.04] hover:bg-white/[0.1] rounded-[10px] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-[14px] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[#94A3B8] hover:text-white text-[13px] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-[#64748B] text-[12px]">
            © {new Date().getFullYear()} StreamKart. All rights reserved.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[#94A3B8] text-[12px] font-semibold">
              <HiShieldCheck className="w-[18px] h-[18px] text-[#22C55E]" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8] text-[12px] font-semibold">
              <HiClock className="w-[18px] h-[18px] text-[#F59E0B]" />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8] text-[12px] font-semibold">
              <HiSupport className="w-[18px] h-[18px] text-[#A855F7]" />
              <span>24/7 Support</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
