import { useState, useRef, useEffect } from 'react';
import { Plus, X, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  imageNotes: Record<number, string>;
  onImageNotesChange: (notes: Record<number, string>) => void;
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
    // Reindex notes
    const newNotes: Record<number, string> = {};
    Object.entries(imageNotes).forEach(([key, value]) => {
      const k = Number(key);
      if (k < index) newNotes[k] = value;
      else if (k > index) newNotes[k - 1] = value;
    });
    onImagesChange(newImages);
    onImageNotesChange(newNotes);
  };

  const handleNoteChange = (index: number, note: string) => {
    if (note.length > 200) return;
    onImageNotesChange({ ...imageNotes, [index]: note });
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="w-32 space-y-1.5">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {!disabled && (
              <Input
                type="text"
                placeholder="Add note (optional)"
                value={imageNotes[index] || ''}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                className="h-7 text-xs px-2"
                maxLength={200}
              />
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
        <Image className="inline h-3 w-3 mr-1" />
        {images.length}/{maxImages} images • Max 5MB each
      </p>
    </div>
  );
}
