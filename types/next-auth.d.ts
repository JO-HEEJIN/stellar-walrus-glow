import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      brandId?: string
      username?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    brandId?: string
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    brandId?: string
    username?: string
    refreshToken?: string
  }
}