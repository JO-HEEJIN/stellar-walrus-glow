# RDS Data API 마이그레이션 가이드

## 📋 개요

Prisma ORM에서 AWS RDS Data API로 마이그레이션한 과정과 방법론을 정리한 문서입니다.

## 🎯 마이그레이션 이유

### 기존 문제점 (Prisma + 직접 연결)
- Vercel 서버리스 환경에서 DB 연결 불안정
- Connection Pool 한계로 인한 500 에러 빈발
- AWS Aurora와 Vercel 간 네트워크 이슈

### 해결책 (RDS Data API)
- HTTP 기반 데이터베이스 접근으로 연결 문제 해결
- 서버리스 환경에 최적화된 아키텍처
- AWS IAM 및 Secrets Manager를 통한 보안 강화

## 🏗️ 아키텍처 패턴

### 1. Database Adapter Pattern
```typescript
// lib/db/adapter.ts
export class DatabaseAdapter {
  private client: RDSDataAPIClient
  
  async getProducts(options) { /* 통합된 인터페이스 */ }
  async createProduct(data) { /* 표준화된 메서드 */ }
}
```

**장점:**
- 데이터베이스 접근 로직을 한 곳에서 관리
- 나중에 다른 DB로 바꿔도 API 코드는 수정 불필요
- 일관된 인터페이스 제공

### 2. API Versioning Strategy
```
/api/products      ← 기존 Prisma 기반 (v1)
/api/products-v2   ← 새로운 RDS Data API 기반 (v2)
```

**장점:**
- 기존 API 중단 없이 새 버전 배포
- 점진적 마이그레이션 가능
- 롤백 시 즉시 이전 버전으로 전환 가능

### 3. Performance Optimization Layer

#### 쿼리 캐싱
```typescript
// 30초간 SELECT 쿼리 결과 캐시
private queryCache: Map<string, { result: QueryResult; timestamp: number }>
```

#### 배치 쿼리 처리
```typescript
// 여러 쿼리를 병렬로 실행
async batchQuery(queries: Array<{sql: string; params?: any[]}>)
```

## 🔧 구현된 컴포넌트

### 1. RDS Data API Client (`lib/db/rds-data-client.ts`)
**기능:**
- AWS RDS Data API 래퍼
- 자동 재시도 (3회)
- 쿼리 캐싱 (30초)
- 배치 쿼리 지원
- 메모리 누수 방지

### 2. Database Adapter (`lib/db/adapter.ts`)
**기능:**
- 고수준 데이터베이스 operations
- 제품, 사용자, 주문, 분석 데이터 처리
- 필터링 및 페이지네이션 지원

### 3. 마이그레이션된 APIs
- **Products v2** (`/api/products-v2`) - 제품 CRUD + 검색/필터
- **Analytics v2** (`/api/analytics-v2`) - 실시간 분석 데이터  
- **Users v2** (`/api/users-v2`) - 사용자 관리
- **Performance** (`/api/performance`) - 성능 모니터링

## 📊 성능 개선 결과

### Before (Prisma)
- 연결 실패로 인한 500 에러 빈발
- Cold Start 시 DB 연결 지연
- Connection Pool 한계

### After (RDS Data API)
- HTTP 기반으로 연결 안정성 확보
- 쿼리 캐싱으로 응답 속도 향상
- 서버리스 환경 최적화

## 🚀 배포 전략

### 1. Blue-Green Deployment
```
기존 API (v1) → 계속 운영
새 API (v2)   → 점진적 트래픽 이동
```

### 2. 모니터링
- `/api/performance` 엔드포인트로 실시간 모니터링
- 쿼리 응답 시간 추적
- 캐시 히트율 측정

### 3. 롤백 계획
- 문제 발생 시 즉시 v1 API로 트래픽 전환
- DNS/Load Balancer 설정으로 빠른 전환 가능

## 💡 핵심 교훈

### 언제 이 방식을 사용하나?

**상황별 적용:**
- **서버리스 환경**에서 DB 연결 문제 해결
- **레거시 시스템** 현대화
- **성능 개선**이 필요한 API
- **점진적 마이그레이션**이 필요한 대형 시스템

**핵심 키워드:**
- `Database Adapter Pattern` - 데이터베이스 추상화
- `API Versioning` - 무중단 마이그레이션
- `HTTP-based Database Access` - 서버리스 최적화
- `Query Caching` - 성능 최적화
- `Batch Processing` - 병렬 처리 최적화

### 적용 원칙
1. **기존 시스템을 건드리지 않기** (v1 유지)
2. **성능 측정 도구** 먼저 구축
3. **단계별 검증** 후 진행
4. **롤백 계획** 필수 준비

## 🔄 다음 단계

1. **테스트 환경에서 검증**
2. **Git 커밋 및 푸시**
3. **Vercel 자동 배포**
4. **성능 모니터링**
5. **트래픽 점진적 이동**

---

> 📝 **작성일**: 2025-08-26  
> 🔧 **적용 프로젝트**: K-Fashion Platform  
> 💻 **환경**: Next.js 14 + Vercel + AWS Aurora MySQL