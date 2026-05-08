"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search courses..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const clear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative flex items-center w-full max-w-lg">
      <Search className="absolute left-3 w-5 h-5 text-foreground/40 pointer-events-none" />
      <input
        id="course-search"
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
      />
      {query && (
        <button
          onClick={clear}
          className="absolute right-3 text-foreground/40 hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
