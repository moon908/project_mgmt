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
      const events = await prisma.calendarEvent.findMany({
        where: { userId },
        orderBy: { start: 'asc' }
      });
      return NextResponse.json(events);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, start, end, type, projectId, taskId, userId } = body;

    if (isDbConnected) {
      const event = await prisma.calendarEvent.create({
        data: {
          title,
          description,
          start: new Date(start),
          end: new Date(end),
          type,
          projectId,
          taskId,
          userId
        }
      });
      return NextResponse.json(event);
    }
    return NextResponse.json({ id: `e-${Date.now()}`, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    if (isDbConnected) {
      await prisma.calendarEvent.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
