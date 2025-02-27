import { useState, useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

export const blogTablecols = [
  {
    accessorKey: "title",
    header: "Blog Post Name",
  },
  {
    accessorKey: "date",
    header: "Date Published",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
    },
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ getValue }) => (
      <a
        href={getValue()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        View Post <FaExternalLinkAlt className="ml-2" />
      </a>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => {
      const [selectedVersion, setSelectedVersion] = useState(
        row.original.latestVersion
      );

      useEffect(() => {
        setSelectedVersion(row.original.latestVersion);
      }, [row.original.latestVersion]);

      return (
        <select
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(e.target.value)}
          className="w-full px-2 py-1 border rounded-lg"
        >
          {Array.isArray(row.original.version) ? (
            row.original.version.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))
          ) : (
            <option value={row.original.version}>{row.original.version}</option>
          )}
        </select>
      );
    },
  },
  {
    accessorKey: "publishStatus",
    header: "Publish Status",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <button
          className="px-4 py-1.5 bg-[#084464] text-white text-sm font-medium rounded-md 
                   hover:bg-[#0a5a7c] active:bg-[#063850] 
                   transition-all duration-200 ease-in-out
                   shadow-sm hover:shadow-md
                   transform hover:-translate-y-0.5"
        >
          Publish
        </button>
      </div>
    ),
  },
];