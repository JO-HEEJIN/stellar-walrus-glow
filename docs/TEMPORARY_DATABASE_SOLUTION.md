# 임시 데이터베이스 솔루션

## AWS 계정 복구 전까지 사용할 수 있는 대안

### 옵션 1: PlanetScale (무료, 권장)
1. [PlanetScale](https://planetscale.com) 가입
2. 새 데이터베이스 생성
3. 연결 문자열 받기:
   ```
   mysql://[username]:[password]@[host]/[database]?ssl={"rejectUnauthorized":true}
   ```
4. Vercel 환경 변수 업데이트

### 옵션 2: Supabase (무료)
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. PostgreSQL 연결 문자열 사용
4. Prisma 스키마에서 provider를 "postgresql"로 변경 필요

### 옵션 3: Railway (무료 크레딧)
1. [Railway](https://railway.app) 가입
2. MySQL 서비스 추가
3. 연결 문자열 받기
4. Vercel 환경 변수 업데이트

## PlanetScale 빠른 설정 가이드

1. **데이터베이스 생성**
   ```bash
   # PlanetScale CLI 설치 (선택사항)
   brew install planetscale/tap/pscale
   ```

2. **Prisma 마이그레이션**
   ```bash
   # DATABASE_URL을 PlanetScale URL로 변경 후
   npx prisma db push
   ```

3. **Vercel 환경 변수 업데이트**
   - DATABASE_URL을 PlanetScale 연결 문자열로 변경

## AWS 계정 복구 후 할 일

1. 기존 Aurora 데이터베이스 백업 확인
2. 데이터 마이그레이션
3. 보안 그룹 재설정
4. IAM 권한 재검토