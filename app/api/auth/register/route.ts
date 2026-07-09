import { NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    if (isDbConnected) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER'
        }
      });

      // Create a default workspace for the user
      const workspace = await prisma.workspace.create({
        data: {
          name: `${name || 'My'}'s Workspace`,
          slug: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          ownerId: user.id,
          members: {
            connect: { id: user.id }
          }
        }
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: workspace.id
      });
    }

    // Fallback simulation
    return NextResponse.json({
      id: `u-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      workspaceId: `w-default`
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
