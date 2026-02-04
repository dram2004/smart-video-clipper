import LectureUploader from "@/components/LectureUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
          Texas A&M Note Taker
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Upload your lecture recordings and get instant study guides.
        </p>
        
        {/* Render our custom component */}
        <LectureUploader />
      </div>
    </main>
  );
}