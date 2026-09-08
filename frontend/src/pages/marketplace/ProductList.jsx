import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiSearch, 
  HiCheck, 
  HiX, 
  HiSparkles, 
  HiFilm, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiAcademicCap, 
  HiCloud, 
  HiMusicNote, 
  HiCog, 
  HiPuzzle, 
  HiCollection, 
  HiStar, 
  HiFilter,
  HiArrowRight,
  HiRefresh
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/cards/ProductCard';
import BundleCard from '../../components/cards/BundleCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useProducts } from '../../hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getPublicStats } from '../../services/public.service';
import { DotGridBackground, ShinyText } from '../../components/reactbits';

const allCategories = [
  { value: 'bundles', label: 'Bundles & Deals', icon: HiCollection, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'ott', label: 'OTT Platforms', icon: HiFilm, color: 'text-[#5B4BFF]', bg: 'bg-indigo-50' },
  { value: 'gaming', label: 'Games & Accounts', icon: HiPuzzle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: 'ai-tools', label: 'AI & Productivity', icon: HiLightningBolt, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'vpn', label: 'VPN & Security', icon: HiShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { value: 'education', label: 'Education & Learning', icon: HiAcademicCap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'cloud-storage', label: 'Cloud & Storage', icon: HiCloud, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'music', label: 'Music & Audio', icon: HiMusicNote, color: 'text-pink-600', bg: 'bg-pink-50' },
  { value: 'software', label: 'Software & Tools', icon: HiCog, color: 'text-violet-600', bg: 'bg-violet-50' },
];

const pricePresets = [
  { label: 'All', value: 2000 },
  { label: '< ₹300', value: 300 },
  { label: '< ₹600', value: 600 },
  { label: '< ₹1200', value: 1200 },
];

const ProductList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const duration = searchParams.get('duration') || '';
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [selectedCats, setSelectedCats] = useState(category ? category.split(',') : []);
  const [selectedDurations, setSelectedDurations] = useState(duration ? duration.split(',') : []);
  const [priceRange, setPriceRange] = useState([0, parseInt(searchParams.get('maxPrice')) || 2000]);
  const [ratingFilter, setRatingFilter] = useState(parseInt(searchParams.get('minRating')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt_desc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Category Counts
  const { data: statsData } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const res = await getPublicStats();
      return res.data;
    }
  });
  const categoryCounts = statsData?.categories || {};

  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', '18');
  if (selectedCats.length > 0) params.set('category', selectedCats.join(','));
  if (selectedDurations.length > 0) params.set('duration', selectedDurations.join(','));
  if (search) params.set('search', search);
  if (priceRange[1] < 2000) params.set('maxPrice', priceRange[1].toString());
  if (ratingFilter > 0) params.set('minRating', ratingFilter.toString());
  if (sortBy) params.set('sort', sortBy);

  const isBundleOnly = selectedCats.length === 1 && selectedCats[0] === 'bundles';
  const showBundles = selectedCats.length === 0 || selectedCats.includes('bundles');
  const showProducts = selectedCats.length === 0 || selectedCats.some(c => c !== 'bundles');

  // Fetch Products
  const { data: productData, isLoading: isProductsLoading } = useProducts(
    showProducts ? params.toString() : null
  );

  // Fetch Bundles
  const bundleParams = new URLSearchParams(params);
  if (selectedCats.includes('bundles')) bundleParams.delete('category');
  
  const { data: bundleData, isLoading: isBundlesLoading } = useQuery({
    queryKey: ['publicBundles', bundleParams.toString()],
    queryFn: async () => {
      const res = await api.get(`/bundles?${bundleParams.toString()}`);
      return res;
    },
    enabled: showBundles
  });

  const isLoading = (showProducts && isProductsLoading) || (showBundles && isBundlesLoading);

  const updateURLParams = (updates) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'maxPrice' && value >= 2000) || (key === 'minRating' && value <= 0)) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });
    setSearchParams(currentParams, { replace: true });
  };

  const toggleCategory = (cat) => {
    const newCats = selectedCats.includes(cat) 
      ? selectedCats.filter(c => c !== cat) 
      : [...selectedCats, cat];
      
    setSelectedCats(newCats);
    setPage(1);
    updateURLParams({ category: newCats.length > 0 ? newCats.join(',') : null, page: 1 });
  };

  const toggleDuration = (dur) => {
    const newDurations = selectedDurations.includes(dur) 
      ? selectedDurations.filter(d => d !== dur) 
      : [...selectedDurations, dur];
      
    setSelectedDurations(newDurations);
    setPage(1);
    updateURLParams({ duration: newDurations.length > 0 ? newDurations.join(',') : null, page: 1 });
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    updateURLParams({ search: val, page: 1 });
  };

  const handlePriceChange = (val) => {
    setPriceRange([0, val]);
    updateURLParams({ maxPrice: val });
  };

  const handleRatingChange = (r) => {
    const newRating = ratingFilter === r ? 0 : r;
    setRatingFilter(newRating);
    setPage(1);
    updateURLParams({ minRating: newRating, page: 1 });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    setPage(1);
    updateURLParams({ sort: val, page: 1 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    updateURLParams({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setSelectedDurations([]);
    setPriceRange([0, 2000]);
    setRatingFilter(0);
    setSearch('');
    setSortBy('createdAt_desc');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = selectedCats.length + selectedDurations.length + (priceRange[1] < 2000 ? 1 : 0) + (ratingFilter > 0 ? 1 : 0) + (search ? 1 : 0);

  const totalResults = (productData?.pagination?.total || 0) + (bundleData?.data?.length || 0);

  return (
    <div className="relative min-h-screen bg-[#FAFBFF] pt-24 pb-20">
      <DotGridBackground opacity={0.25} spacing={32} dotColor="#C7D2FE" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <div className="mb-8 bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-[0_10px_30px_rgba(91,75,255,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#5B4BFF]/10 via-[#7C3AED]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F3F1FF] text-[#5B4BFF] px-3.5 py-1.5 rounded-full text-xs font-extrabold mb-3 shadow-xs">
                <HiSparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Verified Digital Catalog</span>
              </div>
              <h1 className="text-[28px] sm:text-[36px] font-black text-[#0F172A] tracking-[-0.03em] leading-tight">
                Explore <ShinyText text="Marketplace" speed={3.5} />
              </h1>
              <p className="text-slate-500 text-sm sm:text-[15px] mt-1.5 max-w-xl">
                Browse, compare and securely purchase digital subscriptions, streaming passes, and verified accounts.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 self-start md:self-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5B4BFF]">
                <HiCollection className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available</span>
                <span className="text-[15px] font-black text-slate-900">{totalResults} Passes</span>
              </div>
            </div>
          </div>

          {/* Search & Quick Sort Bar */}
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#5B4BFF] transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products, services, platforms..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-[16px] pl-11 pr-10 py-3 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all font-medium"
              />
              {search && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <HiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-4 py-3 text-slate-800 text-sm font-bold focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all cursor-pointer"
              >
                <option value="createdAt_desc">✨ Newest First</option>
                <option value="rating">★ Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-2 bg-[#5B4BFF] text-white px-4 py-3 rounded-[16px] text-sm font-bold shadow-xs cursor-pointer"
              >
                <HiFilter className="w-4 h-4" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="relative z-10 mt-4 pt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Active Filters:</span>
              
              {selectedCats.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#5B4BFF] border border-[#C7D2FE] px-3 py-1 rounded-full text-xs font-bold">
                  {allCategories.find(c => c.value === cat)?.label || cat}
                  <button onClick={() => toggleCategory(cat)} className="hover:text-red-500 ml-0.5">
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {priceRange[1] < 2000 && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                  Max: ₹{priceRange[1]}
                  <button onClick={() => handlePriceChange(2000)} className="hover:text-red-500 ml-0.5">
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {ratingFilter > 0 && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                  {ratingFilter}★ & above
                  <button onClick={() => handleRatingChange(0)} className="hover:text-red-500 ml-0.5">
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-xs font-extrabold text-[#5B4BFF] hover:underline ml-1 cursor-pointer flex items-center gap-1"
              >
                <HiRefresh className="w-3 h-3" />
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* Layout: Filters Sidebar + Products Grid */}
        <div className="flex gap-8 items-start">
          
          {/* Desktop Filters Sidebar */}
          <aside className={`lg:block w-72 flex-shrink-0 ${mobileFilterOpen ? 'block fixed inset-0 z-50 p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto' : 'hidden'}`}>
            <div className="bg-white p-6 rounded-[24px] border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HiFilter className="w-4 h-4 text-[#5B4BFF]" />
                  <h3 className="text-[14px] font-extrabold text-[#0F172A] uppercase tracking-wider">Filters</h3>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-bold text-[#5B4BFF] hover:underline">
                    Reset
                  </button>
                )}
                {mobileFilterOpen && (
                  <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden p-1 text-slate-400">
                    <HiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1.5">
                  {allCategories.map((cat) => {
                    const isChecked = selectedCats.includes(cat.value);
                    const count = categoryCounts[cat.value] || 0;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-[#EEF2FF] text-[#5B4BFF] font-bold border border-[#C7D2FE]' 
                            : 'hover:bg-slate-50 text-slate-600 font-medium border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center text-sm shadow-2xs`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[13px]">{cat.label}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isChecked ? 'bg-[#5B4BFF] text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider">
                    Max Price
                  </h4>
                  <span className="text-[#5B4BFF] font-mono bg-[#EEF2FF] px-2.5 py-0.5 rounded-md text-xs font-bold">
                    ₹{priceRange[1]}
                  </span>
                </div>

                {/* Price Presets */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePriceChange(preset.value)}
                      className={`py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        priceRange[1] === preset.value
                          ? 'bg-[#5B4BFF] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#5B4BFF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-bold">
                  <span>₹0</span>
                  <span>₹2000+</span>
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">
                  Customer Rating
                </h4>
                <div className="space-y-1">
                  {[5, 4, 3].map((r) => (
                    <button 
                      key={r} 
                      onClick={() => handleRatingChange(r)} 
                      className={`flex items-center justify-between w-full p-2 rounded-xl transition-all cursor-pointer ${
                        ratingFilter === r 
                          ? 'bg-amber-50/80 border border-amber-200' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-base leading-none ${i < r ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                      <span className={`text-[12px] font-extrabold ${ratingFilter === r ? 'text-amber-700' : 'text-slate-400'}`}>
                        {r === 5 ? '5.0 Only' : `${r}.0 & up`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-3">
                  Duration
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {['1 month', '2 month', '3 month', '6 month', '1 year'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => toggleDuration(dur)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                        selectedDurations.includes(dur)
                          ? 'bg-[#5B4BFF] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Products Grid Section */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[28px] border border-slate-200/80">
                <Spinner size="lg" />
                <p className="text-slate-400 text-sm font-semibold mt-4">Loading verified subscriptions...</p>
              </div>
            ) : (
              <>
                {/* Bundles Section */}
                {showBundles && bundleData?.data?.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                        <span>🎁</span> Featured Subscription Bundles
                      </h2>
                      <span className="text-xs font-bold text-[#5B4BFF] bg-[#EEF2FF] px-2.5 py-1 rounded-full">
                        {bundleData.data.length} Bundles
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {bundleData.data.map((bundle) => (
                        <BundleCard key={bundle._id} bundle={bundle} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {showProducts && productData?.data?.length > 0 && (
                  <div>
                    {showBundles && bundleData?.data?.length > 0 && (
                      <div className="flex items-center justify-between mb-5 border-t border-slate-200/80 pt-8">
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                          Individual Subscriptions & Passes
                        </h2>
                        <span className="text-xs font-bold text-slate-500">
                          {productData.pagination.total} Available
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {productData.data.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State / No Results */}
                {((!showProducts || !productData?.data || productData.data.length === 0) && (!showBundles || !bundleData?.data || bundleData.data.length === 0)) && (
                  <div className="text-center py-20 px-6 bg-white border border-slate-200/90 rounded-[32px] shadow-[0_10px_30px_rgba(91,75,255,0.04)]">
                    <div className="w-20 h-20 bg-indigo-50/80 rounded-[24px] flex items-center justify-center mx-auto mb-5 text-[#5B4BFF] border border-indigo-100 shadow-xs">
                      <HiSearch className="w-9 h-9" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] mb-2 tracking-tight">
                      No matching subscriptions found
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                      We couldn't find any products matching your selected filters or search terms.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <Button 
                        variant="secondary" 
                        size="lg" 
                        onClick={clearFilters}
                        className="w-full sm:w-auto font-bold rounded-xl"
                      >
                        <HiRefresh className="w-4 h-4 mr-1.5" />
                        Clear All Filters
                      </Button>

                      <Link to="/request-product" className="w-full sm:w-auto">
                        <Button 
                          size="lg" 
                          className="w-full sm:w-auto bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] font-extrabold rounded-xl shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex items-center justify-center gap-2"
                        >
                          <HiSparkles className="w-4 h-4" />
                          <span>Request This Product</span>
                          <HiArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Quick Popular Categories */}
                    <div className="mt-12 pt-8 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                        Popular categories you might like
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {allCategories.slice(1, 5).map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => toggleCategory(cat.value)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {((showProducts && productData?.pagination?.total > 0) || (isBundleOnly && bundleData?.pagination?.total > 0)) && (
                  <div className="mt-12 flex flex-col items-center border-t border-slate-200/80 pt-8">
                    <Pagination 
                      currentPage={isBundleOnly ? bundleData.pagination.page : productData.pagination.page} 
                      totalPages={isBundleOnly ? bundleData.pagination.pages : productData.pagination.pages} 
                      onPageChange={handlePageChange} 
                    />
                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

export default ProductList;
