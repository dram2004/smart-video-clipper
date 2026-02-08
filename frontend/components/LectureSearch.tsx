"use client";

import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlayCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LectureSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(true);
    setResults([]); 
    setExpandedIndex(null);

    try {
      // Note: We use 127.0.0.1 to match your backend
      const res = await axios.get(`http://127.0.0.1:8000/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-t-4 border-t-[#500000] shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <Search className="w-5 h-5 text-[#500000]" /> 
          Search Your Notebook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input 
            placeholder="e.g., 'What is a primitive root?'" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="focus-visible:ring-[#500000]"
          />
          <Button 
            type="submit" 
            disabled={searching} 
            className="bg-[#500000] hover:bg-[#300000] text-white min-w-[80px]"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
          </Button>
        </form>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {results.length > 0 ? (
            results.map((r, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <div 
                  key={i} 
                  className={`p-3 rounded border transition-all duration-200 ${
                    isExpanded 
                      ? "bg-white border-[#500000] shadow-md ring-1 ring-[#500000]" 
                      : "bg-slate-50 border-gray-100 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between font-semibold text-[#500000] mb-2">
                    <span className="truncate pr-2">{r.filename}</span>
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border text-xs text-gray-600 whitespace-nowrap">
                      <PlayCircle className="w-3 h-3" /> {formatTime(r.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-sm">
                      <p className={isExpanded ? "" : "line-clamp-2"}>
                          "...{r.text}..."
                      </p>
                      
                      {/* Toggle Button */}
                      {r.text.length > 50 && (
                        <button 
                            onClick={() => setExpandedIndex(isExpanded ? null : i)}
                            className="text-[#500000] text-xs font-bold mt-2 flex items-center hover:underline"
                        >
                            {isExpanded ? (
                                <><ChevronUp className="w-3 h-3 mr-1"/> Show Less</>
                            ) : (
                                <><ChevronDown className="w-3 h-3 mr-1"/> Show More</>
                            )}
                        </button>
                      )}
                  </div>
                </div>
              );
            })
          ) : (
            hasSearched && !searching && (
              <p className="text-gray-400 text-sm text-center py-4">
                No matching topics found.
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}