import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../../components/common/HeroSection';
import CategoryFilter from '../../components/common/CategoryFilter';
import ProductCard from '../../components/cards/ProductCard';
import Pagination from '../../components/ui/Pagination';
import { useProducts } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { HiSparkles, HiLockClosed, HiUsers, HiLightningBolt, HiSupport, HiPaperAirplane, HiCollection } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';

const Home = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const productSectionRef = useRef(null);

  // Fetch paginated products directly for the home page showcase
  const { data: productsData, isLoading } = useProducts(`page=${page}&limit=12&sort=rating`);

  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
  });

  const userCountText = stats?.totalUsers !== undefined
    ? `${stats.totalUsers.toLocaleString()}+` 
    : '4+';

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
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Explore Top Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
              Explore Top Categories
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Select a category to browse specialized subscriptions
            </p>
          </div>
          <Link
            to="/products"
            className="text-[13px] sm:text-[14px] font-bold text-[#5B4BFF] hover:text-[#4F3FE8] transition-colors flex items-center gap-1 shrink-0"
          >
            View all categories <span className="text-[16px]">&rarr;</span>
          </Link>
        </div>
        <CategoryFilter selected="" onSelect={handleCategorySelect} variant="cards" />
      </section>

      {/* All Products Showcase with Pagination */}
      <section ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] flex items-center gap-2">
              All Subscriptions & Products <HiSparkles className="text-[#A855F7] w-6 h-6" />
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Discover, compare and subscribe to all available premium digital subscriptions
            </p>
          </div>
          {productsData?.pagination?.total > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-[#F3F1FF] text-[#5B4BFF] px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto">
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
              <div className="mt-14 flex flex-col items-center border-t border-[#E2E8F0] pt-8">
                <Pagination
                  currentPage={productsData.pagination.page}
                  totalPages={productsData.pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] mt-4">
            <div className="h-16 w-16 bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">No products available yet</h3>
            <p className="text-[#64748B] text-[15px] mb-6 max-w-md mx-auto">
              Be the first one to start selling premium digital subscriptions on our platform.
            </p>
            <Link to="/register">
              <Button size="lg">Become a Seller</Button>
            </Link>
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
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">Trusted by {userCountText} Users</h4>
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
              <HiSupport className="w-6 h-6" />
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
                <motion.div 
                   animate={{ y: [-5, 5, -5] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-[#5B4BFF] rounded-xl flex items-center justify-center text-white text-5xl shadow-[0_10px_30px_rgba(91,75,255,0.3)] rotate-[-10deg]"
                >
                  <svg className="w-16 h-16 opacity-50 absolute top-2 right-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
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
              <form 
                onSubmit={(e) => { e.preventDefault(); }} 
                className="flex flex-col sm:flex-row bg-[#F8FAFC] p-1.5 rounded-[16px] border border-[#E2E8F0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:ring-[3px] focus-within:ring-[#5B4BFF]/10 focus-within:border-[#5B4BFF] transition-all gap-2 sm:gap-0"
              >
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-transparent border-none px-4 sm:px-5 py-3 sm:py-0 text-[15px] text-[#0F172A] placeholder-[#94A3B8] focus:ring-0 outline-none"
                  required
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto px-8 rounded-[12px] shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex items-center justify-center gap-2 flex-shrink-0">
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
