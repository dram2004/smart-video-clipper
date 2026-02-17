"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Book } from "lucide-react";

interface Lecture {
  id: number;
  filename: string;
  upload_date: string;
  summary: string; // <--- Added this so we can pass notes to the PDF generator
}

export default function LectureList() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/lectures");
      setLectures(res.data);
    } catch (err) {
      console.error("Failed to fetch lectures", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to Open PDF in New Tab (Fixes 405 Error)
  const handleViewPDF = async (filename: string, notes: string) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-pdf",
        { filename, notes },
        { 
          responseType: "blob",
          params: { disposition: "inline" }
        }
      );
      // Create a Blob from the PDF Stream
      const file = new Blob([response.data], { type: "application/pdf" });
      // Build a URL for the browser to open
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing PDF", error);
    }
  };

  const handleDownloadPDF = async (filename: string, notes: string) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-pdf",
        { filename, notes },
        { 
          responseType: "blob",
          params: { disposition: "attachment" }
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}_notes.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
    }
  };

  return (
    <Card className="border-t-4 border-t-[#500000] shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Book className="w-5 h-5 text-[#500000]" />
          Your Notebook
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#500000]" />
          </div>
        ) : lectures.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No lectures saved yet.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-slate-50 border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-[#500000] text-sm truncate" title={lecture.filename}>
                      {lecture.filename}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(lecture.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Fixed Layout: Buttons will now share space properly */}
                <div className="flex items-center gap-2 mt-3 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9 border-[#500000] text-[#500000] hover:bg-red-50"
                    onClick={() => handleViewPDF(lecture.filename, lecture.summary)}
                  >
                    <FileText className="w-3 h-3 mr-1" /> View Notes
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 text-gray-400 hover:text-[#500000] border border-transparent hover:border-gray-200"
                    onClick={() => handleDownloadPDF(lecture.filename, lecture.summary)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}