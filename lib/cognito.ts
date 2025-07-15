import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand, 
  AdminCreateUserCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AdminSetUserPasswordCommand,
  MessageActionType
} from '@aws-sdk/client-cognito-identity-provider'
import { createHmac } from 'crypto'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Helper function to generate the SECRET_HASH
function generateSecretHash(username: string): string {
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
export async function cognitoRegister(username: string, email: string, password: string) {
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
export async function cognitoAdminCreateUser(username: string, email: string, temporaryPassword: string) {
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
    
    return response
  } catch (error) {
    console.error('Cognito admin create user error:', error)
    throw error
  }
}

// Helper function to determine user role based on username
export function getUserRole(username: string): 'MASTER_ADMIN' | 'BRAND_ADMIN' | 'BUYER' {
  if (username === 'kf001') {
    return 'MASTER_ADMIN'
  } else if (username === 'kf002') {
    return 'BRAND_ADMIN'
  } else {
    return 'BUYER'
  }
}