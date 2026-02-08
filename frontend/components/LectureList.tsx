"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, Loader2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LectureList() {
  const [lectures, setLectures] = useState<any[]>([]);
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

  const handleAction = async (lecture: any, action: "inline" | "attachment") => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/generate-pdf?disposition=${action}`,
        {
          filename: lecture.filename,
          notes: lecture.summary,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      if (action === 'inline') {
        // Open in new tab
        window.open(url, '_blank');
      } else {
        // Download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${lecture.filename}_notes.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  return (
    <Card className="h-full border-t-4 border-t-[#500000]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#500000]" />
          Your Notebook
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : lectures.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No lectures found.</p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="p-3 border rounded-lg hover:bg-slate-50 transition-colors group relative"
                >
                  <div className="font-medium text-[#500000] truncate pr-16">
                    {lecture.filename}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(lecture.upload_date).toLocaleDateString()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs flex items-center gap-1"
                        onClick={() => handleAction(lecture, 'inline')}
                    >
                        <Eye className="w-3 h-3" /> View Notes
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs flex items-center gap-1 text-gray-400 hover:text-gray-700"
                        onClick={() => handleAction(lecture, 'attachment')}
                    >
                        <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}