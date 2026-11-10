'use client';

import { useState, useEffect, useRef } from 'react';
import { Chat } from '@/components/Chat';
import { FileUpload } from '@/components/FileUpload';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate, formatBytes } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
  uploads: { id: string; originalName: string; mimeType: string; size: number; url: string; createdAt: string }[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  const [uploading, setUploading] = useState(false);

  const fetchProject = async () => {
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/projects/${resolvedParams.id}`);
      const data = await res.json();
      if (data.project) setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handleUploadComplete = () => {
    fetchProject();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-48 bg-dark-200 dark:bg-dark-700 rounded" />
            <div className="h-4 w-64 bg-dark-200 dark:bg-dark-700 rounded" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-6 animate-pulse"><div className="h-4 w-1/4 bg-dark-200 dark:bg-dark-700 rounded mb-4" /><div className="space-y-3"><div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" /><div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-1/2" /><div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-1/4" /></div></div>)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Proyecto no encontrado</h2>
        <Link href="/dashboard" className="text-primary-500 hover:underline">Volver a proyectos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">{project.name}</h1>
          {project.description && <p className="text-dark-500 dark:text-dark-400 mt-1">{project.description}</p>}
          <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">Creado {formatDate(project.createdAt)} • Actualizado {formatDate(project.updatedAt)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-200 dark:border-dark-700">
        <nav className="flex gap-1 px-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'chat'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
            )}
          >
            Chat con Alfa
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'files'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
            )}
          >
            Archivos ({project.uploads.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="h-[calc(100vh-320px)] min-h-[500px]">
          <Chat projectId={project.id} />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="space-y-4">
          <FileUpload projectId={project.id} onUploadComplete={handleUploadComplete} />
          
          {project.uploads.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">Archivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">Tamaño</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                  {project.uploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {upload.mimeType.startsWith('image/') ? (
                            <img src={upload.url} alt={upload.originalName} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-dark-100 dark:bg-dark-700 flex items-center justify-center">
                              <svg className="h-5 w-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate max-w-xs">{upload.originalName}</p>
                            <p className="text-xs text-dark-400 dark:text-dark-500">{upload.mimeType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                          {upload.mimeType.split('/')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{formatBytes(upload.size)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600 dark:text-dark-400">{formatDate(upload.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a href={upload.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                          <Upload className="h-3.5 w-3.5" /> Descargar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {project.uploads.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 border-dashed">
              <Upload className="mx-auto h-12 w-12 text-dark-300 dark:text-dark-600 mb-4" />
              <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-1">No hay archivos aún</h3>
              <p className="text-dark-500 dark:text-dark-400">Sube tus primeros archivos usando el formulario de arriba</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}