// frontend/app/page.tsx
import LectureUploader from "@/components/LectureUploader";
import LectureList from "@/components/LectureList";
import LectureSearch from "@/components/LectureSearch"; // <--- IMPORT THIS

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#500000] text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Texas A&M Note Taker
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Department of Computer Engineering 
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Search & History (Takes 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
             <LectureSearch /> {/* <--- ADD SEARCH BAR HERE */}
             <LectureList />
          </div>

          {/* RIGHT COLUMN: Uploader (Takes 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <LectureUploader />
          </div>
        </div>
      </div>
    </main>
  );
}