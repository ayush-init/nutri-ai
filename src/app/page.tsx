'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { MealAnalysisResult } from '@/components/MealAnalysisResult';
import { MealAnalysis } from '@/types/tracker';
import { compressImageBase64 } from '@/lib/imageCompressor';
import { Camera, Upload, Sparkles, RefreshCw, FlipHorizontal, AlertCircle, Sun, Utensils, RotateCcw } from 'lucide-react';

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
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

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
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      
      {/* Header */}
      <Navbar onOpenScanner={() => handleReset()} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Title Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> NUTRI.AI Multi-Model Vision
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Upload or Snap Food Photo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto font-medium">
            Take a photo or upload an image to receive instant AI vision analysis, calorie calculation, and micronutrient breakdown.
          </p>
        </div>

        {/* Scanner Card Area */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
          
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold mb-6">
            <button
              onClick={() => {
                setActiveTab('upload');
                handleReset();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload Image
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                handleReset();
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeTab === 'camera'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" /> Live Camera
            </button>
          </div>

          {/* Upload Dropzone OR Camera View */}
          {activeTab === 'upload' ? (
            <div className="relative aspect-video max-h-96 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center p-6 text-center transition-all group overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt="Uploaded preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">Click or drag food image here</p>
                  <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP</p>
                </>
              )}

              {/* Scanning Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    Analyzing Image & Micronutrients...
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Camera Viewport */
            <div className="relative aspect-video max-h-96 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt="Captured food" className="w-full h-full object-contain" />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />
              )}

              {!isCameraActive && !selectedImage && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Camera className="w-10 h-10 mb-2 text-slate-600 animate-bounce" />
                  <p className="text-xs max-w-xs">Initializing camera feed...</p>
                </div>
              )}

              {/* Laser scan effect during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500 animate-laser" />
                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      Running Vision AI Analysis...
                    </span>
                  </div>
                </div>
              )}

              {/* Camera Flip button */}
              {isCameraActive && !isAnalyzing && !selectedImage && (
                <button
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-900"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Quality Warning banner */}
          {qualityWarning && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
              <Sun className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{qualityWarning}</span>
            </div>
          )}

          {/* Error banner */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Shutter & Reset Buttons */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {activeTab === 'camera' && !selectedImage && (
              <button
                onClick={capturePhoto}
                disabled={!isCameraActive || isAnalyzing}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Photo</span>
              </button>
            )}

            {selectedImage && (
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Analyze Another Photo</span>
              </button>
            )}
          </div>

          {/* Sample Preset Photos */}
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
