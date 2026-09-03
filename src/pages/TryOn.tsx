import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, X, Sparkles, Download, ShoppingBag, RefreshCw, Image as ImageIcon, Wand2, Shuffle, AlertCircle, Zap } from 'lucide-react';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

type TryOnStage = 'select-saree' | 'upload' | 'processing' | 'result';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-tryon`;

export default function TryOn() {
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<TryOnStage>('select-saree');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [tryOnError, setTryOnError] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
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

  /**
   * Convert an image URL (like Pexels) to a base64 data URI by fetching it.
   */
  const fetchImageAsDataURL = async (url: string): Promise<string> => {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Could not load the saree image.');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const runProcessing = useCallback(async (imageSrc: string) => {
    if (!selectedProduct) return;
    setStage('processing');
    setTryOnError('');
    setProcessingStatus('Preparing your photo and the saree image...');

    try {
      // Convert the saree product image to base64
      const garmentBase64 = await fetchImageAsDataURL(selectedProduct.images[0]);

      setProcessingStatus('Sending to the AI virtual try-on model...');

      // Call the edge function
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          humanImage: imageSrc,
          garmentImage: garmentBase64,
          garmentDescription: `A traditional Indian ${selectedProduct.fabric} saree in ${selectedProduct.color} for ${selectedProduct.occasion} wear, draped naturally from the shoulder across the body with the blouse and pallu visible`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.resultUrl) {
        // Synchronous result (unlikely with FASHN but handle it)
        setResultImage(data.resultUrl);
        setStage('result');
        return;
      }

      if (data.predictionId) {
        // Poll the edge function for the result
        setProcessingStatus('AI is analyzing the saree and your photo...');

        const pollResult = await pollViaEdgeFunction(data.predictionId, setProcessingStatus);
        if (pollResult) {
          setResultImage(pollResult);
          setStage('result');
        } else {
          throw new Error('The AI could not complete the try-on. Please try a clearer, full-body photo.');
        }
      } else {
        throw new Error('Unexpected response from the server.');
      }
    } catch (err) {
      console.error('AI try-on failed:', err);
      const msg = err instanceof Error ? err.message : 'Processing failed. Please try again.';
      setTryOnError(msg);
      setStage('upload');
    }
  }, [selectedProduct]);

  /**
   * Poll for prediction result via the edge function (keeps the API key server-side).
   */
  const pollViaEdgeFunction = async (
    predictionId: string,
    setStatus: (s: string) => void,
  ): Promise<string | null> => {
    const maxAttempts = 80;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      setStatus(`AI is draping the saree on you... (${i + 1}/${maxAttempts})`);

      try {
        const res = await fetch(`${EDGE_FUNCTION_URL}?prediction=${predictionId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });
        if (!res.ok) continue;
        const data = await res.json();

        if (data.status === 'completed' && data.resultUrl) {
          return data.resultUrl;
        }
        if (data.status === 'failed') {
          throw new Error(data.error || 'The AI model could not generate a result.');
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('could not')) {
          throw err;
        }
        // Continue polling on network errors
      }
    }
    return null;
  };

  const reprocess = useCallback(async () => {
    if (userImage && selectedProduct) {
      await runProcessing(userImage);
    }
  }, [userImage, selectedProduct, runProcessing]);

  const handleSaveResult = () => {
    if (resultImage && selectedProduct) {
      setSavedResults((prev) => [{ product: selectedProduct, composite: resultImage }, ...prev].slice(0, 6));
    }
  };

  const handleDownload = async () => {
    if (resultImage) {
      try {
        let downloadUrl = resultImage;
        if (resultImage.startsWith('http')) {
          const response = await fetch(resultImage);
          const blob = await response.blob();
          downloadUrl = URL.createObjectURL(blob);
        }
        const link = document.createElement('a');
        link.download = `suhana-tryon-${selectedProduct?.name || 'saree'}.png`;
        link.href = downloadUrl;
        link.click();
        if (downloadUrl.startsWith('blob:')) {
          URL.revokeObjectURL(downloadUrl);
        }
      } catch {
        const link = document.createElement('a');
        link.download = `suhana-tryon-${selectedProduct?.name || 'saree'}.png`;
        link.href = resultImage;
        link.click();
      }
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setSelectedProduct(null);
    setResultImage(null);
    setTryOnError('');
    setStage('select-saree');
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
          <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start justify-between gap-4">
            <span className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {tryOnError}
            </span>
            <button onClick={() => setTryOnError('')} className="font-medium hover:text-rose-900 shrink-0">Dismiss</button>
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
                    For best results, use a clear full-body photo where your arms and shoulders are visible. Camera captures and uploaded photos both work.
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl">
                  <p className="text-sm text-rose-800 flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                    Our AI uses a fashion virtual try-on model that detects your body and pose, warps the saree onto you, and renders it naturally — preserving your face, hair, and background.
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
            <p className="text-stone-500">{processingStatus}</p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap px-4">
              {['Analyzing photo', 'Detecting body & pose', 'Warping saree fabric', 'Rendering result'].map((step, i) => (
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
                  Regenerate
                </button>
              </div>
            </div>

            <div>
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
      </div>
    </div>
  );
}
