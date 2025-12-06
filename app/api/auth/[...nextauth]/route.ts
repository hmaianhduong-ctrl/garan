import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 1. Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Credentials (Email/Pass)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) }
        });

        // Demo: So sánh pass thô
        if (user && user.password === String(credentials.password)) {
          return { 
            id: user.id.toString(), 
            name: user.name, 
            email: user.email, 
            // image: user.image,
            role: user.role 
          };
        }
        return null;
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({ where: { email: user.email! } });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "Google User",
                // image: user.image,
                role: 'VIEWER',
                password: '',
              }
            });
          }
          return true;
        } catch (error) {
          console.error("Lỗi lưu user Google:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  
  secret: process.env.AUTH_SECRET,
});

export const { GET, POST } = handlers;