import LectureUploader from "@/components/LectureUploader";
import LectureList from "@/components/LectureList";
import LectureSearch from "@/components/LectureSearch";
import HomeworkUploader from "@/components/HomeworkUploader"; // <--- Import it

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-5xl font-extrabold text-[#500000] tracking-tight">
            Smart Video Clipper
          </h1>
          <p className="text-slate-500 text-lg">
            AI-Powered Lecture Assistant & Exam Prep
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Manage Lectures */}
          <div className="space-y-6">
            <LectureUploader />
            <LectureList />
          </div>

          {/* Column 2: Search & Study */}
          <div className="space-y-6">
            <LectureSearch />
            {/* Future: ChatBot or Summary Card */}
          </div>

          {/* Column 3: Active Learning (NEW) */}
          <div className="space-y-6">
            <HomeworkUploader />
          </div>

        </div>
      </div>
    </main>
  );
}