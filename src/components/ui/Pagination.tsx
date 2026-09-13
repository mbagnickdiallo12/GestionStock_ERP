"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemName = "éléments"
}) => {
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
      {/* Items count summary */}
      <div className="flex items-center gap-2 font-medium">
        <span>
          Affichage de <strong className="text-white font-bold">{startIdx}</strong> à{" "}
          <strong className="text-white font-bold">{endIdx}</strong> sur{" "}
          <strong className="text-emerald-400 font-black">{totalItems}</strong> {itemName}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-white/10">
            <span>Par page :</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-[#0f172a] border border-white/15 text-white font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Page navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            currentPage === 1
              ? "border-white/5 text-slate-600 cursor-not-allowed bg-transparent"
              : "border-white/15 text-slate-300 hover:text-white hover:bg-white/10 bg-[#0f172a]"
          }`}
          title="Première page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            currentPage === 1
              ? "border-white/5 text-slate-600 cursor-not-allowed bg-transparent"
              : "border-white/15 text-slate-300 hover:text-white hover:bg-white/10 bg-[#0f172a]"
          }`}
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered page buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500 font-bold">
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500/50"
                    : "bg-[#0f172a] border border-white/15 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            currentPage === totalPages || totalPages === 0
              ? "border-white/5 text-slate-600 cursor-not-allowed bg-transparent"
              : "border-white/15 text-slate-300 hover:text-white hover:bg-white/10 bg-[#0f172a]"
          }`}
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            currentPage === totalPages || totalPages === 0
              ? "border-white/5 text-slate-600 cursor-not-allowed bg-transparent"
              : "border-white/15 text-slate-300 hover:text-white hover:bg-white/10 bg-[#0f172a]"
          }`}
          title="Dernière page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
