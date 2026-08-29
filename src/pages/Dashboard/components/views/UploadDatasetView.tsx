import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Database, Layers, ArrowRight, Sparkles } from 'lucide-react';

export const UploadDatasetView: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: string; type: string; status: 'Ready' | 'Ingesting' | 'Processed'; epochs: number; satellites: number }[]
  >([
    { name: 'navic_7day_sparse_telemetry.sp3', size: '2.4 MB', type: 'SP3-d NavIC Orbit', status: 'Processed', epochs: 145, satellites: 8 },
    { name: 'navic_atomic_rubidium_clock.clk', size: '820 KB', type: 'Precise Clock Drift', status: 'Processed', epochs: 145, satellites: 8 },
    { name: 'istrac_bengaluru_ground_obs.rnx', size: '14.2 MB', type: 'RINEX 3.04 Tracking', status: 'Ready', epochs: 145, satellites: 8 },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addNewFile(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addNewFile(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const addNewFile = (name: string, size: string) => {
    const newFile = {
      name,
      size,
      type: name.endsWith('.sp3') ? 'SP3-d NavIC Orbit' : name.endsWith('.clk') ? 'CLK Precise Clock' : 'RINEX 3.0x',
      status: 'Ready' as const,
      epochs: 145,
      satellites: 8,
    };
    setUploadedFiles((prev) => [newFile, ...prev]);
  };

  const handleIngestAll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'Processed' }))
      );
      setIsProcessing(false);
      setSuccessMessage('Successfully synthesized 145 raw ground epochs into 14,500 training vectors via TIMeR-XL (100× Expansion).');
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">
            TELEMETRY INGESTION PIPELINE
          </span>
        </div>
        <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">
          Sparse Telemetry &amp; SP3 Ingest
        </h2>
        <p className="text-xs text-white/60 font-inter mt-1 max-w-2xl">
          Ingest raw 7-day observation datasets (145 epochs / ~70 min resolution) for NavIC GEO/GSO satellites to trigger the TIMeR-XL 100× deep expansion engine.
        </p>
      </div>

      {successMessage && (
        <div className="liquid-glass-emerald bg-emerald-950/40 p-4 rounded-2xl text-xs font-mono text-[#6FF2C0] flex items-center space-x-3 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-[#6FF2C0] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all liquid-glass ${dragActive
            ? 'border-[#6FF2C0] bg-emerald-950/30'
            : 'border-white/15 hover:border-white/30 bg-[#060408]/80'
          }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#6FF2C0] shadow-2xl">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-instrument text-2xl text-white">
              Drop NavIC Telemetry Files
            </h3>
            <p className="text-xs text-white/50 font-inter mt-1">
              Supports <span className="text-white font-mono">.SP3</span> (Orbit Coordinates), <span className="text-white font-mono">.CLK</span> (Atomic Clock Drift), and <span className="text-white font-mono">.RNX</span> (RINEX 3.0x).
            </p>
          </div>

          <label className="inline-block px-6 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold tracking-wider hover:bg-white/90 transition-all button-glow cursor-pointer">
            Browse Local Files
            <input type="file" onChange={handleFileInput} className="hidden" multiple />
          </label>
        </div>
      </div>

      {/* Uploaded Files Table */}
      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white uppercase">
            <Database className="w-4 h-4 text-[#6FF2C0]" />
            <span>INGESTION QUEUE ({uploadedFiles.length} DATASETS)</span>
          </div>

          <button
            onClick={handleIngestAll}
            disabled={isProcessing}
            className="px-5 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-[#6FF2C0] border border-emerald-500/40 text-xs font-mono font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>EXPANDING 100×...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXECUTE 100× TIMeR-XL EXPANSION</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] text-white/40 uppercase border-b border-white/10">
              <tr>
                <th className="pb-2">FILE NAME</th>
                <th className="pb-2">FORMAT TYPE</th>
                <th className="pb-2">SIZE</th>
                <th className="pb-2">OBSERVATION EPOCHS</th>
                <th className="pb-2">NAVIC SATS</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {uploadedFiles.map((file, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#6FF2C0]" />
                    <span>{file.name}</span>
                  </td>
                  <td className="py-2.5 text-white/70">{file.type}</td>
                  <td className="py-2.5 text-white/50">{file.size}</td>
                  <td className="py-2.5 text-cyan-300 font-semibold">{file.epochs} Epochs (7 Days)</td>
                  <td className="py-2.5 text-white/80">{file.satellites} Sats [NavIC]</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-[#6FF2C0] border border-emerald-500/30">
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
