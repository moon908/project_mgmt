import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (isDbConnected) {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(notifications);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, id, title, message, type, projectId, taskId } = body;

    if (isDbConnected) {
      if (action === 'mark_all_read') {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
      } else if (action === 'clear_all') {
        await prisma.notification.deleteMany({
          where: { userId }
        });
      } else if (action === 'mark_read' && id) {
        await prisma.notification.update({
          where: { id },
          data: { isRead: true }
        });
      } else if (action === 'create') {
        const notif = await prisma.notification.create({
          data: {
            title,
            message,
            type: type || 'TASK_ASSIGNED',
            userId,
            isRead: false
          }
        });
        return NextResponse.json(notif);
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
