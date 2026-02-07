import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isStarting, setIsStarting] = useState(false);

  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
  }, []);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (isStarting) return;
    
    try {
      setIsStarting(true);
      setError(null);
      
      // Stop any existing stream first
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before playing
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, stopCamera]);

  useEffect(() => {
    if (open && !capturedImage) {
      startCamera(facingMode);
    }
    
    if (!open) {
      stopCamera();
      setCapturedImage(null);
    }
  }, [open, facingMode, capturedImage, startCamera, stopCamera]);
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  const toggleFacingMode = () => {
    if (isStarting || capturedImage) return;
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-black [&>button]:hidden">
        <div className="relative">
          {/* Camera switch button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFacingMode}
            disabled={isStarting || !!capturedImage}
            className="absolute top-2 left-2 z-20 text-white hover:bg-white/20"
          >
            <SwitchCamera className="h-5 w-5" />
          </Button>

          {/* Video/Image display */}
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
            {error ? (
              <div className="text-center p-6">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-white text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => startCamera(facingMode)}
                >
                  Try Again
                </Button>
              </div>
            ) : capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="p-4 bg-black flex justify-center gap-4">
            {capturedImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex-1 max-w-[140px]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 max-w-[140px]"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={handleCapture}
                disabled={!!error}
                className="rounded-full w-16 h-16 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}