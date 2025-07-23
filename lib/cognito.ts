import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand, 
  AdminCreateUserCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand,
  MessageActionType,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ListUsersCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { createHmac } from 'crypto'

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Helper function to generate the SECRET_HASH
export function generateSecretHash(username: string): string {
  const message = username + process.env.COGNITO_CLIENT_ID!
  const secret = process.env.COGNITO_CLIENT_SECRET!
  return createHmac('sha256', secret).update(message).digest('base64')
}

// Login function
export async function cognitoLogin(username: string, password: string) {
  try {
    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: generateSecretHash(username),
      },
    })

    const response = await cognitoClient.send(command)
    return response.AuthenticationResult
  } catch (error) {
    console.error('Cognito login error:', error)
    throw error
  }
}

// Register function
export async function cognitoRegister(username: string, email: string, password: string, role: string = 'BUYER') {
  try {
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: username,
      Password: password,
      SecretHash: generateSecretHash(username),
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'custom:role',
          Value: role,
        },
      ],
    })

    const response = await cognitoClient.send(command)
    return response
  } catch (error) {
    console.error('Cognito register error:', error)
    throw error
  }
}

// Get user info function
export async function cognitoGetUser(accessToken: string) {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    })

    const response = await cognitoClient.send(command)
    return response
  } catch (error) {
    console.error('Cognito get user error:', error)
    throw error
  }
}

// Logout function
export async function cognitoLogout(accessToken: string) {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    })

    const response = await cognitoClient.send(command)
    return response
  } catch (error) {
    console.error('Cognito logout error:', error)
    throw error
  }
}

// Admin create user function (for testing)
export async function cognitoAdminCreateUser(username: string, email: string, temporaryPassword: string, role: string = 'BUYER') {
  try {
    const command = new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: username,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'custom:role',
          Value: role,
        },
      ],
      TemporaryPassword: temporaryPassword,
      MessageAction: MessageActionType.SUPPRESS, // Don't send welcome email
    })

    const response = await cognitoClient.send(command)
    
    // Set permanent password
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: username,
      Password: temporaryPassword,
      Permanent: true,
    })
    
    await cognitoClient.send(setPasswordCommand)
    
    // Confirm the user (mark as verified)
    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: username,
    })
    
    await cognitoClient.send(confirmCommand)
    
    return response
  } catch (error) {
    console.error('Cognito admin create user error:', error)
    throw error
  }
}

// Forgot password function
export async function cognitoForgotPassword(username: string) {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: username,
      SecretHash: generateSecretHash(username),
    })

    const response = await cognitoClient.send(command)
    return response
  } catch (error) {
    console.error('Cognito forgot password error:', error)
    throw error
  }
}

// Confirm forgot password function
export async function cognitoConfirmForgotPassword(username: string, confirmationCode: string, newPassword: string) {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
      SecretHash: generateSecretHash(username),
    })

    const response = await cognitoClient.send(command)
    return response
  } catch (error) {
    console.error('Cognito confirm forgot password error:', error)
    throw error
  }
}

// Find user by email (for forgot ID functionality)
export async function cognitoFindUserByEmail(email: string) {
  try {
    const command = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Filter: `email = "${email}"`,
      Limit: 1,
    })

    const response = await cognitoClient.send(command)
    return response.Users?.[0] || null
  } catch (error) {
    console.error('Cognito find user by email error:', error)
    throw error
  }
}

// Helper function to determine user role based on username or email
export function getUserRole(username: string, email?: string): 'MASTER_ADMIN' | 'BRAND_ADMIN' | 'BUYER' {
  // Check by username first
  if (username === 'momo' || username === 'kf001') {
    return 'MASTER_ADMIN'
  } else if (username === 'kf002') {
    return 'BRAND_ADMIN'
  }
  
  // Check by email patterns
  if (email) {
    if (email.includes('admin') || email.includes('master')) {
      return 'MASTER_ADMIN'
    } else if (email.includes('brand') || email.includes('supplier')) {
      return 'BRAND_ADMIN'
    }
  }
  
  // Check by username patterns
  if (username.includes('admin') || username.includes('master')) {
    return 'MASTER_ADMIN'
  } else if (username.includes('brand') || username.includes('supplier')) {
    return 'BRAND_ADMIN'
  }
  
  // Default to BUYER
  return 'BUYER'
}