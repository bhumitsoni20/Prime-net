import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 1;
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center h-9 w-9 rounded-[10px] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <HiChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="flex items-center justify-center h-9 w-6 text-[#94A3B8] text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center h-9 min-w-[36px] rounded-[10px] text-sm font-semibold transition-all duration-200 ${
              page === currentPage
                ? 'bg-[#5B4BFF] text-white shadow-[0_2px_8px_rgba(91,75,255,0.3)]'
                : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center h-9 w-9 rounded-[10px] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <HiChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
