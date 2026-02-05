 import { useState } from 'react';
 import { Dialog, DialogContent } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { ChevronLeft, ChevronRight, X, Image } from 'lucide-react';
 
 interface ImageGalleryProps {
   images: string[];
 }
 
 export function ImageGallery({ images }: ImageGalleryProps) {
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
 
   if (!images || images.length === 0) {
     return null;
   }
 
   const openLightbox = (index: number) => setSelectedIndex(index);
   const closeLightbox = () => setSelectedIndex(null);
   
   const goToPrevious = () => {
     if (selectedIndex !== null) {
       setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
     }
   };
   
   const goToNext = () => {
     if (selectedIndex !== null) {
       setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
     }
   };
 
   return (
     <>
       <div className="space-y-3">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <Image className="h-4 w-4" />
           <span>Evidence Images ({images.length})</span>
         </div>
         <div className="flex flex-wrap gap-3">
           {images.map((url, index) => (
             <button
               key={index}
               onClick={() => openLightbox(index)}
               className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
             >
               <img
                 src={url}
                 alt={`Evidence ${index + 1}`}
                 className="w-full h-full object-cover"
               />
             </button>
           ))}
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
 
             {selectedIndex !== null && (
               <div className="flex items-center justify-center p-4 min-h-[400px]">
                 <img
                   src={images[selectedIndex]}
                   alt={`Evidence ${selectedIndex + 1}`}
                   className="max-w-full max-h-[70vh] object-contain rounded-lg"
                 />
               </div>
             )}
 
             {images.length > 1 && selectedIndex !== null && (
               <div className="text-center pb-4 text-sm text-muted-foreground">
                 {selectedIndex + 1} / {images.length}
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 }