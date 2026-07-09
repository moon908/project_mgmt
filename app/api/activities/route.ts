import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (isDbConnected) {
      const activities = await prisma.activity.findMany({
        where: projectId ? { projectId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return NextResponse.json(activities);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, targetType, targetName, projectId, taskId } = body;

    if (isDbConnected) {
      const activity = await prisma.activity.create({
        data: {
          userId,
          action,
          targetType,
          targetName,
          projectId,
          taskId
        }
      });
      return NextResponse.json(activity);
    }
    return NextResponse.json({ id: `act-${Date.now()}`, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
