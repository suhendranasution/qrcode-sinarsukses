import { supabase } from "@/lib/supabase";

export async function uploadCertificateFile(file: File): Promise<string> {
  try {
    console.log('Uploading file:', file.name);

    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('File public URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadCertificateFile:', error);
    throw error;
  }
}

export async function deleteCertificateFile(fileUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const filePath = `certificates/${fileName}`;

    console.log('Deleting file:', filePath);

    const { error } = await supabase.storage
      .from('certificates')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error in deleteCertificateFile:', error);
    throw error;
  }
}