import { supabase } from "@/lib/supabase";

// Test database connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('brands').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    console.log('Database connection test successful');
    return true;
  } catch (err) {
    console.error('Database connection test error:', err);
    return false;
  }
}

// Debug function to check table structure
export async function debugTableStructure() {
  try {
    // Check if brands table exists and has user_id column
    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .limit(1);

    if (brandsError) {
      console.error('Error accessing brands table:', brandsError);
    } else {
      console.log('Brands table accessible, sample data:', brandsData);
    }

    // Check certificates table
    const { data: certsData, error: certsError } = await supabase
      .from('certificates')
      .select('*')
      .limit(1);

    if (certsError) {
      console.error('Error accessing certificates table:', certsError);
      console.error('Certificates error details:', JSON.stringify(certsError, null, 2));
    } else {
      console.log('Certificates table accessible, sample data:', certsData);
    }

    // Get brands for testing
    const { data: brandsList, error: brandsListError } = await supabase
      .from('brands')
      .select('id, name')
      .limit(1);

    if (brandsListError || !brandsList || brandsList.length === 0) {
      console.error('No brands available for testing');
      return false;
    }

    // Try to insert a test certificate
    const testSlug = 'test-certificate-' + Date.now();
    const { data: certInsertData, error: certInsertError } = await supabase
      .from('certificates')
      .insert({
        product_name: 'Test Certificate',
        product_slug: testSlug,
        certificate_url: 'https://example.com/test.pdf',
        brand_id: brandsList[0].id,
        user_id: 'admin'
      })
      .select()
      .single();

    if (certInsertError) {
      console.error('Error inserting test certificate:', certInsertError);
      console.error('Certificate insert error details:', JSON.stringify(certInsertError, null, 2));
    } else {
      console.log('Test certificate insert successful:', certInsertData);

      // Clean up test record
      await supabase
        .from('certificates')
        .delete()
        .eq('id', certInsertData.id);
    }

    return true;
  } catch (err) {
    console.error('Debug function error:', err);
    return false;
  }
}

// Brand CRUD operations
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data;
}

export async function createBrand(name: string, slug: string) {
  try {
    console.log('Creating brand with data:', { name, slug, user_id: "admin" });

    // First, let's try to bypass RLS temporarily to test
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        user_id: "admin",
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating brand:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Supabase error: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }

    console.log('Brand created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in createBrand function:', err);
    throw err;
  }
}

export async function updateBrand(id: string, updates: { name?: string; slug?: string }) {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand:', error);
    throw error;
  }

  return data;
}

export async function deleteBrand(id: string) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }

  return true;
}

// Certificate CRUD operations
export async function getCertificates() {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      brands (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }

  return data;
}

export async function createCertificate(
  productName: string,
  productSlug: string,
  certificateUrl: string,
  brandId: string,
  fileData?: string,
  fileMimeType?: string,
  fileName?: string
) {
  try {
    console.log('Creating certificate with data:', { productName, productSlug, certificateUrl, brandId, hasFileData: !!fileData });

    // Validate brandId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(brandId)) {
      console.error('Invalid brandId format:', brandId);
      throw new Error(`Invalid brand ID format: ${brandId}. Expected UUID format.`);
    }

    // Verify brand exists first
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .single();

    if (brandError || !brandData) {
      console.error('Brand not found:', brandId, brandError);
      throw new Error(`Brand with ID ${brandId} not found`);
    }

    console.log('Brand verified:', brandData);

    const insertData: {
      product_name: string;
      product_slug: string;
      certificate_url: string;
      brand_id: string;
      user_id: string;
      file_data?: string;
      file_mime_type?: string;
      file_name?: string;
    } = {
      product_name: productName,
      product_slug: productSlug,
      certificate_url: certificateUrl,
      brand_id: brandId,
      user_id: "00000000-0000-0000-0000-000000000000", // Static admin user UUID
    };

    // Add file data if provided
    if (fileData) {
      insertData.file_data = fileData;
      insertData.file_mime_type = fileMimeType;
      insertData.file_name = fileName;
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert(insertData)
      .select(`
        *,
        brands (
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error creating certificate:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Supabase error: ${error.message} (code: ${error.code}, hint: ${error.hint || 'none'})`);
    }

    console.log('Certificate created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in createCertificate function:', err);
    throw err;
  }
}

export async function updateCertificate(
  id: string,
  updates: {
    product_name?: string;
    product_slug?: string;
    certificate_url?: string;
    brand_id?: string;
    file_data?: string;
    file_mime_type?: string;
    file_name?: string;
  }
) {
  const { data, error } = await supabase
    .from('certificates')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      brands (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }

  return data;
}

export async function deleteCertificate(id: string) {
  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }

  return true;
}

// Get certificate by brand slug and product slug for public verification
export async function getCertificateBySlugs(brandSlug: string, productSlug: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      brands (
        id,
        name,
        slug
      )
    `)
    .eq('brands.slug', brandSlug)
    .eq('product_slug', productSlug)
    .single();

  if (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }

  return data;
}

// Utility functions
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateCertificateUrl(brandSlug: string, productSlug: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${brandSlug}/${productSlug}`;
}