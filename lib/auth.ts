import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Role } from '@/types'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role as Role)) {
    redirect('/unauthorized')
  }
  
  return user
}

export async function requireBrandAdmin() {
  return requireRole([Role.BRAND_ADMIN, Role.MASTER_ADMIN])
}

export async function requireMasterAdmin() {
  return requireRole([Role.MASTER_ADMIN])
}

// Client-side session check hook
export function useRequireAuth() {
  // This would be implemented with useSession from next-auth/react
  // For now, we'll focus on server-side auth
}