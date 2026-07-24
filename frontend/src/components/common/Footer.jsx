import { Link } from 'react-router-dom';
import { FaInstagram, FaXTwitter, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { HiShieldCheck, HiClock, HiSupport } from 'react-icons/hi';

const Footer = () => {
  const columns = [
    { title: 'Product', links: [{ label: 'Marketplace', to: '/products' }, { label: 'Features', to: '/about' }, { label: 'Pricing', to: '/products' }, { label: 'Enterprise', to: '/about' }] },
    { title: 'Company', links: [{ label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' }, { label: 'Careers', to: '/about' }] },
    { title: 'Resources', links: [{ label: 'Help Center', to: '/contact' }, { label: 'FAQs', to: '/contact' }, { label: 'Community', to: '/about' }] },
    { title: 'Legal', links: [{ label: 'Privacy Policy', to: '/privacy' }, { label: 'Terms of Service', to: '/terms' }, { label: 'Cookie Policy', to: '/privacy' }] },
  ];

  const socialLinks = [
    { icon: FaXTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-[#0F172A] mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Stay in the loop</h3>
              <p className="text-[#64748B] text-sm">Get updates on new products, features, and deals.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-[12px] text-white text-sm placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/40 focus:border-[#5B4BFF]/40 transition-all"
              />
              <button className="px-5 py-2.5 bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white text-sm font-semibold rounded-[12px] transition-all shadow-[0_2px_8px_rgba(91,75,255,0.3)] hover:shadow-[0_4px_16px_rgba(91,75,255,0.4)]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-white font-bold text-[15px]">StreamKart</span>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">Your one-stop marketplace for premium digital subscriptions.</p>
            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2 text-[#64748B] hover:text-white hover:bg-white/[0.06] rounded-[10px] transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[#94A3B8] font-semibold text-[12px] uppercase tracking-[0.08em] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[#64748B] hover:text-white text-sm transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium">
            <HiShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium">
            <HiClock className="w-4 h-4 text-[#F59E0B]" />
            <span>Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium">
            <HiSupport className="w-4 h-4 text-[#5B4BFF]" />
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#475569] text-xs">
            © {new Date().getFullYear()} StreamKart. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#475569]">
            <Link to="/privacy" className="hover:text-[#94A3B8] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#94A3B8] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
