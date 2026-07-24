import { useNavigate, Link } from 'react-router-dom';
import HeroSection from '../../components/common/HeroSection';
import CategoryFilter from '../../components/common/CategoryFilter';
import ProductCard from '../../components/cards/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.02em]">Browse Categories</h2>
        </div>
        <CategoryFilter selected="" onSelect={(cat) => navigate(`/products?category=${cat}`)} variant="cards" />
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.02em]">Trending Subscriptions</h2>
          <Link to="/products" className="text-[14px] font-semibold text-[#5B4BFF] hover:text-[#4F3FE8] transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.data?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="h-16 w-16 bg-[#EEF2FF] rounded-[16px] flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Nothing here yet</h3>
            <p className="text-[#64748B] text-[15px] mb-6 max-w-md mx-auto">Be the first one to start selling premium digital subscriptions on our platform.</p>
            <Link to="/register"><Button size="lg">Become a Seller</Button></Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
