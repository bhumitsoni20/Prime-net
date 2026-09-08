import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiSparkles, HiLockClosed, HiUsers, HiLightningBolt, HiSupport, HiPaperAirplane, HiCollection, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../../components/common/HeroSection';
import CategoryFilter from '../../components/common/CategoryFilter';
import ProductCard from '../../components/cards/ProductCard';
import Pagination from '../../components/ui/Pagination';
import { useProducts } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { getPublicStats } from '../../services/public.service';
import { SpotlightCard, CountUp } from '../../components/reactbits';

const Home = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const productSectionRef = useRef(null);

  // Fetch paginated products directly for the home page showcase (newest first)
  const { data: productsData, isLoading } = useProducts(`page=${page}&limit=12&sort=createdAt_desc`);

  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
  });

  const rawUserCount = stats?.totalUsers !== undefined ? stats.totalUsers : 4;

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategorySelect = (cat) => {
    if (cat) {
      navigate(`/products?category=${cat}`);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (productSectionRef.current) {
      const yOffset = -90;
      const y = productSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAFBFF]">
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Explore Top Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5B4BFF]/10 text-[#5B4BFF] mb-2">
              <HiSparkles className="w-3.5 h-3.5" />
              <span>Curated Ecosystem</span>
            </div>
            <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Explore Top Categories
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Select a category to browse specialized verified subscriptions
            </p>
          </div>
          <Link
            to="/products"
            className="text-[13px] sm:text-[14px] font-bold text-[#5B4BFF] hover:text-[#4F3FE8] transition-colors flex items-center gap-1.5 shrink-0 group"
          >
            <span>View all categories</span>
            <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <CategoryFilter selected="" onSelect={handleCategorySelect} variant="cards" />
      </section>

      {/* All Products Showcase with Pagination */}
      <section ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0F172A] tracking-[-0.03em] flex items-center gap-2">
              All Subscriptions & Products <HiSparkles className="text-[#A855F7] w-6 h-6" />
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Discover, compare and subscribe to all available premium digital subscriptions
            </p>
          </div>
          {productsData?.pagination?.total > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#5B4BFF]/20 text-[#5B4BFF] shadow-xs px-4 py-1.5 rounded-full text-xs font-extrabold self-start sm:self-auto">
              <HiCollection className="w-4 h-4" />
              <span>{productsData.pagination.total} Available Subscriptions</span>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 min-h-[300px]">
            <Spinner size="lg" />
          </div>
        ) : productsData?.data?.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData.data.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData?.pagination?.pages > 1 && (
              <div className="mt-14 flex flex-col items-center border-t border-slate-200/80 pt-8">
                <Pagination
                  currentPage={productsData.pagination.page}
                  totalPages={productsData.pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mt-4 p-8">
            <div className="h-16 w-16 bg-[#EEF2FF] rounded-[20px] flex items-center justify-center mx-auto mb-5 text-[#5B4BFF]">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-2">No products available yet</h3>
            <p className="text-[#64748B] text-[15px] mb-6 max-w-md mx-auto">
              Be the first one to start selling premium digital subscriptions on our platform.
            </p>
            <Link to="/register">
              <Button size="lg" className="shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Become a Seller</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Value Propositions / Trust Signals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[18px] bg-indigo-50 border border-indigo-100 text-[#5B4BFF] flex items-center justify-center flex-shrink-0 shadow-xs">
                <HiLockClosed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">100% Secure Payments</h4>
                <p className="text-[12px] text-[#64748B] leading-snug">Bank-grade encryption and escrow protection.</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[18px] bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0 shadow-xs">
                <HiUsers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">
                  <CountUp to={rawUserCount} duration={2} suffix="+" /> Trusted Users
                </h4>
                <p className="text-[12px] text-[#64748B] leading-snug">Empowering verified buyers & sellers worldwide.</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[18px] bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                <HiLightningBolt className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">Instant Delivery</h4>
                <p className="text-[12px] text-[#64748B] leading-snug">Automated credential access immediately after checkout.</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-[18px] bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <HiSupport className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">24/7 Dedicated Support</h4>
                <p className="text-[12px] text-[#64748B] leading-snug">Direct ticket resolution & seller dispute guarantee.</p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative bg-white border border-slate-200/90 rounded-[32px] p-8 md:p-14 overflow-hidden shadow-[0_20px_50px_rgba(91,75,255,0.08)]">
          {/* Subtle Background Gradient */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#F3F1FF] via-[#EDE9FE]/40 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="hidden sm:block relative w-32 h-32 flex-shrink-0">
                <motion.div 
                   animate={{ y: [-6, 6, -6], rotate: [-8, -4, -8] }}
                   transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] rounded-[24px] flex items-center justify-center text-white text-5xl shadow-[0_12px_32px_rgba(91,75,255,0.35)]"
                >
                  <HiPaperAirplane className="w-12 h-12 text-white transform -rotate-45" />
                </motion.div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#A855F7] rounded-full blur-[24px] opacity-50" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5B4BFF] uppercase tracking-wider mb-2">
                  <HiSparkles className="w-3.5 h-3.5" />
                  <span>Stay Informed</span>
                </div>
                <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#0F172A] mb-2 tracking-tight">
                  Stay ahead with exclusive deals
                </h3>
                <p className="text-[#64748B] text-[15px] sm:text-[16px] max-w-md">
                  Subscribe to receive drop alerts, subscriber bundles, and exclusive promo codes.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex-1 max-w-md">
              <form 
                onSubmit={(e) => { e.preventDefault(); }} 
                className="flex flex-col sm:flex-row bg-[#F8FAFC] p-1.5 rounded-[20px] border border-slate-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:ring-[3px] focus-within:ring-[#5B4BFF]/15 focus-within:border-[#5B4BFF] transition-all gap-2 sm:gap-0"
              >
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-transparent border-none px-4 sm:px-5 py-3 sm:py-0 text-[15px] text-[#0F172A] placeholder-[#94A3B8] focus:ring-0 outline-none"
                  required
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto px-8 rounded-[16px] shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex items-center justify-center gap-2 flex-shrink-0">
                  <span>Subscribe</span>
                  <HiPaperAirplane className="w-4 h-4 rotate-90" />
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
