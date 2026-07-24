import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/cards/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useProducts } from '../../hooks/useProducts';
import { HiSearch } from 'react-icons/hi';

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const params = `page=${page}&limit=12&search=${encodeURIComponent(search)}`;
  const { data, isLoading } = useProducts(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Search Results</h1>
      <SearchBar onSearch={(q) => { setSearch(q); setPage(1); }} className="max-w-2xl mb-8" />
      {search ? (
        <>
          <p className="text-[#64748B] text-[15px] mb-8">Results for <span className="text-[#0F172A] font-bold">"{search}"</span></p>
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.data?.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-[24px]">
                  <div className="h-16 w-16 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center mx-auto mb-4 border border-[#F1F5F9]">
                    <HiSearch className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <p className="text-[#0F172A] text-lg font-bold mb-2">No results found</p>
                  <p className="text-[#64748B] text-sm">We couldn't find anything for "{search}".</p>
                </div>
              )}
              {data?.pagination && data.pagination.total > 0 && (
                <div className="mt-12 flex flex-col items-center border-t border-[#E2E8F0] pt-8">
                  <p className="text-[13px] text-[#64748B] font-medium mb-4">
                    Showing <span className="text-[#0F172A] font-semibold">1-{data.data?.length || 0}</span> of <span className="text-[#0F172A] font-semibold">{data.pagination.total || 0}</span> results
                  </p>
                  <Pagination currentPage={data.pagination.page} totalPages={data.pagination.pages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#5B4BFF]/20 rounded-full blur-[20px] animate-pulse" />
            <div className="relative h-20 w-20 bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] mx-auto">
              <HiSearch className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-[24px] font-bold text-[#0F172A] mb-3 tracking-[-0.02em]">Start your search</h2>
          <p className="text-[#64748B] text-[15px] max-w-sm mx-auto leading-relaxed">Enter a keyword above to find exactly what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
