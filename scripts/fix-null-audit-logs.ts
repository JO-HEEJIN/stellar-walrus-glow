import { prisma } from '../lib/prisma'

async function fixNullAuditLogs() {
  console.log('🔧 NULL userId를 가진 감사 로그 수정 중...\n')

  try {
    // NULL userId를 가진 감사 로그 찾기
    const nullUserLogs = await prisma.auditLog.findMany({
      where: {
        userId: null
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true
      }
    })

    console.log(`📊 NULL userId를 가진 감사 로그: ${nullUserLogs.length}개`)
    
    if (nullUserLogs.length === 0) {
      console.log('✅ 수정할 감사 로그가 없습니다.')
      return
    }

    nullUserLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. [${log.action}] ${log.entityType}:${log.entityId} at ${log.createdAt.toISOString()}`)
    })

    // NULL userId를 'system'으로 업데이트
    const updateResult = await prisma.auditLog.updateMany({
      where: {
        userId: null
      },
      data: {
        userId: 'system'
      }
    })

    console.log(`\n✅ ${updateResult.count}개의 감사 로그를 시스템 사용자로 수정했습니다.`)

    // 결과 확인
    const remainingNullLogs = await prisma.auditLog.count({
      where: {
        userId: null
      }
    })

    if (remainingNullLogs === 0) {
      console.log('✅ 모든 NULL userId가 수정되었습니다.')
    } else {
      console.log(`⚠️ 아직 ${remainingNullLogs}개의 NULL userId가 남아있습니다.`)
    }

  } catch (error) {
    console.error('❌ 수정 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
fixNullAuditLogs()
  .then(() => {
    console.log('\n✅ 수정 스크립트 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 수정 스크립트 실패:', error)
    process.exit(1)
  })