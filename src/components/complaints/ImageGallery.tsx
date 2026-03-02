import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Image, Loader2 } from 'lucide-react';
import { useSignedImageUrls } from '@/hooks/useSignedImageUrls';

interface ImageGalleryProps {
  images: string[];
  imageNotes?: Record<string, string>;
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

  const getNoteForIndex = (index: number): string | undefined => {
    if (!imageNotes) return undefined;
    // Try matching by original image path
    const path = images[index];
    return imageNotes[path];
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
          {signedUrls.map((url, index) => {
            const note = getNoteForIndex(index);
            return (
              <div key={index} className="w-20 space-y-1">
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
                {note && (
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2" title={note}>
                    📝 {note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            
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
                  className="max-w-full max-h-[65vh] object-contain rounded-lg"
                />
                {getNoteForIndex(selectedIndex) && (
                  <p className="mt-3 text-sm text-muted-foreground text-center max-w-md">
                    📝 {getNoteForIndex(selectedIndex)}
                  </p>
                )}
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
