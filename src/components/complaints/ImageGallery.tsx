import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Image, Loader2, StickyNote } from 'lucide-react';
import { useSignedImageUrls } from '@/hooks/useSignedImageUrls';

interface ImageNoteData {
  title?: string;
  description?: string;
}

interface ImageGalleryProps {
  images: string[];
  imageNotes?: Record<string, string | ImageNoteData>;
}

export function ImageGallery({ images, imageNotes }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { signedUrls, loading } = useSignedImageUrls(images);

  if (!images || images.length === 0) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading images...</span>
      </div>
    );
  }

  const getNoteForIndex = (index: number): ImageNoteData | undefined => {
    if (!imageNotes) return undefined;
    const path = images[index];
    const raw = imageNotes[path];
    if (!raw) return undefined;
    // Support legacy string format
    if (typeof raw === 'string') return { description: raw };
    return raw as ImageNoteData;
  };

  const hasNoteAtIndex = (index: number): boolean => {
    const note = getNoteForIndex(index);
    return !!(note && (note.title || note.description));
  };

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? signedUrls.length - 1 : selectedIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === signedUrls.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image className="h-4 w-4" />
          <span>Evidence Images ({signedUrls.length})</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {signedUrls.map((url, index) => (
            <div key={index} className="relative w-20">
              <button
                onClick={() => openLightbox(index)}
                className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
              {hasNoteAtIndex(index) && (
                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <StickyNote className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox with WhatsApp-style caption */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur">
          <div className="relative">


            {signedUrls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {selectedIndex !== null && (
              <div className="flex flex-col items-center p-4 min-h-[400px]">
                <img
                  src={signedUrls[selectedIndex]}
                  alt={`Evidence ${selectedIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
                {/* WhatsApp-style caption overlay */}
                {hasNoteAtIndex(selectedIndex) && (() => {
                  const note = getNoteForIndex(selectedIndex)!;
                  return (
                    <div className="mt-3 w-full max-w-lg rounded-lg bg-muted/80 backdrop-blur-sm px-4 py-3">
                      {note.title && (
                        <p className="font-medium text-sm text-foreground">{note.title}</p>
                      )}
                      {note.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{note.description}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {signedUrls.length > 1 && selectedIndex !== null && (
              <div className="text-center pb-4 text-sm text-muted-foreground">
                {selectedIndex + 1} / {signedUrls.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
