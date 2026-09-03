import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, X, Sparkles, Download, ShoppingBag, RefreshCw, Image as ImageIcon, Wand2, Palette, Shuffle } from 'lucide-react';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { processTryOn, type SareePalette, type ProcessOptions, DEFAULT_OPTIONS } from '@/utils/tryOnEngine';

type TryOnStage = 'select-saree' | 'upload' | 'processing' | 'result';

export default function TryOn() {
  const { addToCart } = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<TryOnStage>('select-saree');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [tryOnError, setTryOnError] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<SareePalette | null>(null);
  const [showBefore, setShowBefore] = useState(false);

  const [options, setOptions] = useState<ProcessOptions>(DEFAULT_OPTIONS);
  const [savedResults, setSavedResults] = useState<{ product: Product; composite: string }[]>([]);

  const productImages = products.filter((p) => p.images.length > 0);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTryOnError('');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const image = ev.target?.result;
        if (typeof image === 'string') {
          setUserImage(image);
          runProcessing(image);
        }
      };
      reader.onerror = () => setTryOnError('We could not read that photo. Please choose a JPG or PNG image and try again.');
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      alert('Could not access camera. Please check permissions or upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (cameraVideoRef.current) {
      const video = cameraVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const captured = canvas.toDataURL('image/png');
        setTryOnError('');
        setUserImage(captured);
        stopCamera();
        runProcessing(captured);
      }
    }
  };

  const runProcessing = useCallback(async (imageSrc: string) => {
    if (!selectedProduct) return;
    setStage('processing');
    setTryOnError('');
    try {
      const { composite, palette: pal } = await processTryOn(
        imageSrc,
        selectedProduct.images[0],
        selectedProduct.fabric,
        options
      );
      setResultImage(composite);
      setPalette(pal);
      setStage('result');
    } catch (err) {
      setTryOnError(err instanceof Error ? err.message : 'Something went wrong during processing. Please try again.');
      setStage('upload');
    }
  }, [selectedProduct, options]);

  const reprocess = useCallback(async () => {
    if (userImage && selectedProduct) {
      setStage('processing');
      try {
        const { composite, palette: pal } = await processTryOn(
          userImage,
          selectedProduct.images[0],
          selectedProduct.fabric,
          options
        );
        setResultImage(composite);
        setPalette(pal);
        setStage('result');
      } catch (err) {
        setTryOnError(err instanceof Error ? err.message : 'Processing failed. Please try again.');
        setStage('upload');
      }
    }
  }, [userImage, selectedProduct, options]);

  const handleSaveResult = () => {
    if (resultImage && selectedProduct) {
      setSavedResults((prev) => [{ product: selectedProduct, composite: resultImage }, ...prev].slice(0, 6));
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.download = `suhana-tryon-${selectedProduct?.name || 'saree'}.png`;
      link.href = resultImage;
      link.click();
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setSelectedProduct(null);
    setResultImage(null);
    setPalette(null);
    setTryOnError('');
    setOptions(DEFAULT_OPTIONS);
    setStage('select-saree');
  };

  const updateOption = (key: keyof ProcessOptions, value: number | string) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-rose-950 via-stone-900 to-rose-950 py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.pexels.com/photos/5447529/pexels-photo-5447529.jpeg?auto=compress&cs=tinysrgb&h=600&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-300/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-4">
            <Sparkles className="w-4 h-4" />
            AI VIRTUAL TRY-ON ROOM
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-3">See Yourself in Every Saree</h1>
          <p className="text-stone-300 max-w-xl mx-auto">Upload any photo or take one instantly — our AI drapes the saree on you in real-time.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-10 flex-wrap">
          {[
            { num: 1, label: 'Choose Saree', active: stage === 'select-saree', done: stage !== 'select-saree' },
            { num: 2, label: 'Your Photo', active: stage === 'upload', done: stage === 'processing' || stage === 'result' },
            { num: 3, label: 'AI Processing', active: stage === 'processing', done: stage === 'result' },
            { num: 4, label: 'Your Look', active: stage === 'result', done: false },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s.active ? 'bg-rose-900 text-white' : s.done ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
              }`}>
                {s.done ? <Sparkles className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm font-medium ${s.active ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</span>
              {s.num < 4 && <div className="w-6 md:w-12 h-px bg-stone-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {tryOnError && (
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-4">
            <span>{tryOnError}</span>
            <button onClick={() => setTryOnError('')} className="font-medium hover:text-rose-950">Dismiss</button>
          </div>
        )}

        {/* Stage: Select Saree */}
        {stage === 'select-saree' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-rose-700" />
              <h2 className="text-xl font-serif font-semibold text-stone-900">Choose a saree to try on</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {productImages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setStage('upload'); }}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-transparent hover:border-rose-700 transition-all duration-300"
                >
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                    <p className="text-white text-xs font-medium truncate">{p.name}</p>
                    <p className="text-amber-300 text-xs">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-rose-700" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stage: Upload */}
        {stage === 'upload' && selectedProduct && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-4">
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-16 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="text-sm text-stone-500">Trying on:</p>
                <h3 className="font-medium text-stone-900">{selectedProduct.name}</h3>
                <p className="text-sm text-stone-600">₹{selectedProduct.price.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setStage('select-saree')} className="text-sm text-rose-700 hover:text-rose-900 font-medium">
                Change
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-stone-300 rounded-2xl hover:border-rose-700 hover:bg-rose-50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                    <Upload className="w-7 h-7 text-stone-500 group-hover:text-rose-700 transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Upload Photo</p>
                    <p className="text-sm text-stone-500">From your device or the web</p>
                  </div>
                </button>

                <button
                  onClick={startCamera}
                  className="group flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-stone-300 rounded-2xl hover:border-rose-700 hover:bg-rose-50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                    <Camera className="w-7 h-7 text-stone-500 group-hover:text-rose-700 transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">Take Photo</p>
                    <p className="text-sm text-stone-500">Instant camera capture</p>
                  </div>
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              <div className="mt-6 space-y-3">
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <ImageIcon className="w-4 h-4 mt-0.5 shrink-0" />
                    Works with any photo — face shots, portraits, or full-body. Camera captures and uploaded photos both work perfectly.
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl">
                  <p className="text-sm text-rose-800 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                    Our AI analyzes the saree's colors and patterns, detects your body in the photo, and drapes the fabric on you — just like a virtual fitting room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-stone-900">Camera</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <video ref={cameraVideoRef} autoPlay playsInline className="w-full rounded-xl bg-stone-900" />
              <div className="flex gap-3 mt-4">
                <button onClick={stopCamera} className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-full font-medium hover:bg-stone-200 transition-colors">
                  Cancel
                </button>
                <button onClick={capturePhoto} className="flex-1 bg-rose-900 text-white py-3 rounded-full font-medium hover:bg-rose-800 transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Capture & Try On
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage: Processing */}
        {stage === 'processing' && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
              <div className="absolute inset-0 rounded-full border-4 border-rose-700 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-rose-700 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-serif text-stone-900 mb-3">AI is draping your saree...</h2>
            <p className="text-stone-500">Analyzing colors, detecting your silhouette, and applying the fabric</p>
            <div className="mt-6 flex justify-center gap-2">
              {['Extracting colors', 'Detecting body', 'Applying drape', 'Adding texture'].map((step, i) => (
                <span key={i} className="text-xs text-stone-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                  {step}{i < 3 && ' · '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stage: Result */}
        {stage === 'result' && selectedProduct && resultImage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {/* Before/After comparison */}
              <div className="relative bg-white rounded-2xl p-4 shadow-lg overflow-hidden group">
                {userImage && (
                  <img
                    src={showBefore ? userImage : resultImage}
                    alt={showBefore ? 'Before' : 'After'}
                    className="w-full rounded-xl transition-opacity duration-300"
                  />
                )}
                <div className="absolute top-6 left-6 flex gap-2">
                  <button
                    onClick={() => setShowBefore(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!showBefore ? 'bg-rose-900 text-white' : 'bg-white/80 text-stone-700'}`}
                  >
                    After
                  </button>
                  <button
                    onClick={() => setShowBefore(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${showBefore ? 'bg-rose-900 text-white' : 'bg-white/80 text-stone-700'}`}
                  >
                    Before
                  </button>
                </div>
                <div className="absolute bottom-6 right-6 bg-amber-300 text-stone-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Try-On
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-full font-medium hover:bg-stone-200 transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button onClick={handleSaveResult} className="flex-1 flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-full font-medium hover:bg-stone-200 transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  Save Look
                </button>
                <button onClick={reprocess} className="flex-1 flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-full font-medium hover:bg-stone-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Reprocess
                </button>
              </div>

              {/* Color palette display */}
              {palette && (
                <div className="bg-white rounded-2xl p-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-rose-700" />
                    <h3 className="text-sm font-medium text-stone-700">Detected Saree Colors</h3>
                  </div>
                  <div className="flex gap-2">
                    {palette.swatches.slice(0, 6).map((sw, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="w-full aspect-square rounded-lg border border-stone-200" style={{ backgroundColor: sw.color }} />
                        <p className="text-xs text-stone-400 mt-1">{Math.round(sw.ratio * 100)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Adjustment controls */}
              <div className="bg-white rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-2 mb-5">
                  <Wand2 className="w-5 h-5 text-rose-700" />
                  <h2 className="text-lg font-serif font-semibold text-stone-900">Fine-tune Your Look</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-stone-700">Color Intensity</label>
                      <span className="text-sm text-stone-500">{options.intensity}%</span>
                    </div>
                    <input type="range" min="20" max="100" value={options.intensity} onChange={(e) => updateOption('intensity', Number(e.target.value))} className="w-full accent-rose-700" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-stone-700">Overlay Size</label>
                      <span className="text-sm text-stone-500">{options.scale}%</span>
                    </div>
                    <input type="range" min="40" max="160" value={options.scale} onChange={(e) => updateOption('scale', Number(e.target.value))} className="w-full accent-rose-700" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-stone-700">Position (Left/Right)</label>
                      <span className="text-sm text-stone-500">{options.offsetX}px</span>
                    </div>
                    <input type="range" min="-200" max="200" value={options.offsetX} onChange={(e) => updateOption('offsetX', Number(e.target.value))} className="w-full accent-rose-700" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-stone-700">Position (Up/Down)</label>
                      <span className="text-sm text-stone-500">{options.offsetY}px</span>
                    </div>
                    <input type="range" min="-200" max="200" value={options.offsetY} onChange={(e) => updateOption('offsetY', Number(e.target.value))} className="w-full accent-rose-700" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-stone-700">Overlay Opacity</label>
                      <span className="text-sm text-stone-500">{options.opacity}%</span>
                    </div>
                    <input type="range" min="20" max="100" value={options.opacity} onChange={(e) => updateOption('opacity', Number(e.target.value))} className="w-full accent-rose-700" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Blend Mode</label>
                    <select value={options.blendMode} onChange={(e) => updateOption('blendMode', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm">
                      <option value="soft-light">Soft Light (Natural)</option>
                      <option value="overlay">Overlay (Vivid)</option>
                      <option value="multiply">Multiply (Rich)</option>
                      <option value="screen">Screen (Light)</option>
                      <option value="source-over">Normal (Direct)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={reprocess}
                  className="w-full mt-5 flex items-center justify-center gap-2 bg-rose-900 text-white py-3 rounded-full font-medium hover:bg-rose-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>

              {/* Product card */}
              <div className="bg-white rounded-2xl p-6 mb-4">
                <div className="flex items-start gap-4">
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-20 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">{selectedProduct.name}</h3>
                    <p className="text-sm text-stone-500">{selectedProduct.fabric} · {selectedProduct.occasion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-semibold text-stone-900">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-sm text-stone-400 line-through">₹{selectedProduct.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Try another */}
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-6">
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">Love this look?</h3>
                <p className="text-sm text-stone-600 mb-4">Try another saree to compare and find your perfect match.</p>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 bg-white text-rose-800 px-6 py-3 rounded-full font-medium hover:bg-rose-50 transition-colors w-full"
                >
                  <Shuffle className="w-4 h-4" />
                  Try Another Saree
                </button>
              </div>

              {/* Saved looks */}
              {savedResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-3">Saved Looks</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {savedResults.map((r, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <img src={r.composite} alt={r.product.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="absolute bottom-1 left-1 right-1 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">{r.product.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
