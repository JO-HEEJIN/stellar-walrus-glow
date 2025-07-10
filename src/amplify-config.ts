import { Amplify } from 'aws-amplify';

// Configure Amplify with your Cognito details
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code', // 'code' or 'link'
      loginWith: {
        email: true, // Enable email as a login method
      },
      userPoolEndpoint: `https://cognito-idp.${import.meta.env.VITE_COGNITO_REGION}.amazonaws.com/${import.meta.env.VITE_COGNITO_USER_POOL_ID}`,
    },
  },
});

// Re-export Amplify for direct use if needed
export { Amplify };