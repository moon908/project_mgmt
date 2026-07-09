import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma, isDbConnected } from './db';
import bcrypt from 'bcrypt';
import { INITIAL_USERS } from './mockDb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        // Database-backed flow
        if (isDbConnected) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            throw new Error('No user found with this email');
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) {
            throw new Error('Incorrect password');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
          };
        }

        // Fallback simulated flow
        const mockUser = INITIAL_USERS.find(u => u.email === credentials.email);
        if (!mockUser) {
          // Allow custom mock user registration simulation
          return {
            id: `u-${Date.now()}`,
            name: credentials.email.split('@')[0],
            email: credentials.email,
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            role: 'OWNER'
          };
        }
        return {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          image: mockUser.avatar,
          role: mockUser.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'projectflow-ai-development-secret-key-12345',
  pages: {
    signIn: '/landing',
  }
};
