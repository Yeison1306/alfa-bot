'use client';

import { Folder, MessageSquare, FileText, Clock, MoreVertical, Trash2, Edit2, Download } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    _count: { messages: number; uploads: number };
    uploads: { id: string; originalName: string; mimeType: string; size: number; url: string }[];
  };
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Folder className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-dark-900 dark:text-dark-100 truncate">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-dark-400 dark:text-dark-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {project._count.messages} mensajes
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {project._count.uploads} archivos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent uploads preview */}
      {project.uploads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
          <div className="flex flex-wrap gap-2">
            {project.uploads.slice(0, 3).map((upload) => (
              <a
                key={upload.id}
                href={upload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-50 dark:bg-dark-900 rounded text-dark-600 dark:text-dark-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                {upload.mimeType.startsWith('image/') ? (
                  <img src={upload.url} alt={upload.originalName} className="h-4 w-4 rounded" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span className="truncate max-w-[120px]">{upload.originalName}</span>
              </a>
            ))}
            {project.uploads.length > 3 && (
              <span className="px-2 py-1 text-xs text-dark-400 dark:text-dark-500">
                +{project.uploads.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions menu */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700">
            <MoreVertical className="h-5 w-5 text-dark-400" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 py-1 z-10">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
              <Edit2 className="h-4 w-4" /> Editar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-dark-100 dark:hover:bg-dark-700">
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}