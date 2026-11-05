import React from 'react';
import { X, Download } from 'lucide-react';

interface ExampleImageModalProps {
  example: {
    dataUrl: string;
    title: string;
    fileName: string;
    caption: string;
  } | null;
  onClose: () => void;
}

export const ExampleImageModal: React.FC<ExampleImageModalProps> = ({
  example,
  onClose,
}) => {
  if (!example) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = example.dataUrl;
    a.download = example.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Light Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">{example.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{example.caption}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Save Image
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Example Picture Only */}
        <div className="p-4 bg-slate-100 flex items-center justify-center">
          <img
            src={example.dataUrl}
            alt={example.title}
            referrerPolicy="no-referrer"
            className="w-full max-h-[72vh] object-contain rounded-xl shadow-md border border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
