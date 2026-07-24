import { useNavigate, Link } from 'react-router-dom';
import HeroSection from '../../components/common/HeroSection';
import CategoryFilter from '../../components/common/CategoryFilter';
import ProductCard from '../../components/cards/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { HiSparkles, HiLockClosed, HiUsers, HiLightningBolt, HiOutlineHeadphones, HiPaperAirplane } from 'react-icons/hi';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useProducts('limit=4&sort=rating');

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-[#F8FAFC]">
      <HeroSection onSearch={handleSearch} />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Explore Top Categories</h2>
          <Link to="/products" className="text-[14px] font-bold text-[#5B4BFF] hover:text-[#4F3FE8] transition-colors flex items-center gap-1">
            View all categories <span className="text-[18px]">→</span>
          </Link>
        </div>
        <CategoryFilter selected="" onSelect={(cat) => navigate(`/products?category=${cat}`)} variant="cards" />
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] flex items-center gap-2">
            Trending Subscriptions <HiSparkles className="text-[#A855F7] w-6 h-6" />
          </h2>
          <Link to="/products" className="text-[14px] font-bold text-[#5B4BFF] hover:text-[#4F3FE8] transition-colors flex items-center gap-1">
            View all <span className="text-[18px]">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="relative">
            {/* Optional Carousel Arrows (Visual only for now as requested by UI design) */}
            <button className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 text-[#64748B] hover:text-[#0F172A] hidden lg:flex">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 text-[#64748B] hover:text-[#0F172A] hidden lg:flex">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.data?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] mt-6">
            <div className="h-16 w-16 bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Nothing here yet</h3>
            <p className="text-[#64748B] text-[15px] mb-6 max-w-md mx-auto">Be the first one to start selling premium digital subscriptions on our platform.</p>
            <Link to="/register"><Button size="lg">Become a Seller</Button></Link>
          </div>
        )}
      </section>

      {/* Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-[14px] bg-[#F3F1FF] text-[#5B4BFF] flex items-center justify-center flex-shrink-0">
              <HiLockClosed className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">100% Secure Payments</h4>
              <p className="text-[12px] text-[#64748B] leading-snug">Your payments are protected with top-level security.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center flex-shrink-0">
              <HiUsers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">Trusted by 4+ Users</h4>
              <p className="text-[12px] text-[#64748B] leading-snug">Join thousands of happy customers worldwide.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <HiLightningBolt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">Instant Delivery</h4>
              <p className="text-[12px] text-[#64748B] leading-snug">Get access to your digital products instantly.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] text-[#64748B] flex items-center justify-center flex-shrink-0">
              <HiOutlineHeadphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">24/7 Support</h4>
              <p className="text-[12px] text-[#64748B] leading-snug">We're here to help you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative bg-white border border-[#E2E8F0] rounded-[32px] p-8 md:p-12 overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
          {/* Subtle Background Gradient */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#F3F1FF] to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="hidden sm:block relative w-32 h-32 flex-shrink-0">
                {/* Envelope Illustration matching the design */}
                <motion.div 
                   animate={{ y: [-5, 5, -5] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-[#5B4BFF] rounded-xl flex items-center justify-center text-white text-5xl shadow-[0_10px_30px_rgba(91,75,255,0.3)] rotate-[-10deg]"
                >
                  <svg className="w-16 h-16 opacity-50 absolute top-2 right-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  <HiPaperAirplane className="w-12 h-12 text-white relative z-10 transform -rotate-45 -translate-y-2 translate-x-2" />
                </motion.div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#A855F7] rounded-full blur-[20px] opacity-40"></div>
              </div>
              <div>
                <h3 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Stay ahead of the curve</h3>
                <p className="text-[#64748B] text-[15px] max-w-md">Subscribe to get the latest deals, offers and product updates.</p>
              </div>
            </div>

            <div className="w-full md:w-auto flex-1 max-w-md">
              <form className="flex bg-[#F8FAFC] p-1.5 rounded-[16px] border border-[#E2E8F0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:ring-[3px] focus-within:ring-[#5B4BFF]/10 focus-within:border-[#5B4BFF] transition-all">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-transparent border-none px-5 text-[15px] text-[#0F172A] placeholder-[#94A3B8] focus:ring-0 outline-none"
                  required
                />
                <Button type="submit" size="lg" className="px-8 rounded-[12px] shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex items-center gap-2 flex-shrink-0">
                  Subscribe <HiPaperAirplane className="w-4 h-4 rotate-90" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
