# RDS Data API 마이그레이션 교훈 모음집

**날짜**: 2025-08-26  
**프로젝트**: K-Fashion Platform  
**작업**: Prisma ORM → AWS RDS Data API 마이그레이션  
**결과**: ✅ 성공적 배포 완료 (9번의 시도 후)  

## 🎯 핵심 교훈 요약

### 1. 기존 프로젝트 패턴 파악이 최우선
**문제**: 새 코드 작성 시 기존 프로젝트의 패턴을 무시하고 작성
**해결**: 기존 코드베이스의 패턴을 먼저 정확히 분석 후 동일한 방식 적용

**구체적 사례들:**
- ❌ `ErrorCodes.RATE_LIMITED` → ✅ `ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED`
- ❌ `ErrorCodes.DATABASE_ERROR` → ✅ `ErrorCodes.SYSTEM_DATABASE_ERROR`  
- ❌ `ErrorCodes.DUPLICATE_ENTRY` → ✅ `ErrorCodes.PRODUCT_SKU_EXISTS` / `USER_EMAIL_EXISTS`

### 2. 함수 시그니처 정확성 확인
**문제**: 기존 함수의 매개변수 순서와 타입을 정확히 파악하지 않음
**해결**: 기존 함수 정의를 먼저 읽고 정확한 시그니처 적용

**구체적 사례들:**
- ❌ `BusinessError(message, code)` → ✅ `BusinessError(code, statusCode, details?)`
- ❌ `createErrorResponse(error)` → ✅ `createErrorResponse(error, path)`
- ❌ `logger.error(message, unknown)` → ✅ `logger.error(message, Error, context?)`

### 3. TypeScript Strict Mode 대응
**문제**: TypeScript의 strict 타입 체킹에서 발생하는 다양한 에러들
**해결**: 타입 안전성을 위한 체크와 변환 로직 추가

**구체적 사례들:**
- ❌ `error` (unknown 타입) → ✅ `error instanceof Error ? error : new Error(String(error))`
- ❌ Private 멤버 직접 접근 → ✅ Public 메서드를 통한 접근

### 4. AWS SDK 설정 옵션 정확성
**문제**: AWS SDK의 지원하지 않는 옵션 사용
**해결**: 공식 문서 확인 후 지원되는 옵션만 사용

**구체적 사례들:**
- ❌ `requestTimeout: 30000` → ✅ 제거 (RDSDataClient에서 지원하지 않음)

### 5. 점진적 수정과 미리 대비
**문제**: 한 번에 모든 문제를 해결하려고 하면 놓치는 부분 발생
**해결**: 하나씩 차근차근 수정하고, 미리 잠재적 문제 점검

## 📋 발생한 TypeScript 에러들과 해결책

### 에러 1: 존재하지 않는 ErrorCode 상수
```typescript
// ❌ 잘못된 코드
ErrorCodes.RATE_LIMITED

// ✅ 올바른 코드  
ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED
```

### 에러 2: 잘못된 함수 매개변수 순서
```typescript
// ❌ 잘못된 코드
new BusinessError('메시지', 코드)

// ✅ 올바른 코드
new BusinessError(코드, HttpStatus, 상세정보?)
```

### 에러 3: 타입 불일치 (unknown vs Error)
```typescript
// ❌ 잘못된 코드
logger.error('메시지', error) // error가 unknown 타입

// ✅ 올바른 코드
logger.error('메시지', error instanceof Error ? error : new Error(String(error)))
```

### 에러 4: Private 멤버 접근
```typescript
// ❌ 잘못된 코드
db.client.getCacheStats() // client가 private

// ✅ 올바른 코드
db.getCacheStats() // public 메서드 추가
```

### 에러 5: AWS SDK 설정 오류
```typescript
// ❌ 잘못된 코드
new RDSDataClient({ 
  region: config.region,
  requestTimeout: 30000 // 지원하지 않는 옵션
})

// ✅ 올바른 코드
new RDSDataClient({ 
  region: config.region,
  maxAttempts: 3
})
```

## 🔧 효과적인 디버깅 전략

### 1. 에러 메시지 정확히 읽기
- TypeScript 컴파일 에러는 정확한 위치와 원인을 알려줌
- 에러 메시지의 타입 정보를 자세히 확인

### 2. 기존 코드 패턴 조사
- 같은 프로젝트 내에서 유사한 기능이 어떻게 구현되어 있는지 확인
- ErrorCodes, 함수 시그니처, 타입 정의 등을 먼저 파악

### 3. 점진적 접근
- 한 번에 하나씩 에러 해결
- 각 수정 후 즉시 테스트하여 새로운 문제 발생 여부 확인

### 4. 사전 예방적 검토
- 배포 전에 잠재적 문제점 미리 스캔
- ESLint 경고, 사용하지 않는 변수 등도 함께 정리

## 📊 배포 이력 및 학습 과정

| 시도 | 주요 에러 | 해결 방법 | 교훈 |
|-----|---------|----------|------|
| 1차 | `ErrorCodes.RATE_LIMITED` 없음 | 기존 상수명 확인 | 프로젝트 패턴 먼저 파악 |
| 2차 | `BusinessError` 매개변수 순서 | 함수 정의 확인 | 함수 시그니처 정확히 파악 |
| 3차 | `createErrorResponse` 매개변수 부족 | 함수 정의 확인 | 모든 필수 매개변수 확인 |
| 4차 | `logger.error` 타입 에러 | 타입 변환 로직 추가 | TypeScript strict mode 대응 |
| 5차 | `ErrorCodes.DATABASE_ERROR` 없음 | 올바른 상수명 확인 | 상수명 정확성 중요 |
| 6차 | `DUPLICATE_ENTRY` 없음 | 도메인별 상수 사용 | 도메인 특화 에러 코드 활용 |
| 7차 | Private `client` 접근 에러 | Public 메서드 추가 | 캡슐화 원칙 준수 |
| 8차 | 또 다른 private 접근 에러 | 일관된 public API 설계 | 전체적인 아키텍처 일관성 |
| 9차 | AWS SDK 설정 에러 + 사전 수정 | 문서 확인 + 미리 점검 | 사전 예방적 접근 |

## 🚀 성공 요인들

### 1. 체계적인 접근
- 에러 하나씩 차근차근 해결
- 각 수정 사항을 즉시 커밋하여 진행 상황 추적

### 2. 기존 코드 존중
- 새로운 패턴 도입보다는 기존 패턴 따라가기
- 프로젝트의 일관성 유지

### 3. 타입 안전성 확보  
- TypeScript의 strict 체킹을 활용한 안전한 코드 작성
- unknown 타입 등의 적절한 처리

### 4. 사전 예방적 수정
- 마지막에 잠재적 문제들을 미리 찾아서 수정
- ESLint 경고 등도 함께 정리

### 5. 학습과 개선
- 매번 발생한 에러에서 패턴을 학습
- 반복되는 실수 방지

## 💡 다음 프로젝트에 적용할 점들

### Before 작업 시
1. **기존 코드 패턴 조사** (30분 투자로 몇 시간 절약)
2. **타입 정의 및 함수 시그니처 파악**
3. **ErrorCodes, 상수 등의 명명 규칙 확인**

### During 작업 시  
1. **하나씩 차근차근 구현**
2. **각 단계별 즉시 테스트**
3. **TypeScript 에러 메시지 정확히 읽기**

### After 작업 시
1. **사전 예방적 점검**
2. **ESLint 경고 정리**  
3. **문서화 및 교훈 정리**

## 🔄 재사용 가능한 체크리스트

### 새로운 API 추가 시 확인사항
- [ ] 기존 API의 에러 처리 패턴 확인
- [ ] ErrorCodes 상수명 확인  
- [ ] BusinessError 생성자 시그니처 확인
- [ ] createErrorResponse 매개변수 확인
- [ ] logger 메서드 시그니처 확인
- [ ] Private/Public 접근성 확인
- [ ] AWS SDK 설정 옵션 문서 확인
- [ ] TypeScript strict 모드 대응
- [ ] ESLint 경고 확인
- [ ] 사용하지 않는 변수 정리

---

**최종 결과**: 9번의 시도 끝에 모든 TypeScript 에러를 해결하고 성공적으로 RDS Data API 마이그레이션 완료! 

**핵심 메시지**: "기존 프로젝트에 새 코드를 추가할 때는 기존 패턴을 먼저 파악하는 것이 가장 중요하다!" 🎯