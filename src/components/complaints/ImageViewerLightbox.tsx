import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Download,
} from 'lucide-react';

interface ImageNote {
  title?: string;
  description?: string;
}

interface ImageViewerLightboxProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  getNote?: (index: number) => ImageNote | undefined;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

export function ImageViewerLightbox({
  images,
  selectedIndex,
  onClose,
  onIndexChange,
  getNote,
}: ImageViewerLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom/pan on image change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedIndex]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - ZOOM_STEP, MIN_ZOOM);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((z) => Math.min(z + ZOOM_STEP * 0.5, MAX_ZOOM));
      } else {
        setZoom((z) => {
          const next = Math.max(z - ZOOM_STEP * 0.5, MIN_ZOOM);
          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    },
    []
  );

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: panStart.current.x + (e.clientX - dragStart.current.x),
        y: panStart.current.y + (e.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag (pinch zoom handled via CSS touch-action)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    panStart.current = { ...pan };
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPan({
        x: panStart.current.x + (touch.clientX - dragStart.current.x),
        y: panStart.current.y + (touch.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleTouchEnd = () => setIsDragging(false);

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  const handleDownload = async () => {
    if (selectedIndex === null) return;
    const url = images[selectedIndex];
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `evidence-${selectedIndex + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      onIndexChange(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      onIndexChange(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const note = selectedIndex !== null && getNote ? getNote(selectedIndex) : undefined;
  const hasNote = !!(note && (note.title || note.description));

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur">
        <div ref={containerRef} className="relative flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-center gap-1 py-2 px-4 border-b border-border bg-muted/50">
            <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleReset} title="Reset Zoom" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleFullscreen} title="Fullscreen" className="h-8 w-8">
              <Maximize className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} title="Download" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image area */}
          {selectedIndex !== null && (
            <div
              className="flex flex-col items-center p-4 min-h-[400px] overflow-hidden"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <img
                src={images[selectedIndex]}
                alt={`Evidence ${selectedIndex + 1}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg select-none"
                draggable={false}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
              />

              {/* WhatsApp-style caption */}
              {hasNote && (
                <div className="mt-3 w-full max-w-lg rounded-lg bg-muted/80 backdrop-blur-sm px-4 py-3">
                  {note!.title && (
                    <p className="font-medium text-sm text-foreground">{note!.title}</p>
                  )}
                  {note!.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{note!.description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Counter */}
          {images.length > 1 && selectedIndex !== null && (
            <div className="text-center pb-4 text-sm text-muted-foreground">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
