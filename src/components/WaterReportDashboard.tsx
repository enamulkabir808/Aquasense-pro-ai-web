import React, { useRef } from 'react';
import {
  WaterAnalysisResult,
  SystemStatistics,
  getReportRows,
  getCvRows,
  getStatsRows,
  downloadWaterReportCsv,
  downloadCompleteExcel,
} from '../utils/waterAnalysis';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Upload,
  Droplets,
  Activity,
  ShieldAlert,
  Fish,
  Microscope,
  BarChart3,
  Users,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

interface WaterReportDashboardProps {
  result: WaterAnalysisResult;
  stats: SystemStatistics;
  onBackToHome: () => void;
  onUploadNewFile: (file: File) => void;
}

export const WaterReportDashboard: React.FC<WaterReportDashboardProps> = ({
  result,
  stats,
  onBackToHome,
  onUploadNewFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reportRows = getReportRows(result);
  const cvRows = getCvRows(result);
  const statsRows = getStatsRows(stats);

  const phMarkerPercent = Math.max(
    4,
    Math.min(96, ((result.phValue - 4.5) / (9.5 - 4.5)) * 100)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadNewFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef5fc] via-[#f4f8fc] to-[#eaf2fb] text-slate-800 pb-16">
      {/* Clean White Sticky Sub-Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all duration-200 hover:scale-[1.03] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span>File:</span>
              <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                {result.sampleName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{result.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-sky-50 hover:border-sky-300 border border-slate-300 rounded-lg transition-all duration-200 hover:scale-[1.03] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              Upload Another Image
            </button>
            <button
              onClick={() => downloadWaterReportCsv(result)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all duration-200 hover:scale-[1.03] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              Download CSV
            </button>
            <button
              onClick={() => downloadCompleteExcel(result, stats)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-all duration-200 hover:scale-[1.03] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Clean Report Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Aqua Sense Pro AI — Water Quality Analysis Report
          </h1>
          <p className="text-sm text-slate-600">
            Intelligent Water Monitoring &amp; Image-Based Water Quality, pH Level &amp; Fish
            Suitability Assessment
          </p>
        </div>

        {/* Section 1: Uploaded Water Image (1:1 Equal Width & Height Square) + Right Summary Sectors */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Uploaded Water Image Card (True 1:1 Square Image Frame like 1080x1080 px) */}
          <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Uploaded Water Image</h2>
                <span className="text-xs text-slate-500 font-mono truncate max-w-[180px]">
                  {result.sampleName}
                </span>
              </div>

              {/* Exact 1:1 Square Container (Width px === Height px, Full Image Displayed) */}
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 sector-3d-blu">
                <img
                  src={result.imageDataUrl}
                  alt={result.sampleName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-fill block"
                />
              </div>
            </div>

            {/* RGB Channel Dominance Sector */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-2.5">
              <div className="text-xs font-bold text-slate-800">
                RGB Channel Dominance (500×500 CV Analysis)
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Red ({result.red})</span>
                    <span className="font-semibold text-slate-800">{result.redRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, result.redRatio)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Green ({result.green})</span>
                    <span className="font-semibold text-slate-800">{result.greenRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, result.greenRatio)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Blue ({result.blue})</span>
                    <span className="font-semibold text-slate-800">{result.blueRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, result.blueRatio)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Card: Water Type, Overall Score, pH Level & Core Metrics */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 flex flex-col justify-between space-y-5">
            {/* Water Type & Overall Score Sectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border border-emerald-200 sector-3d-blu flex flex-col justify-between">
                <div className="text-xs font-semibold text-emerald-800">Water Type</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-1">
                  {result.waterType}
                </div>
                <div className="text-xs text-emerald-800 mt-3 pt-2 border-t border-emerald-200/70">
                  Final Status: <strong className="text-emerald-950">{result.finalStatus}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50/90 via-white to-sky-50/50 border border-sky-200 sector-3d-blu flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-sky-800">Overall Score</div>
                  <div className="text-3xl font-mono font-extrabold text-sky-950 mt-1">
                    {result.overallScore}%
                  </div>
                  <div className="text-xs text-sky-800 mt-2">
                    Overall Level: <strong className="text-sky-950">{result.overallLevel}</strong>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-sky-500 flex items-center justify-center bg-white font-mono font-extrabold text-lg text-sky-700 shadow-xs">
                  {result.overallScore}%
                </div>
              </div>
            </div>

            {/* pH Level & Water Measurement Sector (Highlighted in Screenshot 2) */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Estimated Water pH Level &amp; Measurements
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-mono font-extrabold text-slate-900">
                      {result.phValue}
                    </span>
                    <span className="text-xs font-mono text-slate-500">pH</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-sm font-bold text-teal-700">{result.phRangeLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Dissolved O₂</div>
                    <div className="text-slate-900 font-bold">{result.estimatedDoMgL} mg/L</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <div className="text-slate-400 text-[11px]">Est. TDS</div>
                    <div className="text-slate-900 font-bold">{result.estimatedTdsPpm} ppm</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="relative h-3.5 w-full rounded-full overflow-hidden bg-gradient-to-r from-amber-400 via-emerald-500 to-indigo-500 shadow-inner">
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white border-2 border-slate-900 rounded-full -translate-x-1/2 shadow-xs"
                    style={{ left: `${phMarkerPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>5.0 (Acidic)</span>
                  <span>6.5</span>
                  <span className="text-emerald-700 font-semibold">7.0–7.5 (Neutral)</span>
                  <span>8.5</span>
                  <span>9.5 (Alkaline)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{result.phComment}</p>
            </div>

            {/* 3 Primary Visual Metrics Sectors (Clarity, Turbidity, Algae — Highlighted in Screenshot 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Clarity</span>
                  <Droplets className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1.5">
                  {result.clarityScore}%
                </div>
                <div className="text-xs text-sky-700 font-semibold mt-1">
                  Level: {result.clarityLevel}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Turbidity</span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1.5">
                  {result.turbidityScore}%
                </div>
                <div className="text-xs text-amber-700 font-semibold mt-1">
                  Level: {result.turbidityLevel}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Algae</span>
                  <Microscope className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1.5">
                  {result.algaeScore}%
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">
                  Level: {result.algaeLevel}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Visual Report Progress Bars & Recommendations */}
        <section className="rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Visual Report &amp; Risk Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed suitability scores for aquaculture, drinking water, and microbial risks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Fish Farming Score Sector */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fish className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">Fish Farming Score</h3>
                </div>
                <span className="text-sm font-mono font-bold text-sky-700">
                  {result.fishFarmingLevel} — {result.fishFarmingScore}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${result.fishFarmingScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                {result.fishFarmingComment}
              </p>
            </div>

            {/* Drinking Water Analysis Sector */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">Drinking Water Analysis</h3>
                </div>
                <span className="text-sm font-mono font-bold text-teal-700">
                  {result.drinkingWaterLevel} — {result.drinkingWaterScore}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${result.drinkingWaterScore}%` }}
                />
              </div>
              <div className="text-xs text-slate-700">
                Status: <strong className="text-slate-900">{result.drinkingWaterStatus}</strong>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                {result.drinkingWaterComment}
              </p>
            </div>

            {/* Bacteria Risk Sector */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Bacteria Risk</h3>
                </div>
                <span className="text-sm font-mono font-bold text-amber-700">
                  {result.bacteriaRiskLevel} — {result.bacteriaRisk}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${result.bacteriaRisk}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                {result.bacteriaRiskComment}
              </p>
            </div>

            {/* Virus Risk Sector */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Virus Risk</h3>
                </div>
                <span className="text-sm font-mono font-bold text-rose-700">
                  {result.virusRiskLevel} — {result.virusRisk}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${result.virusRisk}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                {result.virusRiskComment}
              </p>
            </div>
          </div>

          {/* Aquaculture Recommendation Sector */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50/90 via-white to-sky-50/80 border border-emerald-200 sector-3d-blu flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-800">
                Aquaculture Recommendation
              </div>
              <div className="text-base font-extrabold text-emerald-950">
                {result.aquacultureStatus}
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">{result.aquacultureAdvice}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Complete Output Data Table */}
        <section className="rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Aqua Sense Pro AI — Complete Output Data
              </h2>
              <p className="text-xs text-slate-500">
                Complete water parameter report ready for CSV or Excel export
              </p>
            </div>
            <button
              onClick={() => downloadWaterReportCsv(result)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all duration-200 hover:scale-[1.03] cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Download Water Report CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Parameter</th>
                  <th className="py-3 px-4 font-bold">Level</th>
                  <th className="py-3 px-4 font-bold font-mono">Score / Result</th>
                  <th className="py-3 px-4 font-bold">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {reportRows.map((row) => (
                  <tr key={row.Parameter} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {row.Parameter}
                    </td>
                    <td className="py-3 px-4 font-medium text-sky-700 whitespace-nowrap">
                      {row.Level}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row['Score / Result']}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed min-w-[260px]">
                      {row.Comment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Computer Vision Data & System Statistics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">Computer Vision Data</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-bold">Computer Vision Parameter</th>
                    <th className="py-2.5 px-4 font-bold font-mono text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {cvRows.map((row) => (
                    <tr
                      key={row['Computer Vision Parameter']}
                      className="hover:bg-sky-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-700 font-medium">
                        {row['Computer Vision Parameter']}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-sky-700 text-right">
                        {row.Value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base font-bold text-slate-900">System Statistics</h2>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-4 font-bold">Statistic</th>
                      <th className="py-2.5 px-4 font-bold font-mono text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {statsRows.map((row) => (
                      <tr key={row.Statistic} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2.5 px-4 text-slate-700 font-medium">{row.Statistic}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-sky-700 text-right">
                          {row.Value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => downloadCompleteExcel(result, stats)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Complete Excel File (.xlsx)
              </button>
            </div>

            {/* About Aqua Sense AI */}
            <div className="rounded-2xl bg-white border border-slate-200/90 sector-3d-blu p-6 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Aqua Sense AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aqua Sense AI is an intelligent water monitoring system that uses artificial
                intelligence to analyze water quality in real time. It helps detect contamination
                early, improves water management, and supports safer, more sustainable use of water
                resources.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Project Details & Project Developed By */}
        <section className="rounded-2xl bg-white border border-slate-200/90 panel-3d-blu p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
                <GraduationCap className="w-4 h-4" />
                <span>PROJECT OVERVIEW &amp; ACADEMIC CREDITS</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                AI-Powered Image-Based Water Quality Intelligence System (Aqua Sense Pro AI)
              </h2>
              <p className="text-xs text-slate-600">
                BSc in Computer Science and Engineering · The People&apos;s University of Bangladesh ·
                Department of Computer Science and Engineering, Faculty of Science and Engineering
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Project Developed By</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { name: 'Md. Imran Hossain', id: '0122320005101411' },
                { name: 'Mahfujur Rahman Miraz', id: '01224205101216' },
                { name: 'Enamul Kabir', id: '22556205198' },
                { name: 'Akhi Mallik', id: '0122320005101073' },
              ].map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 sector-3d-blu flex flex-col justify-between"
                >
                  <div className="text-sm font-bold text-slate-900">{member.name}</div>
                  <div className="text-xs font-mono text-sky-700 font-semibold mt-1">
                    ID: {member.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer & Timestamp */}
        <footer className="rounded-xl bg-amber-50 border border-amber-200 sector-3d-blu p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>This is an image-based AI prototype.</span>
          </div>
          <div className="font-mono text-slate-600 shrink-0">
            Report Generated: {result.timestamp}
          </div>
        </footer>
      </div>
    </div>
  );
};
