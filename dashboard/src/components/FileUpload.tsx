'use client';

import { useState, useCallback } from 'react';
import { Upload, File, Video, Image, Music, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  uploadId?: string;
  publicUrl?: string;
}

const ALLOWED_TYPES = [
  'image/',
  'video/',
  'audio/',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/',
  'application/json',
  'application/javascript',
  'application/typescript',
];

export function FileUpload({ projectId, onUploadComplete }: { projectId?: string; onUploadComplete?: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (size > 100 * 1024 * 1024) return 'El archivo supera el límite de 100MB';
    const isAllowed = ALLOWED_TYPES.some(type => file.type.startsWith(type) || file.type === type);
    if (!isAllowed) return 'Tipo de archivo no permitido';
    return null;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />;
    if (mimeType === 'application/pdf') return <File className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('zip')) return <File className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    try {
      // Get presigned URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadFile.file.name,
          mimeType: uploadFile.file.type,
          size: uploadFile.file.size,
          projectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener URL de subida');

      // Upload to S3
      await fetch(data.uploadUrl, {
        method: 'PUT',
        body: uploadFile.file,
        headers: { 'Content-Type': uploadFile.file.type },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          );
        },
      } as any);

      // Update record
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100, uploadId: data.uploadId, publicUrl: data.publicUrl } : f
        )
      );
      onUploadComplete?.();
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error', error: error.message } : f))
      );
    }
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        return;
      }
      setFiles((prev) => [
        ...prev,
        { id: crypto.randomUUID(), file, progress: 0, status: 'pending' },
      ]);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const startUploads = () => {
    files.filter((f) => f.status === 'pending').forEach(uploadFile);
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-6 transition-colors',
        dragActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-dark-200 dark:border-dark-700'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.zip,.json,.js,.ts,.jsx,.tsx"
      />

      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-dark-300 dark:text-dark-600 mb-4" />
        <p className="text-dark-600 dark:text-dark-400 mb-2">
          Arrastra archivos aquí o <button onClick={() => fileInputRef.current?.click()} className="text-primary-500 hover:underline">selecciónalos</button>
        </p>
        <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
          Imágenes, videos, audio, PDF, ZIP, código (máx. 100MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3 max-h-64 overflow-y-auto">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700">
              <div className="flex-shrink-0">{getFileIcon(f.file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">{f.file.name}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400">{formatBytes(f.file.size)}</p>
                {f.status === 'uploading' && (
                  <div className="mt-1 h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === 'error' && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {f.error}
                  </p>
                )}
                {f.status === 'completed' && (
                  <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Subido correctamente
                  </p>
                )}
              </div>
              {f.status === 'pending' && (
                <button
                  onClick={() => uploadFile(f)}
                  className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
                >
                  Subir
                </button>
              )}
              {(f.status === 'completed' || f.status === 'error') && (
                <button
                  onClick={() => removeFile(f.id)}
                  className="p-2 text-dark-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={startUploads}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
          >
            Subir {pendingCount} archivo{pendingCount > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {completedCount > 0 && (
        <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
          {completedCount} archivo{completedCount > 1 ? 's' : ''} subido{completedCount > 1 ? 's' : ''} correctamente
        </div>
      )}
    </div>
  );
}