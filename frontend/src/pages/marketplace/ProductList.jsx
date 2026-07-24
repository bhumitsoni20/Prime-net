import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/cards/ProductCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useProducts } from '../../hooks/useProducts';
import { HiSearch, HiCheck } from 'react-icons/hi';

const allCategories = [
  { value: 'ai-tools', label: 'AI & Machine Learning' },
  { value: 'software', label: 'Creative Tools' },
  { value: 'ott', label: 'Productivity' },
  { value: 'education', label: 'Developer Tools' },
  { value: 'cloud-storage', label: 'Data & Analytics' },
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCats, setSelectedCats] = useState(category ? [category] : []);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [ratingFilter, setRatingFilter] = useState(0);

  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', '20');
  if (selectedCats.length > 0) params.set('category', selectedCats.join(','));
  if (search) params.set('search', search);
  if (priceRange[1] < 2000) params.set('maxPrice', priceRange[1].toString());
  if (ratingFilter > 0) params.set('minRating', ratingFilter.toString());

  const { data, isLoading } = useProducts(params.toString());

  const toggleCategory = (cat) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setPriceRange([0, 2000]);
    setRatingFilter(0);
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-4 pl-1">Filters</h3>

            {/* Categories */}
            <div className="mb-6 bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-4">Categories</h4>
              <div className="space-y-3.5">
                {allCategories.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-3 text-[14px] text-[#64748B] cursor-pointer hover:text-[#0F172A] group transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[6px] border border-[#CBD5E1] checked:border-[#5B4BFF] checked:bg-[#5B4BFF] transition-all hover:border-[#94A3B8]"
                      />
                      <span className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                        <HiCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className={`transition-all ${selectedCats.includes(cat.value) ? 'font-semibold text-[#0F172A]' : 'group-hover:font-medium'}`}>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6 bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-4 flex justify-between items-center">
                Max Price <span className="text-[#5B4BFF] font-mono bg-[#EEF2FF] px-2 py-1 rounded-[8px] text-xs">₹{priceRange[1]}</span>
              </h4>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#5B4BFF]"
              />
              <div className="flex justify-between text-[11px] text-[#94A3B8] mt-3 font-semibold">
                <span>₹0</span>
                <span>₹2000+</span>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6 bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-4">Minimum Rating</h4>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((r) => (
                  <button 
                    key={r} 
                    onClick={() => { setRatingFilter(r); setPage(1); }} 
                    className={`flex items-center justify-between w-full text-left text-sm p-2 rounded-[10px] transition-all ${ratingFilter === r ? 'bg-[#5B4BFF]/[0.06] border border-[#5B4BFF]/20' : 'hover:bg-[#F8FAFC] border border-transparent'}`}
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg leading-none ${i < r ? 'text-amber-400 drop-shadow-sm' : 'text-[#E2E8F0]'}`}>★</span>
                      ))}
                    </div>
                    <span className={`text-[12px] font-semibold ${ratingFilter === r ? 'text-[#5B4BFF]' : 'text-[#94A3B8]'}`}>
                      {r === 5 ? '5.0' : `${r}.0 & up`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Explore Marketplace</h1>
            <p className="text-[#64748B] text-[15px]">Discover premium digital subscriptions and accelerate your workflow.</p>
          </div>

          {/* Search */}
          <div className="relative mb-8 group">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#94A3B8] group-focus-within:text-[#5B4BFF] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full bg-white border border-[#E2E8F0] rounded-[16px] pl-11 pr-4 py-3.5 text-[#0F172A] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] hover:border-[#CBD5E1] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-[24px]">
                  <div className="h-16 w-16 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center mx-auto mb-4 border border-[#F1F5F9]">
                    <HiSearch className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <p className="text-[#0F172A] text-lg font-bold mb-2">No products found</p>
                  <p className="text-[#64748B] text-sm">Try adjusting your filters or search query.</p>
                  <Button variant="secondary" className="mt-6" onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}

              {data?.pagination && data.pagination.total > 0 && (
                <div className="mt-12 flex flex-col items-center border-t border-[#E2E8F0] pt-8">
                  <p className="text-[13px] text-[#64748B] font-medium mb-4">
                    Showing <span className="text-[#0F172A] font-semibold">1-{data.data?.length || 0}</span> of <span className="text-[#0F172A] font-semibold">{data.pagination.total || 0}</span> products
                  </p>
                  <Pagination currentPage={data.pagination.page} totalPages={data.pagination.pages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
