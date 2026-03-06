import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Download,
  FileText,
  Archive,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

interface ImageNote {
  title?: string;
  description?: string;
}

export interface ComplaintMetadata {
  id?: string;
  user_name?: string;
  email?: string;
  issue_type?: string;
  severity?: string;
  description?: string;
  created_at?: string;
}

interface ImageViewerLightboxProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  getNote?: (index: number) => ImageNote | undefined;
  complaintMeta?: ComplaintMetadata;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

function resizeImageBlob(blob: Blob, quality: number, maxDim?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (maxDim && (w > maxDim || h > maxDim)) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function ImageViewerLightbox({
  images,
  selectedIndex,
  onClose,
  onIndexChange,
  getNote,
  complaintMeta,
}: ImageViewerLightboxProps) {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
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
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    panStart.current = { ...pan };
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: panStart.current.x + (touch.clientX - dragStart.current.x),
      y: panStart.current.y + (touch.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleTouchEnd = () => setIsDragging(false);

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  // Download handlers
  const downloadOriginal = async () => {
    if (selectedIndex === null) return;
    setIsDownloading(true);
    try {
      const blob = await fetchImageAsBlob(images[selectedIndex]);
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      triggerDownload(blob, `evidence_${selectedIndex + 1}_original.${ext}`);
      toast({ title: 'Downloaded', description: 'Original image downloaded.' });
    } catch {
      window.open(images[selectedIndex], '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCompressed = async (quality: number, label: string, maxDim?: number) => {
    if (selectedIndex === null) return;
    setIsDownloading(true);
    try {
      const blob = await fetchImageAsBlob(images[selectedIndex]);
      const resized = await resizeImageBlob(blob, quality, maxDim);
      triggerDownload(resized, `evidence_${selectedIndex + 1}_${label}.jpg`);
      toast({ title: 'Downloaded', description: `${label} quality image downloaded.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to compress image.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (selectedIndex === null) return;
    setIsDownloading(true);
    try {
      const blob = await fetchImageAsBlob(images[selectedIndex]);
      const imgUrl = URL.createObjectURL(blob);

      const doc = new jsPDF();
      let y = 14;

      // Title
      doc.setFontSize(16);
      doc.text('Complaint Evidence Report', 14, y);
      y += 10;

      // Metadata
      if (complaintMeta) {
        doc.setFontSize(10);
        if (complaintMeta.id) { doc.text(`Complaint ID: ${complaintMeta.id}`, 14, y); y += 6; }
        if (complaintMeta.user_name) { doc.text(`User: ${complaintMeta.user_name}`, 14, y); y += 6; }
        if (complaintMeta.email) { doc.text(`Email: ${complaintMeta.email}`, 14, y); y += 6; }
        if (complaintMeta.issue_type) { doc.text(`Issue Type: ${complaintMeta.issue_type}`, 14, y); y += 6; }
        if (complaintMeta.severity) { doc.text(`Severity: ${complaintMeta.severity}`, 14, y); y += 6; }
        if (complaintMeta.created_at) { doc.text(`Date: ${new Date(complaintMeta.created_at).toLocaleDateString()}`, 14, y); y += 6; }
        if (complaintMeta.description) {
          y += 4;
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(`Description: ${complaintMeta.description}`, 180);
          doc.text(lines, 14, y);
          y += lines.length * 5 + 4;
        }
      }

      // Image
      y += 4;
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgUrl;
      });

      const maxW = 180;
      const maxH = 200 - y;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = img.width * ratio;
      const h = img.height * ratio;
      doc.addImage(imgUrl, 'JPEG', 14, y, w, h);
      y += h + 6;

      // Note
      const note = getNote?.(selectedIndex);
      if (note && (note.title || note.description)) {
        if (y > 260) { doc.addPage(); y = 14; }
        doc.setFontSize(10);
        if (note.title) { doc.text(`Image Note: ${note.title}`, 14, y); y += 6; }
        if (note.description) {
          const noteLines = doc.splitTextToSize(note.description, 180);
          doc.text(noteLines, 14, y);
        }
      }

      URL.revokeObjectURL(imgUrl);
      const idSlice = complaintMeta?.id ? complaintMeta.id.slice(0, 8) : 'evidence';
      doc.save(`${idSlice}_image_${selectedIndex + 1}.pdf`);
      toast({ title: 'Downloaded', description: 'PDF report downloaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAllZip = async () => {
    if (images.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(complaintMeta?.id ? `complaint_${complaintMeta.id.slice(0, 8)}` : 'evidence');

      for (let i = 0; i < images.length; i++) {
        const blob = await fetchImageAsBlob(images[i]);
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        folder!.file(`image_${i + 1}.${ext}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const name = complaintMeta?.id ? `complaint_${complaintMeta.id.slice(0, 8)}_evidence.zip` : 'evidence_images.zip';
      triggerDownload(zipBlob, name);
      toast({ title: 'Downloaded', description: `All ${images.length} images downloaded as ZIP.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to create ZIP file.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const goToPrevious = () => {
    if (selectedIndex !== null)
      onIndexChange(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex !== null)
      onIndexChange(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  const note = selectedIndex !== null && getNote ? getNote(selectedIndex) : undefined;
  const hasNote = !!(note && (note.title || note.description));

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur">
        <div ref={containerRef} className="relative flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-center gap-1 py-2 px-4 border-b border-border bg-muted/50 flex-wrap">
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

            {/* Download dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Download Options" className="h-8 w-8" disabled={isDownloading}>
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuItem onClick={() => downloadCompressed(0.95, '1440p', 2560)} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  1440p
                  <span className="ml-auto text-xs text-muted-foreground">2560px</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCompressed(0.92, '1080p', 1920)} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  1080p
                  <span className="ml-auto text-xs text-muted-foreground">1920px</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCompressed(0.85, '720p', 1280)} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  720p
                  <span className="ml-auto text-xs text-muted-foreground">1280px</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCompressed(0.75, '480p', 854)} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  480p
                  <span className="ml-auto text-xs text-muted-foreground">854px</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCompressed(0.6, '360p', 640)} className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  360p
                  <span className="ml-auto text-xs text-muted-foreground">640px</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadAsPDF} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
                {images.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={downloadAllZip} className="gap-2">
                      <Archive className="h-4 w-4" />
                      Download All Images (ZIP)
                      <span className="ml-auto text-xs text-muted-foreground">{images.length}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
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

              {hasNote && (
                <div className="mt-3 w-full max-w-lg rounded-lg bg-muted/80 backdrop-blur-sm px-4 py-3">
                  {note!.title && <p className="font-medium text-sm text-foreground">{note!.title}</p>}
                  {note!.description && <p className="text-sm text-muted-foreground mt-0.5">{note!.description}</p>}
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
