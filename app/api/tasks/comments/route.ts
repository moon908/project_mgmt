import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { taskId, userId, content } = await req.json();

    if (!taskId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required comment fields' }, { status: 400 });
    }

    if (isDbConnected) {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          userId,
          content
        }
      });
      return NextResponse.json(comment);
    }

    return NextResponse.json({
      id: `c-${Date.now()}`,
      taskId,
      userId,
      content,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
