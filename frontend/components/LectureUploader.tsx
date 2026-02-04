"use client";

import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { Upload, FileAudio, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LectureUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag & Drop Logic
  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setError(null);
    setResult(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a"] },
    multiple: false,
  });

  // Upload Logic
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10); // Start progress
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Send file to Python Backend
      // Note: We use 127.0.0.1 explicitly to match the FastAPI setup
      const response = await axios.post("http://127.0.0.1:8000/process-lecture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          // We cap upload progress at 90% so the user knows "Processing" is still happening
          setProgress(Math.min(percentCompleted, 90)); 
        },
      });
      console.log("Backend Response: ", response.data)

      setProgress(100);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to upload lecture. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Smart Lecture Clipper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 1. DROP ZONE */}
          {!result && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-gray-400" />
                {file ? (
                  <p className="text-lg font-medium text-green-600 flex items-center gap-2">
                    <FileAudio /> {file.name}
                  </p>
                ) : (
                  <p className="text-gray-500">
                    Drag & drop a lecture file here, or click to select
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 2. UPLOAD BUTTON & PROGRESS */}
          {file && !result && (
            <div className="space-y-4">
              {uploading && <Progress value={progress} className="w-full" />}
              
              <Button 
                onClick={handleUpload} 
                className="w-full" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Audio (This may take a minute)...
                  </>
                ) : (
                  "Generate Study Notes"
                )}
              </Button>
            </div>
          )}

          {/* 3. ERROR MESSAGE */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* 4. RESULTS DISPLAY */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg mb-4">
                <CheckCircle /> Processing Complete
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">AI Generated Notes:</h3>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-white whitespace-pre-wrap">
                  {result.notes}
                </ScrollArea>
              </div>

              <div className="text-xs text-gray-400 text-center">
                Filename: {result.filename} | Status: {result.status}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {setFile(null); setResult(null);}}
              >
                Upload Another Lecture
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}