import { useState } from 'react';
import { Image, Loader2, StickyNote } from 'lucide-react';
import { useSignedImageUrls } from '@/hooks/useSignedImageUrls';
import { ImageViewerLightbox, ComplaintMetadata } from './ImageViewerLightbox';

interface ImageNoteData {
  title?: string;
  description?: string;
}

interface ImageGalleryProps {
  images: string[];
  imageNotes?: Record<string, string | ImageNoteData>;
  complaintMeta?: ComplaintMetadata;
}

export function ImageGallery({ images, imageNotes, complaintMeta }: ImageGalleryProps) {
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

      <ImageViewerLightbox
        images={signedUrls}
        selectedIndex={selectedIndex}
        onClose={closeLightbox}
        onIndexChange={setSelectedIndex}
        getNote={getNoteForIndex}
        complaintMeta={complaintMeta}
      />
    </>
  );
}
