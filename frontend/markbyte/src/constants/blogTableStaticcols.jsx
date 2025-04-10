import { ExternalLink } from "lucide-react";

export const blogTableStaticCols = [
  {
    accessorKey: "title",
    header: "Post Name",
  },
  {
    accessorKey: "date",
    header: "Date Published",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        View Post <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    ),
  },
];
