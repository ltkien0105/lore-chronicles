/**
 * Search component for finding champions in the graph
 * Provides autocomplete suggestions and quick navigation
 */

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import type { GraphNode } from "@/server/relationships";

interface GraphSearchProps {
  nodes: GraphNode[];
  onSearch: (query: string) => void;
  onSelectNode: (nodeId: number) => void;
}

export function GraphSearch({ nodes, onSearch, onSelectNode }: GraphSearchProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, onSearch]);

  // Filter nodes for autocomplete
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return nodes
      .filter((node) => node.name.toLowerCase().includes(lowerQuery))
      .slice(0, 8); // Limit to 8 results
  }, [query, nodes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  const handleSelectResult = (node: GraphNode) => {
    setQuery(node.name);
    setShowResults(false);
    onSelectNode(node.id);
  };

  const handleBlur = () => {
    // Delay to allow click on results
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          onBlur={handleBlur}
          placeholder="Search champions..."
          className="w-full rounded-md border border-stone-700 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-100 placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Autocomplete results */}
      {showResults && searchResults.length > 0 && (
        <ul className="absolute top-full z-50 mt-1 w-full rounded-md border border-stone-700 bg-stone-900 shadow-lg">
          {searchResults.map((node) => (
            <li key={node.id}>
              <button
                onClick={() => handleSelectResult(node)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-800 hover:text-primary"
              >
                {node.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
