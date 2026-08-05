import { Link } from 'react-router-dom';
import { FaInstagram, FaXTwitter, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { HiShieldCheck, HiClock, HiSupport } from 'react-icons/hi';

const Footer = () => {
  const columns = [
    { title: 'Marketplace', links: [{ label: 'All Categories', to: '/products' }, { label: 'Features', to: '/about' }, { label: 'Pricing', to: '/products' }, { label: 'How it Works', to: '/about' }] },
    { title: 'Company', links: [{ label: 'About Us', to: '/about' }, { label: 'Careers', to: '/about' }, { label: 'Contact Us', to: '/contact' }] },
    { title: 'Resources', links: [{ label: 'Help Center', to: '/contact' }] },
    { title: 'Legal', links: [{ label: 'Privacy Policy', to: '/privacy' }, { label: 'Terms and Condition', to: '/terms' }, { label: 'Refund Policy', to: '/refund' }, { label: 'Seller Policy', to: '/seller-policy' }, { label: 'Seller Verification Policy', to: '/seller-verification-policy' }] },
  ];

  const socialLinks = [
    { icon: FaXTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
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
                <img src="/streamkart-logo-nav.png" alt="StreamKart" className="h-14 scale-[3.0] origin-left w-auto object-contain drop-shadow-md" />
              </Link>
            </div>
            <p className="text-[#94A3B8] text-[13px] leading-relaxed mb-6 max-w-xs">Your one-stop marketplace for premium digital subscriptions.</p>
            {/* Social */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 flex items-center justify-center text-[#94A3B8] hover:text-white bg-white/[0.04] hover:bg-white/[0.1] rounded-[10px] transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-[14px] mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[#94A3B8] hover:text-white text-[13px] transition-colors duration-200">
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

          {/* Payment Logos (Mockup using text blocks to simulate the image) */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-white rounded-[4px] flex items-center justify-center text-[8px] font-black text-[#1A1F71] tracking-widest shadow-sm">VISA</div>
            <div className="w-10 h-6 bg-white rounded-[4px] flex items-center justify-center shadow-sm relative overflow-hidden">
               <div className="w-4 h-4 rounded-full bg-[#EB001B] absolute left-1 mix-blend-multiply opacity-90"></div>
               <div className="w-4 h-4 rounded-full bg-[#F79E1B] absolute right-1 mix-blend-multiply opacity-90"></div>
            </div>
            <div className="w-10 h-6 bg-white rounded-[4px] flex items-center justify-center text-[9px] font-black italic text-[#64748B] shadow-sm border border-[#F1F5F9]">UPI</div>
            <div className="w-10 h-6 bg-white rounded-[4px] flex items-center justify-center text-[9px] font-bold text-[#002970] shadow-sm">Paytm</div>
            <div className="w-10 h-6 bg-white rounded-[4px] flex items-center gap-0.5 justify-center text-[#5F6368] shadow-sm">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-[9px] font-semibold">Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
