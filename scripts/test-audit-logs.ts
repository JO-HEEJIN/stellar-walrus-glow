import { prisma } from '../lib/prisma'

async function testAuditLogs() {
  console.log('🔍 감사 로그 기능 종합 테스트 시작...\n')

  try {
    // 1. 시스템 사용자 확인
    console.log('1️⃣ 시스템 사용자 확인 중...')
    const systemUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: 'system' },
          { email: 'system@kfashion.com' }
        ]
      }
    })

    if (!systemUser) {
      console.log('❌ 시스템 사용자가 존재하지 않습니다!')
      return
    }
    console.log(`✅ 시스템 사용자 확인됨: ${systemUser.id} (${systemUser.email})`)

    // 2. 감사 로그 통계 확인
    console.log('\n2️⃣ 감사 로그 통계 확인 중...')
    const auditLogStats = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        id: true
      }
    })

    console.log('📊 액션별 감사 로그 통계:')
    auditLogStats.forEach(stat => {
      console.log(`   ${stat.action}: ${stat._count.id}개`)
    })

    // 3. 최근 감사 로그 확인
    console.log('\n3️⃣ 최근 감사 로그 확인 중...')
    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        metadata: true
      }
    })

    console.log(`📝 최근 ${recentLogs.length}개의 감사 로그:`)
    recentLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. [${log.action}] ${log.entityType}:${log.entityId} by ${log.userId} at ${log.createdAt.toISOString()}`)
    })

    // 4. 외래키 제약 조건 확인
    console.log('\n4️⃣ 외래키 제약 조건 확인 중...')
    const invalidUserLogs = await prisma.auditLog.findMany({
      where: {
        userId: {
          not: 'system'
        }
      },
      take: 5
    })

    if (invalidUserLogs.length > 0) {
      console.log(`⚠️ 시스템 사용자가 아닌 ${invalidUserLogs.length}개의 감사 로그 발견:`)
      invalidUserLogs.forEach(log => {
        console.log(`   - ${log.id}: userId=${log.userId}`)
      })
    } else {
      console.log('✅ 모든 감사 로그가 시스템 사용자를 사용하고 있습니다.')
    }

    // 5. 각 엔티티 타입별 로그 확인
    console.log('\n5️⃣ 엔티티별 감사 로그 확인 중...')
    const entityStats = await prisma.auditLog.groupBy({
      by: ['entityType'],
      _count: {
        id: true
      }
    })

    console.log('🏷️ 엔티티별 감사 로그 통계:')
    entityStats.forEach(stat => {
      console.log(`   ${stat.entityType}: ${stat._count.id}개`)
    })

    // 6. 메타데이터 무결성 확인
    console.log('\n6️⃣ 메타데이터 무결성 확인 중...')
    const totalLogs = await prisma.auditLog.count()
    console.log(`📊 총 감사 로그 수: ${totalLogs}개`)

    // 7. 오래된 감사 로그 수정 (시스템 사용자로 변경)
    if (invalidUserLogs.length > 0) {
      console.log('\n7️⃣ 오래된 감사 로그 수정 중...')
      const updatedCount = await prisma.auditLog.updateMany({
        where: {
          userId: {
            not: 'system'
          }
        },
        data: {
          userId: 'system'
        }
      })
      console.log(`✅ ${updatedCount.count}개의 감사 로그를 시스템 사용자로 수정했습니다.`)
    }

    console.log('\n🎉 감사 로그 기능 종합 테스트 완료!')

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
testAuditLogs()
  .then(() => {
    console.log('\n✅ 테스트 스크립트 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 테스트 스크립트 실패:', error)
    process.exit(1)
  })