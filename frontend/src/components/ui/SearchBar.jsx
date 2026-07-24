import { useState } from 'react';
import { HiSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) onSearch(query);
      else navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`relative flex items-center bg-white border rounded-[14px] transition-all duration-300 ${isFocused ? 'border-[#5B4BFF] ring-[3px] ring-[#5B4BFF]/10 shadow-[0_4px_14px_rgba(91,75,255,0.08)]' : 'border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#CBD5E1]'}`}>
        <div className="pl-4 flex items-center">
          <HiSearch className={`w-[18px] h-[18px] transition-colors duration-200 ${isFocused ? 'text-[#5B4BFF]' : 'text-[#94A3B8]'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search subscriptions, services..."
          className="flex-1 px-3 py-3 bg-transparent text-[#0F172A] text-sm placeholder-[#94A3B8] outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mr-2 p-1 rounded-full text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <button
          type="submit"
          className="mr-1.5 px-4 py-1.5 bg-[#5B4BFF] text-white text-sm font-semibold rounded-[10px] hover:bg-[#4F3FE8] transition-colors shadow-[0_1px_2px_rgba(91,75,255,0.3)]"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
