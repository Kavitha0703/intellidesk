 import { useState, useRef } from 'react';
 import { Button } from '@/components/ui/button';
 import { Plus, X, Image, Loader2 } from 'lucide-react';
 
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
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length === 0) return;
 
     const remainingSlots = maxImages - images.length;
     const filesToAdd = files.slice(0, remainingSlots);
 
     // Create previews
     filesToAdd.forEach((file) => {
       const reader = new FileReader();
       reader.onloadend = () => {
         setPreviews((prev) => [...prev, reader.result as string]);
       };
       reader.readAsDataURL(file);
     });
 
     onImagesChange([...images, ...filesToAdd]);
     
     // Reset input
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const removeImage = (index: number) => {
     const newImages = images.filter((_, i) => i !== index);
     const newPreviews = previews.filter((_, i) => i !== index);
     onImagesChange(newImages);
     setPreviews(newPreviews);
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
             <span className="text-xs">Add</span>
           </button>
         )}
       </div>
 
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