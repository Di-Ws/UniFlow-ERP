import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  totalItems: number;
  totalPages: number;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage, setCurrentPage,
  itemsPerPage, setItemsPerPage,
  totalItems, totalPages,
  loading = false
}) => {
  if (loading || totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> results
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                currentPage === page 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
        <span>Show</span>
        <select 
          value={itemsPerPage} 
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  );
};

export default Pagination;
