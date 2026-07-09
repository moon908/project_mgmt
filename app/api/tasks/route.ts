import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');

    if (isDbConnected) {
      const tasks = await prisma.task.findMany({
        where: {
          AND: [
            projectId ? { projectId } : {},
            assigneeId ? { assigneeId } : {}
          ]
        },
        include: {
          comments: {
            orderBy: { createdAt: 'asc' }
          },
          attachments: true
        }
      });
      return NextResponse.json(tasks);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, title, description, status, priority, storyPoints, dueDate, assigneeId, labels, estimatedTime } = body;

    if (isDbConnected) {
      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          description,
          status: status || 'TODO',
          priority: priority || 'medium',
          storyPoints: storyPoints ? parseInt(storyPoints) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId,
          labels: labels || [],
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : 0,
          subtasks: []
        },
        include: {
          comments: true,
          attachments: true
        }
      });
      return NextResponse.json(task);
    }

    return NextResponse.json({ id: `t-${Date.now()}`, comments: [], attachments: [], ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, status, priority, storyPoints, dueDate, assigneeId, subtasks, labels, estimatedTime, timeSpent } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
    }

    if (isDbConnected) {
      const task = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          status,
          priority,
          storyPoints: storyPoints !== undefined ? (storyPoints ? parseInt(storyPoints) : null) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId: assigneeId !== undefined ? assigneeId : undefined,
          subtasks: subtasks !== undefined ? subtasks : undefined,
          labels: labels !== undefined ? labels : undefined,
          estimatedTime: estimatedTime !== undefined ? parseInt(estimatedTime) : undefined,
          timeSpent: timeSpent !== undefined ? parseInt(timeSpent) : undefined
        },
        include: {
          comments: true,
          attachments: true
        }
      });
      return NextResponse.json(task);
    }

    return NextResponse.json(body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
    }

    if (isDbConnected) {
      await prisma.task.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
