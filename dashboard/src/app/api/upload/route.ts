import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPresignedUploadUrl } from '@/lib/s3';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const uploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().max(100 * 1024 * 1024), // 100MB max
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }

    const { filename, mimeType, size, projectId } = parsed.data;

    // Verify project ownership if provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
      }
    }

    const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl(filename, mimeType, userId);

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        filename: key,
        originalName: filename,
        mimeType,
        size,
        url: publicUrl,
        projectId,
        userId,
      },
    });

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}