import { flexRender } from "@tanstack/react-table";
import { Search, Notebook, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import BlogTablePagination from "@/components/ui/blogtablepagination";
import { motion } from "framer-motion";

const BlogPostTable = ({ data, table, searchTerm, setSearchTerm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow-xl rounded-2xl p-6 mx-4 sm:mx-8 mt-8 h-auto w-auto overflow-hidden mb-12 hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#003b5c] inline-flex items-center gap-2 whitespace-nowrap">
            <Notebook className="h-6 w-6" />
            My Blog Posts
            <span className="text-sm bg-[#003b5c] text-white px-3 py-1 rounded-full ml-1 font-medium">
              {data.length}
            </span>
          </h1>

          <div className="relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute top-2.5 left-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#003b5c] focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <X
                className="h-4 w-4 absolute right-3 top-2.5 text-red-500 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center mt-6">
          <BlogTablePagination table={table} />
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPostTable;
