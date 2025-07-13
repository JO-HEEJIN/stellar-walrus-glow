import { redirect } from 'next/navigation'

export default function SignInPage() {
  // This page immediately redirects to the OAuth provider
  redirect('/api/auth/signin/cognito')
}