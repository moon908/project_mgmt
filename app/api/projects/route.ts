import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (isDbConnected) {
      const projects = await prisma.project.findMany({
        where: workspaceId ? { workspaceId } : undefined,
        include: {
          tasks: true
        }
      });
      return NextResponse.json(projects);
    }

    return NextResponse.json([]); 
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, status, priority, dueDate, coverImage, tags, workspaceId } = body;

    if (isDbConnected) {
      let wsId = workspaceId;
      if (!wsId) {
        const firstWorkspace = await prisma.workspace.findFirst();
        wsId = firstWorkspace?.id;
      }

      if (!wsId) {
        return NextResponse.json({ error: 'No workspace found to attach project to' }, { status: 400 });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          status: status || 'ACTIVE',
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          coverImage,
          tags: tags || [],
          workspaceId: wsId
        }
      });
      return NextResponse.json(project);
    }

    return NextResponse.json({ id: `p-${Date.now()}`, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, status, priority, dueDate, coverImage, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    if (isDbConnected) {
      const project = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          coverImage,
          tags
        }
      });
      return NextResponse.json(project);
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
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    if (isDbConnected) {
      await prisma.project.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
