import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

interface TestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message?: string
  duration?: number
}

class SystemIntegrationTest {
  private results: TestResult[] = []
  private testUserId: string | null = null

  private log(category: string, test: string, status: 'PASS' | 'FAIL' | 'SKIP', message?: string, duration?: number) {
    this.results.push({ category, test, status, message, duration })
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️'
    const durationStr = duration ? ` (${duration}ms)` : ''
    console.log(`${statusIcon} [${category}] ${test}${durationStr}${message ? ': ' + message : ''}`)
  }

  async testDatabaseConnection() {
    const start = Date.now()
    try {
      await prisma.$connect()
      const result = await prisma.$queryRaw`SELECT 1 as test`
      await prisma.$disconnect()
      this.log('DATABASE', 'Connection Test', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('DATABASE', 'Connection Test', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testSystemUser() {
    const start = Date.now()
    try {
      const systemUser = await prisma.user.findUnique({
        where: { id: 'system' }
      })
      
      if (systemUser) {
        this.log('AUTH', 'System User Exists', 'PASS', undefined, Date.now() - start)
      } else {
        this.log('AUTH', 'System User Exists', 'FAIL', 'System user not found', Date.now() - start)
      }
    } catch (error) {
      this.log('AUTH', 'System User Exists', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testUserCRUD() {
    const start = Date.now()
    try {
      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test-integration@example.com',
          name: 'Integration Test User',
          role: 'BUYER',
          status: 'ACTIVE',
          emailVerified: new Date(),
        }
      })
      this.testUserId = testUser.id

      // Read test user
      const fetchedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })

      if (!fetchedUser) {
        throw new Error('User not found after creation')
      }

      // Update test user
      await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Updated Test User' }
      })

      // Verify update
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })

      if (updatedUser?.name !== 'Updated Test User') {
        throw new Error('User update failed')
      }

      this.log('CRUD', 'User CRUD Operations', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('CRUD', 'User CRUD Operations', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testBrandCRUD() {
    const start = Date.now()
    try {
      // Create test brand
      const testBrand = await prisma.brand.create({
        data: {
          nameKo: '테스트 브랜드',
          nameCn: '测试品牌',
          slug: 'test-brand-integration',
          description: 'Integration test brand',
          isActive: true,
        }
      })

      // Read test brand
      const fetchedBrand = await prisma.brand.findUnique({
        where: { id: testBrand.id }
      })

      if (!fetchedBrand) {
        throw new Error('Brand not found after creation')
      }

      // Update test brand
      await prisma.brand.update({
        where: { id: testBrand.id },
        data: { description: 'Updated test brand' }
      })

      // Delete test brand
      await prisma.brand.delete({
        where: { id: testBrand.id }
      })

      this.log('CRUD', 'Brand CRUD Operations', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('CRUD', 'Brand CRUD Operations', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testProductCRUD() {
    const start = Date.now()
    try {
      // First create a test brand for the product with unique slug
      const randomId = Math.random().toString(36).substring(7)
      const testBrand = await prisma.brand.create({
        data: {
          nameKo: '상품 테스트 브랜드',
          nameCn: '产品测试品牌',
          slug: `product-test-brand-${randomId}`,
          isActive: true,
        }
      })

      // Create test product (categoryId is optional)
      const testProduct = await prisma.product.create({
        data: {
          brandId: testBrand.id,
          sku: 'TEST-INTEGRATION-001',
          nameKo: '테스트 상품',
          nameCn: '测试产品',
          descriptionKo: '통합 테스트용 상품',
          descriptionCn: '集成测试产品',
          status: 'ACTIVE',
          basePrice: 50000,
          inventory: 100,
          images: ['test-image.jpg'],
          options: { color: 'red', size: 'M' },
        }
      })

      // Read test product
      const fetchedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id }
      })

      if (!fetchedProduct) {
        throw new Error('Product not found after creation')
      }

      // Update test product
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { inventory: 80 }
      })

      // Clean up
      await prisma.product.delete({ where: { id: testProduct.id } })
      await prisma.brand.delete({ where: { id: testBrand.id } })

      this.log('CRUD', 'Product CRUD Operations', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('CRUD', 'Product CRUD Operations', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testOrderCRUD() {
    const start = Date.now()
    if (!this.testUserId) {
      this.log('CRUD', 'Order CRUD Operations', 'SKIP', 'No test user available')
      return
    }

    try {
      // Create test order (items are created separately)
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: `TEST-ORD-${Math.random().toString(36).substring(7)}`,
          userId: this.testUserId,
          status: 'PENDING',
          totalAmount: 100000,
          shippingAddress: {
            name: 'Test User',
            phone: '010-1234-5678',
            address: '서울시 강남구',
            addressDetail: '테스트 주소',
            zipCode: '12345'
          },
          paymentMethod: 'CREDIT_CARD',
        }
      })

      // Read test order
      const fetchedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id }
      })

      if (!fetchedOrder) {
        throw new Error('Order not found after creation')
      }

      // Update test order
      await prisma.order.update({
        where: { id: testOrder.id },
        data: { status: 'PAID' }
      })

      // Clean up
      await prisma.order.delete({ where: { id: testOrder.id } })

      this.log('CRUD', 'Order CRUD Operations', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('CRUD', 'Order CRUD Operations', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testAuditLogs() {
    const start = Date.now()
    try {
      // Check if audit logs are being created
      const recentLogs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      if (recentLogs.length === 0) {
        throw new Error('No audit logs found')
      }

      // Check if all logs use system user
      const invalidLogs = recentLogs.filter(log => log.userId !== 'system')
      if (invalidLogs.length > 0) {
        throw new Error(`Found ${invalidLogs.length} logs with non-system userId`)
      }

      // Check audit log structure
      const sampleLog = recentLogs[0]
      const hasRequiredFields = sampleLog.action && sampleLog.entityType && sampleLog.entityId

      if (!hasRequiredFields) {
        throw new Error('Audit log missing required fields')
      }

      this.log('AUDIT', 'Audit Log Functionality', 'PASS', `${recentLogs.length} logs checked`, Date.now() - start)
    } catch (error) {
      this.log('AUDIT', 'Audit Log Functionality', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testRoleBasedAccess() {
    const start = Date.now()
    try {
      // Test different user roles exist
      const masterAdmin = await prisma.user.findFirst({
        where: { role: 'MASTER_ADMIN' }
      })

      const brandAdmin = await prisma.user.findFirst({
        where: { role: 'BRAND_ADMIN' }
      })

      const buyer = await prisma.user.findFirst({
        where: { role: 'BUYER' }
      })

      if (!masterAdmin || !brandAdmin || !buyer) {
        throw new Error('Missing required user roles in database')
      }

      this.log('AUTH', 'Role-Based Access Control', 'PASS', 'All roles present', Date.now() - start)
    } catch (error) {
      this.log('AUTH', 'Role-Based Access Control', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async testDataIntegrity() {
    const start = Date.now()
    try {
      // Check for orphaned records - products without existing brand
      const productsWithoutBrand = await prisma.product.count({
        where: {
          brandId: {
            not: {
              in: (await prisma.brand.findMany({ select: { id: true } })).map(b => b.id)
            }
          }
        }
      })

      if (productsWithoutBrand > 0) {
        throw new Error(`Found ${productsWithoutBrand} products without brand`)
      }

      // Check for invalid statuses
      const invalidProducts = await prisma.product.count({
        where: {
          status: {
            notIn: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']
          }
        }
      })

      if (invalidProducts > 0) {
        throw new Error(`Found ${invalidProducts} products with invalid status`)
      }

      this.log('DATA', 'Data Integrity Check', 'PASS', undefined, Date.now() - start)
    } catch (error) {
      this.log('DATA', 'Data Integrity Check', 'FAIL', `${error}`, Date.now() - start)
    }
  }

  async cleanup() {
    if (this.testUserId) {
      try {
        await prisma.user.delete({
          where: { id: this.testUserId }
        })
        console.log('🧹 Test user cleanup completed')
      } catch (error) {
        console.log('⚠️ Test user cleanup failed:', error)
      }
    }
  }

  async run() {
    console.log('🚀 Starting System Integration Test...\n')
    
    const overallStart = Date.now()

    await this.testDatabaseConnection()
    await this.testSystemUser()
    await this.testUserCRUD()
    await this.testBrandCRUD()
    await this.testProductCRUD()
    await this.testOrderCRUD()
    await this.testAuditLogs()
    await this.testRoleBasedAccess()
    await this.testDataIntegrity()

    await this.cleanup()

    const overallDuration = Date.now() - overallStart

    // Generate summary
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length

    console.log('\n📊 Test Summary:')
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️ Skipped: ${skipped}`)
    console.log(`⏱️ Total Duration: ${overallDuration}ms`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - [${r.category}] ${r.test}: ${r.message}`))
    }

    console.log(`\n🎯 Overall Status: ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
    
    return failed === 0
  }
}

// Run the test
async function runIntegrationTest() {
  const test = new SystemIntegrationTest()
  try {
    const success = await test.run()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('💥 Integration test crashed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  runIntegrationTest()
}

export { SystemIntegrationTest }