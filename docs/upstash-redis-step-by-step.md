# Upstash Redis 단계별 생성 가이드

## 🚀 Upstash Redis 데이터베이스 생성하기

### Step 1: Upstash 계정 생성

1. **[upstash.com](https://upstash.com)** 접속
2. **"Sign Up"** 클릭
3. 가입 방법 선택:
   - GitHub (추천)
   - Google
   - Email

### Step 2: 콘솔 대시보드

가입/로그인 후:
1. **"Create Database"** 클릭
2. Redis 선택

### Step 3: 데이터베이스 구성

#### 기본 설정:
```
Database Name: k-fashion-cache
Type: Regional (일관된 성능)
```

#### 지역 선택:
```
AWS 사용 중이라면 동일 지역 선택:
- US East (N. Virginia) - us-east-1
- US East (Ohio) - us-east-2
- Asia Pacific (Seoul) - ap-northeast-2
- Asia Pacific (Tokyo) - ap-northeast-1
```

#### 플랜 선택:
```
✅ Pay as You Go (추천)
   - $0.20 per 100K requests
   - No minimum fee
   - Auto-scaling
```

### Step 4: 고급 설정

```
Eviction: ✅ Enable
Eviction Policy: allkeys-lru (가장 적게 사용된 키 제거)
Max Memory: 1GB (자동 확장)
TLS/SSL: ✅ Enabled (기본값)
```

### Step 5: 생성 완료

**"Create"** 클릭 → 즉시 생성됨!

---

## 🔑 연결 정보 확인

### 생성 후 대시보드에서:

#### REST API 정보:
```
UPSTASH_REDIS_REST_URL=https://caring-cobra-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXASQgxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 연결 테스트 (cURL):
```bash
curl https://caring-cobra-12345.upstash.io/set/foo/bar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💻 로컬에서 테스트

### 1. Node.js 테스트 스크립트:

```javascript
// test-redis.js
const { Redis } = require('@upstash/redis')

const redis = new Redis({
  url: 'YOUR_UPSTASH_URL',
  token: 'YOUR_TOKEN',
})

async function test() {
  // SET
  await redis.set('test:key', 'Hello Upstash!')
  console.log('✅ SET successful')
  
  // GET
  const value = await redis.get('test:key')
  console.log('✅ GET result:', value)
  
  // DELETE
  await redis.del('test:key')
  console.log('✅ DELETE successful')
  
  // Test complete
  console.log('🎉 Redis connection test passed!')
}

test().catch(console.error)
```

### 2. 프로젝트에서 테스트:

```bash
npm run test:cache
```

---

## 📊 Upstash 콘솔 기능

### 데이터 브라우저:
- 키-값 조회 및 편집
- TTL 확인
- 데이터 타입별 필터링

### 메트릭스:
- 요청 수 (시간대별)
- 메모리 사용량
- 히트/미스 비율
- 응답 시간

### CLI:
- 웹 기반 Redis CLI
- 모든 Redis 명령어 지원

---

## 💰 비용 관리

### Pay as You Go 요금:
```
요청: $0.20 / 100K requests
저장소: $0.50 / GB / month
```

### 예상 비용 (K-Fashion):
```
일일 요청: ~100K
월간 요청: ~3M
예상 비용: ~$6-10/월
```

### 비용 절감 팁:
1. 적절한 TTL 설정
2. 큰 객체는 압축
3. 불필요한 키 정기 정리

---

## 🔧 환경 변수 설정

### `.env` 파일 업데이트:
```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 캐시 TTL 설정 (선택사항):
```bash
# Cache TTL Configuration
CACHE_DEFAULT_TTL=300
CACHE_PRODUCT_TTL=300
CACHE_BRAND_TTL=1800
CACHE_ANALYTICS_TTL=300
```

---

## ✅ 체크리스트

- [ ] Upstash 계정 생성
- [ ] Redis 데이터베이스 생성
- [ ] REST URL/Token 확보
- [ ] 연결 테스트 성공
- [ ] 환경 변수 설정

---

## 🚨 문제 해결

### 연결 실패:
```
Error: Invalid token
```
→ Token 복사 시 공백 포함 여부 확인

### 느린 응답:
```
Response time > 100ms
```
→ 가까운 지역으로 데이터베이스 재생성

### 메모리 부족:
```
OOM command not allowed
```
→ Eviction policy 확인 또는 플랜 업그레이드

---

## 🎯 다음 단계

1. **환경 변수 설정 완료**
2. **캐시 테스트 실행**:
   ```bash
   npm run test:cache
   ```
3. **애플리케이션 재시작**:
   ```bash
   npm run dev
   ```

---

## 📈 모니터링

### Upstash 대시보드에서 확인:
- Cache Hit Rate > 80% 목표
- Average Latency < 50ms 목표
- Memory Usage < 80% 유지

### 애플리케이션 모니터링:
```
/api/health/detailed
```
엔드포인트에서 캐시 상태 확인