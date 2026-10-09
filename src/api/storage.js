import { supabase } from './supabase';

// Generate a short-lived signed URL for a receipt in the private bucket.
// RLS enforces who can create the URL: owners for their own files, admins
// for all files.
export async function getReceiptSignedUrl(path, expiresIn = 60) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}