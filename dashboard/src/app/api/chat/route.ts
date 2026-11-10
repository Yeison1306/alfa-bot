import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleAgentMessage, ChatMessage } from '@/lib/agent';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { messages, projectId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    // Save user message to database if projectId provided
    if (projectId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg.role === 'user') {
        await prisma.message.create({
          data: {
            role: 'user',
            content: lastUserMsg.content,
            projectId,
            userId,
          },
        });
      }
    }

    // Get response from agent
    const response = await handleAgentMessage(messages as ChatMessage[], userId);

    // Save assistant response
    if (projectId) {
      await prisma.message.create({
        data: {
          role: 'assistant',
          content: response,
          projectId,
          userId,
        },
      });
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}