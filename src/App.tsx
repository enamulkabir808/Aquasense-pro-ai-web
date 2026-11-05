import React, { useState, useEffect, useRef } from 'react';
import { PondRainCanvas } from './components/PondRainCanvas';
import { WaterReportDashboard } from './components/WaterReportDashboard';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ExampleImageModal } from './components/ExampleImageModal';
import {
  WaterAnalysisResult,
  SystemStatistics,
  ExampleWaterType,
  analyzeWaterImage,
  generateExampleWaterPhoto,
} from './utils/waterAnalysis';
import { Upload, Camera, FolderOpen } from 'lucide-react';

const STATS_STORAGE_KEY = 'aquasense_pro_ai_stats_v1';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<WaterAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [examplePreview, setExamplePreview] = useState<{
    dataUrl: string;
    title: string;
    fileName: string;
    caption: string;
  } | null>(null);

  // System Statistics
  const [stats, setStats] = useState<SystemStatistics>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const visitors = Math.max(1, Number(parsed.totalVisitors) || 1);
        const uploads = Math.max(0, Number(parsed.totalUploads) || 0);
        return {
          totalVisitors: visitors,
          totalUploads: uploads,
          avgUploadsPerPerson: uploads / visitors,
        };
      }
    } catch {
      // ignore storage errors
    }
    return {
      totalVisitors: 1,
      totalUploads: 0,
      avgUploadsPerPerson: 0,
    };
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const sessionVisited = sessionStorage.getItem('aquasense_visited');
      if (!sessionVisited) {
        sessionStorage.setItem('aquasense_visited', 'true');
        setStats((prev) => {
          const nextVisitors = Math.max(1, prev.totalVisitors);
          const next = {
            totalVisitors: nextVisitors,
            totalUploads: prev.totalUploads,
            avgUploadsPerPerson: prev.totalUploads / nextVisitors,
          };
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const incrementUploadStats = () => {
    setStats((prev) => {
      const nextVisitors = Math.max(1, prev.totalVisitors);
      const nextUploads = prev.totalUploads + 1;
      const next: SystemStatistics = {
        totalVisitors: nextVisitors,
        totalUploads: nextUploads,
        avgUploadsPerPerson: nextUploads / nextVisitors,
      };
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const runAnalysisFromDataUrl = async (dataUrl: string, fileName: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await analyzeWaterImage(dataUrl, fileName);
      incrementUploadStats();
      setAnalysisResult(res);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to analyze the selected water image.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        runAnalysisFromDataUrl(reader.result, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Unable to read the uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleCompactFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);
    handleFileProcess(file);
    e.target.value = '';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      handleFileProcess(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Show ONLY large example picture in modal (no report generation)
  const handleShowExamplePicture = (preset: ExampleWaterType) => {
    const photo = generateExampleWaterPhoto(preset);
    setExamplePreview(photo);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-sky-500 selection:text-white">
      {/* 3-Zone Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        {/* Zone 1: Brand Title */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setAnalysisResult(null);
          }}
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Aqua Sense Pro AI
        </a>

        {/* Zone 2: The 4 Requested Water Example Picture Links */}
        <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold text-slate-700 py-1">
          <a
            href="#river-sea-1"
            onClick={(e) => {
              e.preventDefault();
              handleShowExamplePicture('river_sea_1');
            }}
            className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            River / Sea Water
          </a>
          <a
            href="#river-sea-2"
            onClick={(e) => {
              e.preventDefault();
              handleShowExamplePicture('river_sea_2');
            }}
            className="hover:text-sky-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            River / Sea Water
          </a>
          <a
            href="#fish-pond-algae"
            onClick={(e) => {
              e.preventDefault();
              handleShowExamplePicture('fish_pond_algae');
            }}
            className="hover:text-emerald-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Fish_Pond_Algae
          </a>
          <a
            href="#polluted-dirty"
            onClick={(e) => {
              e.preventDefault();
              handleShowExamplePicture('polluted_dirty');
            }}
            className="hover:text-amber-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Polluted / Dirty Water
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden sm:flex items-center shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Upload Water Photo
          </button>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleCompactFileSelect}
        className="hidden"
      />

      {/* Conditional View: Clean Report Dashboard OR Daytime Bangladesh River/Pond Home */}
      {analysisResult ? (
        <main className="relative z-20 flex-1">
          <WaterReportDashboard
            result={analysisResult}
            stats={stats}
            onBackToHome={() => setAnalysisResult(null)}
            onUploadNewFile={(file) => handleFileProcess(file)}
          />
        </main>
      ) : (
        <main className="relative flex-1 flex flex-col items-center justify-start pt-6 sm:pt-10 px-4 pb-16 overflow-hidden">
          {/* Daytime Heavy Monsoon Rain on Kochu Pata & River/Pond with Shapla & Swimming Fish */}
          <PondRainCanvas />

          {/* Center Title & Clean White Upload Box */}
          <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
            {/* Preserved Title & Subtitle */}
            <div className="text-center mb-4">
              <h1
                className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(3,45,78,0.55)]"
                style={{ textWrap: 'balance' }}
              >
                Aqua Sense Pro AI
              </h1>
              <p className="text-xs sm:text-sm text-white font-semibold mt-1 drop-shadow-[0_1px_6px_rgba(3,45,78,0.65)]">
                Intelligent Water Quality, pH Level &amp; Fish Suitability
              </p>
            </div>

            {/* Clean White Card with ONLY the 2 Marked Elements */}
            <div className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-[0_16px_40px_rgba(3,55,90,0.22)] p-5">
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Marked Element 1: Choose Water Photo (JPG, PNG)... + Camera Button */}
                <div className="relative flex items-center w-full rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus-within:border-sky-500 transition-colors overflow-hidden">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center gap-2.5 px-4 py-3 text-left text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 truncate cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="truncate">
                      {selectedFile
                        ? selectedFile.name
                        : 'Choose Water Photo (JPG, PNG)...'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    title="Take water photo with camera"
                    className="px-3.5 py-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 border-l border-slate-200 transition-colors shrink-0 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                {/* Marked Element 2: Upload & Check Water Quality + pH Button with Hover Zoom & Glow Effect */}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:from-sky-600 hover:via-cyan-600 hover:to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-xl hover:shadow-sky-500/35 transform hover:scale-[1.035] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  {isAnalyzing
                    ? 'Analyzing Water Sample...'
                    : 'Upload & Check Water Quality + pH'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar: Project Name & Project Developed By Credits */}
          <div className="fixed bottom-3 inset-x-0 z-10 pointer-events-none flex justify-center px-4">
            <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md text-[11px] sm:text-xs text-slate-700 text-center max-w-4xl">
              <span className="font-bold text-sky-700">
                AI-Powered Image-Based Water Quality Intelligence System (Aqua Sense Pro AI)
              </span>
              <span className="mx-1.5 text-slate-400">·</span>
              <span className="font-semibold text-slate-800">Project Developed By:</span>{' '}
              <span>
                Md. Imran Hossain · Mahfujur Rahman Miraz · Enamul Kabir · Akhi Mallik
              </span>
            </div>
          </div>
        </main>
      )}

      {/* Large Example Water Picture Modal (Shows Picture Only, No Report) */}
      <ExampleImageModal
        example={examplePreview}
        onClose={() => setExamplePreview(null)}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) =>
          runAnalysisFromDataUrl(dataUrl, 'Camera_Water_Sample.jpg')
        }
      />
    </div>
  );
}
