import { useState, useRef, useEffect } from 'react';
import { Plus, X, Image } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews when images change
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

    // Validate file sizes (max 5MB each)
    const validFiles = filesToAdd.filter(file => file.size <= 5 * 1024 * 1024);

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group"
          >
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
        ))}
        
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">Add Image</span>
          </button>
        )}
      </div>

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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