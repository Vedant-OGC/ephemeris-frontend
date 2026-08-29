import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw, Database, Download } from 'lucide-react';
import { uploadSatelliteForecast } from '../../api/client';

const NAVIC_SATS = ['G01','G03','G05','G07','G08','G10','G11','G12'];

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  status: 'Ready' | 'Uploading' | 'Completed' | 'Error';
  result?: any;
  error?: string;
}

export const UploadDatasetView: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedSatId, setSelectedSatId] = useState('G01');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addNewFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addNewFiles(Array.from(e.target.files));
  };

  const addNewFiles = (files: File[]) => {
    const entries: UploadedFile[] = files.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.endsWith('.sp3') ? 'SP3-d NavIC Orbit'
        : file.name.endsWith('.clk') ? 'CLK Precise Clock'
        : file.name.endsWith('.rnx') ? 'RINEX 3.0x'
        : 'Telemetry Dataset',
      status: 'Ready' as const,
    }));
    setPendingFiles((prev) => [...files, ...prev]);
    setUploadedFiles((prev) => [...entries, ...prev]);
  };

  const handleIngestAll = async () => {
    setIsProcessing(true);
    const readyIndices: number[] = [];
    uploadedFiles.forEach((f, i) => { if (f.status === 'Ready') readyIndices.push(i); });
    let completedCount = 0;
    for (const idx of readyIndices) {
      const fileEntry = uploadedFiles[idx];
      const actualFile = pendingFiles.find((pf) => pf.name === fileEntry.name);
      setUploadedFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'Uploading' } : f));
      try {
        if (!actualFile) throw new Error('File not found');
        const result = await uploadSatelliteForecast(selectedSatId, actualFile);
        setUploadedFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'Completed', result } : f));
        completedCount++;
      } catch (e: any) {
        setUploadedFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: 'Error', error: e.message } : f));
      }
    }
    setIsProcessing(false);
  };

  const downloadForecast = (result: any) => {
    if (!result?.forecast_points) return;
    const header = 'time_label,orbit_residual_3d,satclockerror';
    const rows = result.forecast_points.map((p: any) =>
      `${p.time_label},${p.orbit_residual_3d},${p.satclockerror}`
    ).join('\n');
    const csv = header + '\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast_${result.satellite_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusClass = (s: string) =>
    s === 'Completed' ? 'bg-emerald-950/40 text-[#6FF2C0] border-emerald-500/30'
    : s === 'Error' ? 'bg-red-950/40 text-red-400 border-red-500/30'
    : s === 'Uploading' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
    : 'bg-white/5 text-white/60 border-white/10';

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-mono tracking-widest text-[#6FF2C0] uppercase">ADMIN DATA INGESTION</span>
        </div>
        <h2 className="font-instrument text-3xl md:text-4xl text-white text-glow">Custom Dataset Upload</h2>
        <p className="text-xs text-white/60 font-inter mt-1 max-w-2xl">
          Upload custom cleaned CSV files for NavIC satellites. This is an admin tool.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="shrink-0 font-mono text-xs">
          <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">TARGET SATELLITE</label>
          <select value={selectedSatId} onChange={(e) => setSelectedSatId(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 cursor-pointer">
            {NAVIC_SATS.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all liquid-glass ${dragActive ? 'border-[#6FF2C0] bg-emerald-950/30' : 'border-white/15 hover:border-white/30 bg-[#060408]/80'}`}>
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#6FF2C0] shadow-2xl">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-instrument text-2xl text-white">Drop NavIC Telemetry Files</h3>
                <p className="text-xs text-white/50 font-inter mt-1">Supports <span className="text-white font-mono">.CSV</span>, <span className="text-white font-mono">.SP3</span>, <span className="text-white font-mono">.CLK</span></p>
              </div>
              <label className="inline-block px-6 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold tracking-wider hover:bg-white/90 transition-all button-glow cursor-pointer">
                Browse Local Files
                <input type="file" onChange={handleFileInput} className="hidden" multiple />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="liquid-glass bg-[#060408]/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white uppercase">
            <Database className="w-4 h-4 text-[#6FF2C0]" />
            <span>INGESTION QUEUE ({uploadedFiles.length} DATASETS)</span>
          </div>
          <button onClick={handleIngestAll} disabled={isProcessing || !uploadedFiles.some((f) => f.status === 'Ready')}
            className="px-5 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-[#6FF2C0] border border-emerald-500/40 text-xs font-mono font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-2">
            {isProcessing ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>PROCESSING...</span></>
            ) : (
              <><Upload className="w-3.5 h-3.5" /><span>UPLOAD & PROCESS ALL</span></>
            )}
          </button>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-xs font-mono">No files queued. Drop files above to begin.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] text-white/40 uppercase border-b border-white/10">
                <tr>
                  <th className="pb-2">FILE NAME</th>
                  <th className="pb-2">FORMAT TYPE</th>
                  <th className="pb-2">SIZE</th>
                  <th className="pb-2 text-right">STATUS</th>
                  <th className="pb-2 text-right">ACTIONS</th>
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
                    <td className="py-2.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass(file.status)}`}>
                        {file.status}
                      </span>
                      {file.error && <span className="ml-2 text-red-400 text-[10px]">{file.error}</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {file.status === 'Completed' && file.result && (
                        <button onClick={() => downloadForecast(file.result)}
                          className="text-[#6FF2C0] hover:text-white transition-colors cursor-pointer" title="Download forecast CSV">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};