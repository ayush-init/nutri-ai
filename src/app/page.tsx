'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MealAnalysisResult } from '@/components/MealAnalysisResult';
import { AIScannerViewer } from '@/components/AIScannerViewer';
import { MealAnalysis } from '@/types/tracker';
import { compressImageBase64 } from '@/lib/imageCompressor';
import { Camera, Upload, FlipHorizontal } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorReason] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (activeTab === 'camera' && !selectedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, selectedImage]);

  const startCamera = async () => {
    stopCamera();
    setErrorReason(null);
    setQualityWarning(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      setErrorReason('Camera access unavailable. Please use file upload or sample photos below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Evaluate image brightness & quality
  const analyzeImageQuality = (canvas: HTMLCanvasElement) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let totalLuminance = 0;

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
      }

      const avgLuminance = totalLuminance / (data.length / 16);

      if (avgLuminance < 45) {
        setQualityWarning('Lighting Quality Tip: Image appears dim. Brighten environment for highest precision.');
      } else if (avgLuminance > 225) {
        setQualityWarning('Glare Warning: High exposure or glare detected. Reduce direct light reflections.');
      } else {
        setQualityWarning(null);
      }
    } catch (e) {
      setQualityWarning(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      analyzeImageQuality(canvas);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);

      // Fast canvas image compression before sending over HTTP
      const compressedDataUrl = await compressImageBase64(dataUrl, 1024, 1024, 0.85);
      processImageAnalysis(compressedDataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          analyzeImageQuality(canvas);
        }
      };
      img.src = dataUrl;

      // Fast canvas image compression before sending over HTTP
      const compressedDataUrl = await compressImageBase64(dataUrl, 1024, 1024, 0.85);
      processImageAnalysis(compressedDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImageAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setErrorReason(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();
      if (!data.success || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze food image');
      }

      setAnalysisResult(data.analysis);
      setIsAnalyzing(false);
      stopCamera();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorReason(err.message || 'Error communicating with AI Vision model.');
      setIsAnalyzing(false);
    }
  };

  const presetSamples = [
    {
      name: 'Chicken Rice Bowl',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Avocado Egg Toast',
      url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Fresh Salmon Salad',
      url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handlePresetSelect = async (url: string) => {
    setIsAnalyzing(true);
    setSelectedImage(url);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const compressedDataUrl = await compressImageBase64(base64data, 1024, 1024, 0.85);
        processImageAnalysis(compressedDataUrl);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setErrorReason('Failed to load sample image.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorReason(null);
    setQualityWarning(null);
    setIsAnalyzing(false);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      
      {/* Header */}
      <Navbar onOpenScanner={() => handleReset()} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Clean Hero Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Upload or Snap Food Photo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto font-medium leading-relaxed">
            Take a photo or upload an image to receive instant AI vision analysis, calorie calculation, and nutrition breakdown.
          </p>
        </div>

        {/* Main Scanner Container */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs mb-8">
          
          {/* Mode Selector Tabs (Hidden when an image is selected) */}
          {!selectedImage && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold mb-6">
              <button
                onClick={() => {
                  setActiveTab('upload');
                  handleReset();
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" /> Upload Image
              </button>
              <button
                onClick={() => {
                  setActiveTab('camera');
                  handleReset();
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" /> Live Camera
              </button>
            </div>
          )}

          {/* Render Active Image Scanner Hero Viewer OR File Dropzone / Camera */}
          {selectedImage ? (
            <AIScannerViewer
              imageUrl={selectedImage}
              isAnalyzing={isAnalyzing}
              qualityWarning={qualityWarning}
              errorMsg={errorMsg}
              onReset={handleReset}
              onRetry={() => {
                if (selectedImage) processImageAnalysis(selectedImage);
              }}
            />
          ) : activeTab === 'upload' ? (
            /* Upload Dropzone Mode */
            <div className="relative aspect-video max-h-96 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center p-6 text-center transition-all group overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Click or drag food image here</p>
              <p className="text-xs text-slate-500 font-medium">Supports JPG, PNG, WEBP</p>
            </div>
          ) : (
            /* Camera Viewport Mode - Clean Light Theme */
            <div className="relative aspect-video max-h-96 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Camera className="w-10 h-10 mb-2 text-slate-400 animate-bounce" />
                  <p className="text-xs max-w-xs font-medium">Initializing camera feed...</p>
                </div>
              )}

              {/* Camera Flip button */}
              {isCameraActive && (
                <button
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-slate-700 border border-slate-200 shadow-md hover:bg-white transition-all"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}

              {/* Shutter Button */}
              {isCameraActive && (
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Snap Photo</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sample Preset Photos (Only shown when no image is selected) */}
          {!selectedImage && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2.5 block">
                Quick Sample Photos
              </span>
              <div className="grid grid-cols-3 gap-2">
                {presetSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(sample.url)}
                    disabled={isAnalyzing}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 text-left transition-all text-xs text-slate-700 flex items-center gap-2"
                  >
                    <img src={sample.url} alt={sample.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate font-semibold">{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* AI Vision Analysis Results Section */}
        {analysisResult && (
          <MealAnalysisResult
            analysis={analysisResult}
            imageUrl={selectedImage || undefined}
            onCancel={() => handleReset()}
          />
        )}

      </main>
    </div>
  );
}
