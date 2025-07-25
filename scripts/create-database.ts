import mysql from 'mysql2/promise';

async function createDatabase() {
  console.log('🏗️ Creating kfashion database...\n');

  const connection = await mysql.createConnection({
    host: 'k-fashion-aurora-cluster-instance-1.cf462wy64uko.us-east-2.rds.amazonaws.com',
    port: 3306,
    user: 'kfashion_admin',
    password: 'Qlalfqjsgh1!',
    // No database specified - connecting to MySQL server directly
  });

  try {
    // Check if database exists
    console.log('🔍 Checking existing databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Existing databases:', (databases as any[]).map(db => db.Database));

    // Create database if it doesn't exist
    console.log('\n📦 Creating kfashion database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS kfashion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    console.log('✅ Database kfashion created successfully!\n');

    // Verify creation
    console.log('🔍 Verifying database creation...');
    const [newDatabases] = await connection.execute('SHOW DATABASES');
    const dbExists = (newDatabases as any[]).some(db => db.Database === 'kfashion');
    
    if (dbExists) {
      console.log('✅ kfashion database confirmed to exist');
    } else {
      console.log('❌ kfashion database not found after creation');
    }

  } catch (error: any) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createDatabase().catch(console.error);