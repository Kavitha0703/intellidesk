import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch signed URLs for images stored in a private Supabase storage bucket.
 * This is necessary because the complaint-images bucket is private for security.
 * 
 * @param imagePaths - Array of storage paths or legacy public URLs
 * @param bucketName - The storage bucket name (default: 'complaint-images')
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Object containing signedUrls array and loading state
 */
export function useSignedImageUrls(
  imagePaths: string[] | null | undefined,
  bucketName: string = 'complaint-images',
  expiresIn: number = 3600
) {
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!imagePaths || imagePaths.length === 0) {
        setSignedUrls([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const urls: string[] = [];

      for (const imagePath of imagePaths) {
        try {
          // Extract the file path from legacy public URLs or use directly if already a path
          let filePath = imagePath;
          
          // Handle legacy public URLs - extract the path after the bucket name
          if (imagePath.includes('/storage/v1/object/public/')) {
            const parts = imagePath.split(`/storage/v1/object/public/${bucketName}/`);
            if (parts.length > 1) {
              filePath = parts[1];
            }
          }
          
          // Generate signed URL
          const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, expiresIn);

          if (error) {
            console.error('Error creating signed URL:', error);
            // Fallback to original path/URL if signing fails
            urls.push(imagePath);
          } else if (data?.signedUrl) {
            urls.push(data.signedUrl);
          }
        } catch (err) {
          console.error('Error processing image path:', err);
          // Fallback to original
          urls.push(imagePath);
        }
      }

      setSignedUrls(urls);
      setLoading(false);
    };

    fetchSignedUrls();
  }, [imagePaths, bucketName, expiresIn]);

  return { signedUrls, loading };
}
