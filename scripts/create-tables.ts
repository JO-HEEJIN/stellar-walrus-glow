import mysql from 'mysql2/promise';

async function createTables() {
  console.log('🏗️ Creating database tables...\n');

  const connection = await mysql.createConnection({
    host: 'k-fashion-aurora-cluster-instance-1.cf462wy64uko.us-east-2.rds.amazonaws.com',
    port: 3306,
    user: 'kfashion_admin',
    password: 'Qlalfqjsgh1!',
    database: 'kfashion'
  });

  try {
    // Create tables in dependency order
    const tableCreationQueries = [
      // User table
      `CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(191),
        email VARCHAR(191) UNIQUE,
        emailVerified DATETIME(3),
        image VARCHAR(191),
        role ENUM('MASTER_ADMIN', 'BRAND_ADMIN', 'BUYER') NOT NULL DEFAULT 'BUYER',
        status ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
        brandId VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX User_email_idx (email),
        INDEX User_status_idx (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Brand table
      `CREATE TABLE IF NOT EXISTS Brand (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        nameKo VARCHAR(191) NOT NULL,
        nameCn VARCHAR(191),
        slug VARCHAR(191) NOT NULL UNIQUE,
        description TEXT,
        logoUrl VARCHAR(191),
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX Brand_slug_idx (slug),
        INDEX Brand_isActive_idx (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Category table
      `CREATE TABLE IF NOT EXISTS Category (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        parentId VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX Category_slug_idx (slug),
        INDEX Category_parentId_idx (parentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Product table
      `CREATE TABLE IF NOT EXISTS Product (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        brandId VARCHAR(191) NOT NULL,
        sku VARCHAR(191) NOT NULL UNIQUE,
        nameKo VARCHAR(191) NOT NULL,
        nameCn VARCHAR(191),
        descriptionKo TEXT,
        descriptionCn TEXT,
        categoryId VARCHAR(191),
        status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
        basePrice DECIMAL(10, 2) NOT NULL,
        inventory INT NOT NULL DEFAULT 0,
        thumbnailImage VARCHAR(191),
        images JSON,
        options JSON,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX Product_brandId_idx (brandId),
        INDEX Product_categoryId_idx (categoryId),
        INDEX Product_status_idx (status),
        INDEX Product_sku_idx (sku)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Account table (NextAuth)
      `CREATE TABLE IF NOT EXISTS Account (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        userId VARCHAR(191) NOT NULL,
        type VARCHAR(191) NOT NULL,
        provider VARCHAR(191) NOT NULL,
        providerAccountId VARCHAR(191) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INT,
        token_type VARCHAR(191),
        scope VARCHAR(191),
        id_token TEXT,
        session_state VARCHAR(191),
        INDEX Account_userId_idx (userId),
        UNIQUE KEY Account_provider_providerAccountId_key (provider, providerAccountId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Session table (NextAuth)
      `CREATE TABLE IF NOT EXISTS Session (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        sessionToken VARCHAR(191) NOT NULL UNIQUE,
        userId VARCHAR(191) NOT NULL,
        expires DATETIME(3) NOT NULL,
        INDEX Session_userId_idx (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Order table
      `CREATE TABLE IF NOT EXISTS \`Order\` (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        orderNumber VARCHAR(191) NOT NULL UNIQUE,
        userId VARCHAR(191) NOT NULL,
        status ENUM('PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        totalAmount DECIMAL(10, 2) NOT NULL,
        shippingAddress JSON NOT NULL,
        paymentMethod VARCHAR(191),
        paymentInfo JSON,
        memo TEXT,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX Order_userId_idx (userId),
        INDEX Order_status_idx (status),
        INDEX Order_orderNumber_idx (orderNumber)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // OrderItem table
      `CREATE TABLE IF NOT EXISTS OrderItem (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        orderId VARCHAR(191) NOT NULL,
        productId VARCHAR(191) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        options JSON,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX OrderItem_orderId_idx (orderId),
        INDEX OrderItem_productId_idx (productId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // AuditLog table
      `CREATE TABLE IF NOT EXISTS AuditLog (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        userId VARCHAR(191),
        action VARCHAR(191) NOT NULL,
        entityType VARCHAR(191),
        entityId VARCHAR(191),
        metadata JSON,
        ip VARCHAR(191),
        userAgent VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX AuditLog_userId_action_idx (userId, action),
        INDEX AuditLog_entityType_entityId_idx (entityType, entityId),
        INDEX AuditLog_createdAt_idx (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    // Create each table
    for (let i = 0; i < tableCreationQueries.length; i++) {
      const query = tableCreationQueries[i];
      const tableName = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/)?.[1] || `Table ${i + 1}`;
      
      console.log(`📦 Creating table: ${tableName}...`);
      await connection.execute(query);
      console.log(`✅ ${tableName} created successfully`);
    }

    console.log('\n🔗 Adding foreign key constraints...');

    // Add foreign key constraints
    const foreignKeyConstraints = [
      // User -> Brand
      `ALTER TABLE User ADD CONSTRAINT User_brandId_fkey 
       FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE SET NULL ON UPDATE CASCADE`,

      // Account -> User
      `ALTER TABLE Account ADD CONSTRAINT Account_userId_fkey 
       FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE`,

      // Session -> User
      `ALTER TABLE Session ADD CONSTRAINT Session_userId_fkey 
       FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE`,

      // Product -> Brand
      `ALTER TABLE Product ADD CONSTRAINT Product_brandId_fkey 
       FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE RESTRICT ON UPDATE CASCADE`,

      // Product -> Category
      `ALTER TABLE Product ADD CONSTRAINT Product_categoryId_fkey 
       FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL ON UPDATE CASCADE`,

      // Category -> Category (self-reference)
      `ALTER TABLE Category ADD CONSTRAINT Category_parentId_fkey 
       FOREIGN KEY (parentId) REFERENCES Category(id) ON DELETE SET NULL ON UPDATE CASCADE`,

      // Order -> User
      `ALTER TABLE \`Order\` ADD CONSTRAINT Order_userId_fkey 
       FOREIGN KEY (userId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE`,

      // OrderItem -> Order
      `ALTER TABLE OrderItem ADD CONSTRAINT OrderItem_orderId_fkey 
       FOREIGN KEY (orderId) REFERENCES \`Order\`(id) ON DELETE RESTRICT ON UPDATE CASCADE`,

      // OrderItem -> Product
      `ALTER TABLE OrderItem ADD CONSTRAINT OrderItem_productId_fkey 
       FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE`,

      // AuditLog -> User
      `ALTER TABLE AuditLog ADD CONSTRAINT AuditLog_userId_fkey 
       FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE`
    ];

    for (const constraint of foreignKeyConstraints) {
      try {
        await connection.execute(constraint);
        const constraintName = constraint.match(/ADD CONSTRAINT (\w+)/)?.[1] || 'constraint';
        console.log(`✅ Added ${constraintName}`);
      } catch (error: any) {
        // Skip if constraint already exists
        if (error.code !== 'ER_DUP_KEYNAME') {
          console.log(`⚠️  Constraint might already exist: ${error.message}`);
        }
      }
    }

    console.log('\n🔍 Verifying table creation...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Created tables:', (tables as any[]).map(t => Object.values(t)[0]).join(', '));

    console.log('\n✅ All tables created successfully! Database is ready for use.');

  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createTables().catch(console.error);