import { useState, useRef, useEffect } from 'react';
import { Plus, X, Pencil, StickyNote, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface ImageNote {
  title?: string;
  description?: string;
}

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  imageNotes: Record<number, ImageNote>;
  onImageNotesChange: (notes: Record<number, ImageNote>) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ 
  images, 
  onImagesChange,
  imageNotes,
  onImageNotesChange,
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [noteModalIndex, setNoteModalIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: string[] = [];
      for (const file of images) {
        const preview = await readFileAsDataURL(file);
        newPreviews.push(preview);
      }
      setPreviews(newPreviews);
    };

    if (images.length > 0) {
      generatePreviews();
    } else {
      setPreviews([]);
    }
  }, [images]);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024;
    
    const validFiles = filesToAdd.filter(file => 
      file.size <= maxFileSize && allowedTypes.includes(file.type)
    );

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newNotes: Record<number, ImageNote> = {};
    Object.entries(imageNotes).forEach(([key, value]) => {
      const k = Number(key);
      if (k < index) newNotes[k] = value;
      else if (k > index) newNotes[k - 1] = value;
    });
    onImagesChange(newImages);
    onImageNotesChange(newNotes);
  };

  const openNoteModal = (index: number) => {
    const existing = imageNotes[index];
    setEditTitle(existing?.title || '');
    setEditDescription(existing?.description || '');
    setNoteModalIndex(index);
  };

  const handleSaveNote = () => {
    if (noteModalIndex === null) return;
    const title = editTitle.trim();
    const description = editDescription.trim();
    if (!title && !description) return;
    onImageNotesChange({
      ...imageNotes,
      [noteModalIndex]: { title: title || undefined, description: description || undefined },
    });
    setNoteModalIndex(null);
  };

  const handleDeleteNote = () => {
    if (noteModalIndex === null) return;
    const newNotes = { ...imageNotes };
    delete newNotes[noteModalIndex];
    onImageNotesChange(newNotes);
    setNoteModalIndex(null);
  };

  const hasNote = (index: number) => {
    const note = imageNotes[index];
    return note && (note.title || note.description);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative w-32 h-24 rounded-lg overflow-hidden border border-border group">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
            {/* Note indicator badge */}
            {hasNote(index) && (
              <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground rounded-full p-0.5 pointer-events-none">
                <StickyNote className="h-3 w-3" />
              </div>
            )}
            {!disabled && (
              <>
                {/* Pencil icon - top right */}
                <button
                  type="button"
                  onClick={() => openNoteModal(index)}
                  className="absolute top-1 right-7 p-1 rounded-full bg-background/80 text-foreground shadow-sm
                    opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-100
                    transition-opacity hover:bg-background"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                {/* Remove icon */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow-sm
                    opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-100
                    transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
        
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">Add Image</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images • Max 5MB each • Click ✏️ to add note
      </p>

      {/* Note Modal */}
      <Dialog open={noteModalIndex !== null} onOpenChange={(open) => { if (!open) setNoteModalIndex(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title (optional)</Label>
              <Input
                id="note-title"
                placeholder="e.g. Error screenshot"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value.slice(0, 100))}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-description">Description</Label>
              <Textarea
                id="note-description"
                placeholder="Describe what this image shows..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value.slice(0, 300))}
                className="min-h-[100px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">{editDescription.length}/300</p>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            {noteModalIndex !== null && hasNote(noteModalIndex) && (
              <Button variant="destructive" size="sm" onClick={handleDeleteNote} type="button">
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setNoteModalIndex(null)} type="button">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNote} type="button" disabled={!editTitle.trim() && !editDescription.trim()}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox with WhatsApp-style caption */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null); }}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur">
          <div className="relative">

            {previews.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLightboxIndex(lightboxIndex === 0 ? previews.length - 1 : (lightboxIndex ?? 0) - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                  type="button"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLightboxIndex(lightboxIndex === previews.length - 1 ? 0 : (lightboxIndex ?? 0) + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  type="button"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {lightboxIndex !== null && (
              <div className="flex flex-col items-center p-4 min-h-[400px]">
                <img
                  src={previews[lightboxIndex]}
                  alt={`Preview ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
                {hasNote(lightboxIndex) && (() => {
                  const note = imageNotes[lightboxIndex];
                  return (
                    <div className="mt-3 w-full max-w-lg rounded-lg bg-muted/80 backdrop-blur-sm px-4 py-3">
                      {note?.title && (
                        <p className="font-medium text-sm text-foreground">{note.title}</p>
                      )}
                      {note?.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{note.description}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {previews.length > 1 && lightboxIndex !== null && (
              <div className="text-center pb-4 text-sm text-muted-foreground">
                {lightboxIndex + 1} / {previews.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
