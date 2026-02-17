"use client";

import React, { useState } from "react";
import axios from "axios";
import Latex from "react-latex-next"; // <--- The library for rendering math
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, BookOpen, Video, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomeworkUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<any[]>([]);
  const [homeworkId, setHomeworkId] = useState<number | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setProblems([]); // Clear previous results
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send to Backend
      const res = await axios.post("http://127.0.0.1:8000/process-homework", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success") {
        setProblems(res.data.details);
        setHomeworkId(res.data.homework_id);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process homework. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Add these state variables at the top
  const [examLoading, setExamLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any[] | null>(null);

  const generateExam = async () => {
    if (!homeworkId) return;
    setExamLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/generate-practice-exam", {
        homework_id: homeworkId
      });
      setGeneratedExam(res.data);
    } catch (error) {
      console.error("Exam Gen Error", error);
      alert("Failed to generate exam. See console.");
    } finally {
      setExamLoading(false);
    }
  };

  const downloadPDF = async (includeSolutions: boolean) => {
    if (!generatedExam) return;
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/download-exam-pdf",
        {
          title: file?.name || "Homework",
          problems: generatedExam,
          include_solutions: includeSolutions
        },
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Practice_Exam_${includeSolutions ? "KEY" : "Student"}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="h-full border-t-4 border-t-[#500000] shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <BookOpen className="h-5 w-5 text-[#500000]" />
          Upload Homework / Exam
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* File Input Section */}
        <div className="flex gap-2 items-center">
          <Input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer file:text-[#500000] file:font-semibold"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="bg-[#500000] hover:bg-[#300000] min-w-[50px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          </Button>
        </div>

        {/* Results Section */}
        {problems.length > 0 && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 font-semibold">Success!</AlertTitle>
              <AlertDescription className="text-green-700 text-xs">
                Extracted {problems.length} problems and linked them to your lectures.
              </AlertDescription>
            </Alert>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
              {problems.map((p, i) => (
                <div key={i} className="p-4 border rounded-lg bg-slate-50 hover:shadow-md transition-all duration-200 group">
                  
                  {/* The Extracted Problem (Rendered with LaTeX) */}
                  <div className="text-sm text-gray-800 mb-3 bg-white p-3 rounded border border-gray-100 shadow-sm">
                    <Latex>{p.problem}</Latex>
                  </div>
                  
                  {/* The RAG Link */}
                  {p.linked_lecture ? (
                    <div className="flex items-center justify-between text-xs bg-red-50 text-[#500000] p-2 rounded border border-red-100">
                      <div className="flex items-center gap-2">
                        <Video className="w-3 h-3" />
                        <span className="font-semibold truncate max-w-[150px]">{p.linked_lecture}</span>
                      </div>
                      <span className="bg-white px-2 py-0.5 rounded text-gray-500 border border-red-100">
                         Timestamp: {formatTime(p.linked_lecture_timestamp || 0)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic pl-1">
                      No matching lecture found.
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Generate Exam Button (For Phase 3) */}
            <div className="pt-6 border-t border-gray-100">
              {!generatedExam ? (
                /* STATE A: No exam yet */
                <Button 
                  onClick={generateExam} 
                  disabled={examLoading}
                  className="w-full h-12 text-sm font-medium bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-md transition-all"
                >
                  {examLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Vectors & Designing Exam...
                    </>
                  ) : (
                    <>
                      Generate Practice Exam <ArrowRight className="w-4 h-4 ml-2"/>
                    </>
                  )}
                </Button>
              ) : (
                /* STATE B: Exam Ready (Downloads + Regenerate) */
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600"/> 
                          Practice Exam Ready
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Generated {generatedExam.length} questions based on your specific homework.
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={generateExam} // clicking this runs the logic again
                        disabled={examLoading}
                        className="text-xs text-slate-400 hover:text-slate-700 h-8"
                      >
                         {examLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : "Regenerate"}
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => downloadPDF(false)} 
                        variant="outline" 
                        className="flex-1 bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-500"/>
                        Student Copy
                      </Button>
                      <Button 
                        onClick={() => downloadPDF(true)} 
                        className="flex-1 bg-[#500000] hover:bg-[#300000] text-white shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2"/>
                        Solution Key
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}