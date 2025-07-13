#!/usr/bin/env node

/**
 * Script to set up AWS Cognito users and groups
 * Run with: node scripts/setup-cognito-users.js
 */

const { CognitoIdentityProviderClient, 
  CreateGroupCommand,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminSetUserPasswordCommand
} = require('@aws-sdk/client-cognito-identity-provider');

// Configuration
const USER_POOL_ID = 'ap-northeast-1_xV5GZRniK';
const REGION = 'ap-northeast-1';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  // Credentials will be loaded from environment or AWS config
});

// Groups to create
const groups = [
  {
    GroupName: 'master-admins',
    Description: 'Master administrators with full system access',
  },
  {
    GroupName: 'brand-admins',
    Description: 'Brand administrators who can manage their own brand',
  },
  {
    GroupName: 'buyers',
    Description: 'Wholesale buyers who can place orders',
  },
];

// Test users to create
const testUsers = [
  {
    Username: 'master@kfashion.com',
    UserAttributes: [
      { Name: 'email', Value: 'master@kfashion.com' },
      { Name: 'name', Value: 'Master Admin' },
      { Name: 'email_verified', Value: 'true' },
    ],
    TemporaryPassword: 'TempPass123!',
    Groups: ['master-admins'],
  },
  {
    Username: 'brand@kfashion.com',
    UserAttributes: [
      { Name: 'email', Value: 'brand@kfashion.com' },
      { Name: 'name', Value: 'Brand Admin' },
      { Name: 'email_verified', Value: 'true' },
    ],
    TemporaryPassword: 'TempPass123!',
    Groups: ['brand-admins'],
  },
  {
    Username: 'buyer@kfashion.com',
    UserAttributes: [
      { Name: 'email', Value: 'buyer@kfashion.com' },
      { Name: 'name', Value: 'Test Buyer' },
      { Name: 'email_verified', Value: 'true' },
    ],
    TemporaryPassword: 'TempPass123!',
    Groups: ['buyers'],
  },
];

async function createGroups() {
  console.log('Creating Cognito groups...');
  
  for (const group of groups) {
    try {
      await cognitoClient.send(new CreateGroupCommand({
        UserPoolId: USER_POOL_ID,
        ...group,
      }));
      console.log(`✓ Created group: ${group.GroupName}`);
    } catch (error) {
      if (error.name === 'GroupExistsException') {
        console.log(`- Group already exists: ${group.GroupName}`);
      } else {
        console.error(`✗ Error creating group ${group.GroupName}:`, error.message);
      }
    }
  }
}

async function createUsers() {
  console.log('\nCreating test users...');
  
  for (const user of testUsers) {
    try {
      // Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.Username,
        UserAttributes: user.UserAttributes,
        TemporaryPassword: user.TemporaryPassword,
        MessageAction: 'SUPPRESS', // Don't send welcome email
      }));
      console.log(`✓ Created user: ${user.Username}`);
      
      // Set permanent password (optional - remove this in production)
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.Username,
        Password: 'TestPass123!', // Permanent password for testing
        Permanent: true,
      }));
      console.log(`✓ Set permanent password for: ${user.Username}`);
      
      // Add user to groups
      for (const groupName of user.Groups) {
        await cognitoClient.send(new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.Username,
          GroupName: groupName,
        }));
        console.log(`✓ Added ${user.Username} to group: ${groupName}`);
      }
      
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        console.log(`- User already exists: ${user.Username}`);
      } else {
        console.error(`✗ Error creating user ${user.Username}:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('AWS Cognito Setup Script');
  console.log('========================');
  console.log(`User Pool ID: ${USER_POOL_ID}`);
  console.log(`Region: ${REGION}`);
  console.log('');
  
  try {
    await createGroups();
    await createUsers();
    
    console.log('\n✅ Setup completed!');
    console.log('\nTest users created:');
    console.log('-------------------');
    testUsers.forEach(user => {
      console.log(`Email: ${user.Username}`);
      console.log(`Password: TestPass123!`);
      console.log(`Role: ${user.Groups[0]}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the script
main();