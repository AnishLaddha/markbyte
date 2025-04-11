import { ExternalLink, Eye } from "lucide-react";

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
        className="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
      >
        View Post <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    ),
  },
];

export const analyticTableStaticCols = [
  {
    accessorKey: "title",
    header: "Post Name",
    cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
  },
  {
    accessorKey: "date",
    header: "Date Published",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      if (isNaN(date.getTime()))
        return <span className="text-muted-foreground">N/A</span>;

      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "version",
    header: "Current Version",
    cell: ({ getValue }) => (
      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#084464] text-white font-extrabold">
        {getValue()}
      </div>
    ),
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ getValue }) => (
      <div className="font-medium tabular-nums inline-flex items-center">
        {Intl.NumberFormat("en-US").format(getValue())}
        <Eye className="ml-1.5 h-3.5 w-3.5" />
      </div>
    ),
  },
  {
    accessorKey: "link",
    header: "Analytics Link",
    cell: ({ getValue }) => (
      <a
        href={getValue()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
      >
        Post Analytics <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
      </a>
    ),
  },
];
