# NIA INTERNATIONAL - Testing Guide

이 문서는 NIA INTERNATIONAL 플랫폼의 테스트 시스템에 대한 종합 가이드입니다.

## 📋 목차

1. [테스트 개요](#테스트-개요)
2. [테스트 종류](#테스트-종류)
3. [테스트 실행 방법](#테스트-실행-방법)
4. [테스트 결과 해석](#테스트-결과-해석)
5. [문제 해결](#문제-해결)

## 🎯 테스트 개요

우리의 테스트 시스템은 다음과 같은 목표를 가지고 있습니다:

- **안정성 보장**: 모든 핵심 기능이 정상 작동하는지 확인
- **품질 관리**: 코드 품질과 타입 안전성 검증
- **성능 모니터링**: 시스템 성능과 응답 시간 측정
- **보안 검증**: 감사 로그와 데이터 무결성 확인

## 🧪 테스트 종류

### 1. 종합 테스트 스위트 (Comprehensive Test Suite)
모든 테스트를 한 번에 실행하는 메인 테스트 스위트입니다.

```bash
npm run test:all
# 또는
npm run test:comprehensive
```

**포함되는 테스트:**
- 감사 로그 테스트
- 시스템 통합 테스트
- TypeScript 컴파일 검증
- ESLint 코드 품질 검사
- Next.js 빌드 테스트
- Prisma 스키마 검증
- 데이터베이스 연결 테스트

### 2. 개별 테스트

#### 감사 로그 테스트
```bash
npm run test:audit
```
- 감사 로그 생성 및 저장 검증
- 시스템 사용자 확인
- 외래키 제약 조건 검사

#### 시스템 통합 테스트
```bash
npm run test:integration
```
- 데이터베이스 CRUD 작업 검증
- 사용자 인증 및 권한 관리
- 데이터 무결성 검사

#### 인프라 테스트
```bash
npm run test:infrastructure
```
- 데이터베이스 연결 테스트
- 캐시 시스템 테스트

#### 코드 품질 테스트
```bash
npm run lint          # ESLint 검사
npm run typecheck     # TypeScript 타입 검사
npm run build         # 프로덕션 빌드 테스트
```

## 🚀 테스트 실행 방법

### 빠른 시작

1. **전체 테스트 실행** (권장)
   ```bash
   npm run test:all
   ```

2. **특정 테스트만 실행**
   ```bash
   npm run test:audit        # 감사 로그 테스트만
   npm run test:integration  # 통합 테스트만
   ```

### CI/CD에서 사용

```bash
# 프로덕션 배포 전 필수 검증
npm run test:comprehensive

# 종료 코드 확인
if [ $? -eq 0 ]; then
  echo "✅ 모든 테스트 통과 - 배포 가능"
else
  echo "❌ 테스트 실패 - 배포 중단"
  exit 1
fi
```

## 📊 테스트 결과 해석

### 상태 코드

| 상태 | 의미 | 아이콘 |
|------|------|--------|
| PASS | 테스트 성공 | ✅ |
| FAIL | 테스트 실패 | ❌ |
| TIMEOUT | 시간 초과 | ⏱️ |
| SKIP | 테스트 건너뜀 | ⏭️ |

### 중요도 구분

- **Critical (🚨)**: 실패 시 배포 불가
  - 데이터베이스 연결
  - 시스템 통합 테스트
  - TypeScript 컴파일
  - Next.js 빌드

- **Non-Critical**: 실패해도 배포 가능하지만 수정 권장
  - ESLint 경고
  - 성능 최적화 관련

### 성공 기준

다음 조건을 만족하면 **전체 성공**으로 판단:
- Critical 테스트 모두 통과
- Non-Critical 테스트 실패 1개 이하

## 📈 테스트 리포트

테스트 실행 후 자동으로 생성되는 리포트:

```
test-report-YYYY-MM-DD.md
```

**리포트 내용:**
- 전체 테스트 결과 요약
- 개별 테스트 상세 결과
- 오류 메시지 및 해결 방안
- 시스템 상태 점검
- 성능 메트릭

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 데이터베이스 연결 실패
```
❌ [DATABASE] Connection Test: Can't reach database server
```

**해결 방법:**
- `.env` 파일의 `DATABASE_URL` 확인
- 데이터베이스 서버 상태 점검
- 네트워크 연결 확인

#### 2. TypeScript 컴파일 오류
```
❌ [TypeScript Compilation] Type errors found
```

**해결 방법:**
```bash
npm run typecheck  # 상세 오류 확인
```
- 타입 정의 수정
- 누락된 import 추가
- 타입 캐스팅 검토

#### 3. 빌드 실패
```
❌ [Next.js Build] Build failed
```

**해결 방법:**
```bash
npm run build  # 상세 오류 확인
```
- 의존성 설치: `npm install`
- 캐시 클리어: `rm -rf .next`
- 환경 변수 확인

#### 4. 감사 로그 테스트 실패
```
❌ [Audit Log Tests] System user not found
```

**해결 방법:**
```bash
npx tsx scripts/create-system-user.ts
```

### 성능 최적화

테스트 실행 시간이 너무 길 경우:

1. **병렬 실행 고려**
   ```typescript
   // 독립적인 테스트는 Promise.all 사용
   const results = await Promise.all([
     runAuditTest(),
     runTypeCheck(),
     runLintCheck()
   ])
   ```

2. **타임아웃 조정**
   ```typescript
   // 네트워크 상황에 맞게 타임아웃 증가
   timeout: 60000  // 60초
   ```

## 📝 테스트 추가 가이드

새로운 기능을 개발할 때는 다음과 같이 테스트를 추가하세요:

### 1. 단위 테스트 추가
```typescript
// scripts/test-new-feature.ts
async function testNewFeature() {
  try {
    // 테스트 로직
    console.log('✅ New feature test passed')
    return true
  } catch (error) {
    console.log('❌ New feature test failed:', error)
    return false
  }
}
```

### 2. 종합 테스트에 추가
```typescript
// scripts/comprehensive-test-suite.ts
private testSuites: TestSuite[] = [
  // 기존 테스트들...
  {
    name: 'New Feature Tests',
    description: '새로운 기능 검증',
    command: 'npx tsx scripts/test-new-feature.ts',
    timeout: 30000,
    critical: true  // 중요도에 따라 설정
  }
]
```

## 🎯 베스트 프랙티스

1. **정기적인 테스트 실행**
   - 코드 변경 후 즉시 실행
   - 배포 전 필수 실행
   - 일일 자동 실행 설정

2. **테스트 결과 모니터링**
   - 리포트 정기 검토
   - 성능 지표 추적
   - 실패 패턴 분석

3. **테스트 환경 관리**
   - 테스트용 데이터베이스 분리
   - 환경 변수 적절히 설정
   - 테스트 데이터 정리

## 📞 지원

테스트 관련 문제나 질문이 있으시면:

- **이메일**: master@k-fashions.com
- **전화**: 1544-7734
- **문서**: 이 가이드 및 코드 주석 참조

---

*NIA INTERNATIONAL 개발팀*  
*최종 업데이트: 2025년 8월 1일*