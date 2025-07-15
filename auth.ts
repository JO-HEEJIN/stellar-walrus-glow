import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { Role } from '@/types'

// Log configuration for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Auth Config Check:', {
    clientId: process.env.COGNITO_CLIENT_ID ? '✓' : '✗',
    clientSecret: process.env.COGNITO_CLIENT_SECRET ? '✓' : '✗',
    issuer: process.env.COGNITO_ISSUER ? '✓' : '✗',
    nextAuthUrl: process.env.NEXTAUTH_URL ? '✓' : '✗',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✓' : '✗',
  })
}

export const authConfig: NextAuthConfig = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      authorization: {
        params: {
          scope: 'openid email profile',
          response_type: 'code',
        },
      },
      // Add wellKnown endpoint for better compatibility
      wellKnown: `${process.env.COGNITO_ISSUER}/.well-known/openid-configuration`,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  callbacks: {
    // Called whenever a JWT is created, updated or accessed
    async jwt({ token, user, account, profile }) {
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Callback:', {
          hasUser: !!user,
          userEmail: user?.email,
          tokenEmail: token.email,
          currentRole: token.role,
        })
      }
      
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.sub = user.id // Ensure sub is set
        
        // Try to get user from database, but don't fail if DB is not available
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, brandId: true, status: true }
          })
          
          if (dbUser) {
            token.id = dbUser.id // Use database user ID for consistency
            token.role = dbUser.role
            token.brandId = dbUser.brandId || undefined
            token.status = dbUser.status
          }
        } catch (dbError) {
          console.log('Database not available, using default role assignment')
        }
        
      }

      // Handle refresh token
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token
      }

      // Get Cognito groups if available
      if (profile && 'cognito:groups' in profile) {
        const groups = (profile as any)['cognito:groups'] || []
        // Map Cognito groups to roles if needed
        if (groups.includes('master-admins')) {
          token.role = Role.MASTER_ADMIN
        } else if (groups.includes('brand-admins')) {
          token.role = Role.BRAND_ADMIN
        }
      }
      
      // Set role based on email for testing (this takes priority)
      if (user?.email) {
        if (user.email === 'master@k-fashions.com') {
          token.role = Role.MASTER_ADMIN
        } else if (user.email === 'brand@k-fashions.com') {
          token.role = Role.BRAND_ADMIN
          // Get the test brand ID for brand admin
          if (!token.brandId) {
            try {
              const testBrand = await prisma.brand.findFirst({
                where: { slug: 'test-brand' }
              })
              if (testBrand) {
                token.brandId = testBrand.id
              }
            } catch (e) {
              console.log('Could not fetch test brand')
            }
          }
        } else if (!token.role) {
          // Only set BUYER if no role was assigned yet
          token.role = Role.BUYER
        }
      }
      
      // Final fallback if still no role
      if (!token.role) {
        token.role = Role.BUYER
      }

      return token
    },

    // Session callback - runs whenever session is checked
    async session({ session, token }) {
      if (session?.user) {
        // Ensure we have a user ID
        session.user.id = token.id as string || token.sub as string
        session.user.role = token.role as string
        session.user.brandId = token.brandId as string | undefined
      }
      return session
    },

    // Sign in callback - create or update user in database
    async signIn({ user, account, profile }) {
      console.log('Sign in attempt:', { 
        email: user.email, 
        provider: account?.provider,
        userId: user.id,
        hasAccount: !!account
      })
      
      if (user.email) {
        try {
          // Create or update user in database
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || user.email.split('@')[0],
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name || user.email.split('@')[0],
              role: user.email === 'master@k-fashions.com' ? 'MASTER_ADMIN' : 
                    user.email === 'brand@k-fashions.com' ? 'BRAND_ADMIN' : 
                    'BUYER',
              status: 'ACTIVE',
            },
          })
        } catch (error) {
          console.error('Failed to create/update user:', error)
          // Continue with sign in even if database operation fails
        }
      }
      
      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  logger: {
    error(error) {
      console.error('Auth error:', error)
    },
    warn(message) {
      console.warn('Auth warning:', message)
    },
    debug(message, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth debug:', message, metadata)
      }
    },
  },
  events: {
    // Log sign out events
    async signOut(params) {
      const token = 'token' in params ? params.token : undefined
      console.log('User signed out:', token?.email)
    },
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user?.email)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)