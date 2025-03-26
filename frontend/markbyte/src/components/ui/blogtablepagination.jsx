import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

const BlogTablePagination = ({ table }) => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (table.getCanPreviousPage()) {
                return table.previousPage();
              }
            }}
            className={`cursor-pointer ${
              !table.getCanPreviousPage() ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
        </PaginationItem>
        {Array.from({ length: table.getPageCount() }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => table.setPageIndex(i)}
              isActive={table.getState().pagination.pageIndex === i}
              className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                table.getState().pagination.pageIndex === i
                  ? "bg-[#003b5c] text-white font-medium shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (table.getCanNextPage()) {
                return table.nextPage();
              }
            }}
            className={`cursor-pointer ${
              !table.getCanNextPage() ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default BlogTablePagination;
