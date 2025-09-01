import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            patientProfile: true,
            doctorProfile: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Check if user is locked or suspended
        if (user.accountStatus !== "active") {
          throw new Error("Account is not active")
        }

        // For doctors, check if they are verified
        if (user.role === UserRole.DOCTOR && user.verificationStatus !== "VERIFIED") {
          throw new Error("Doctor account is not verified")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
          accountStatus: user.accountStatus,
          patientProfile: user.patientProfile,
          doctorProfile: user.doctorProfile
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.avatar = user.avatar
        token.isVerified = user.isVerified
        token.verificationStatus = user.verificationStatus
        token.accountStatus = user.accountStatus
        token.patientProfile = user.patientProfile
        token.doctorProfile = user.doctorProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.avatar = token.avatar as string
        session.user.isVerified = token.isVerified as boolean
        session.user.verificationStatus = token.verificationStatus as string
        session.user.accountStatus = token.accountStatus as string
        session.user.patientProfile = token.patientProfile as any
        session.user.doctorProfile = token.doctorProfile as any
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
}

export default NextAuth(authOptions)