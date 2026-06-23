
CREATE POLICY "Usuário gerencia seus documentos - leitura"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário gerencia seus documentos - upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário gerencia seus documentos - update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuário gerencia seus documentos - delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
