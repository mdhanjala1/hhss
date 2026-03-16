import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://teqlqiijqozxffbkdeqg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcWxxaWlqcW96eGZmYmtkZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTg0MjEsImV4cCI6MjA4ODU5NDQyMX0.oKY3ryLK4T4hUvc5HZSEvnyZt825gjE3VdiXe9BGmpY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadToCloudinary = async (file: File, preset?: string) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmzlwccgp';
  const uploadPreset = preset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'shilposhop_artworks';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('Image upload failed');

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
    thumbnail: data.eager?.[0]?.secure_url || data.secure_url,
  };
};
