
CREATE POLICY "Owners upload propostas pdfs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'propostas' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners read propostas pdfs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'propostas' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners delete propostas pdfs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'propostas' AND (storage.foldername(name))[1] = auth.uid()::text);
