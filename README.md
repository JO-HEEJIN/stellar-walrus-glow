# K-Fashion Wholesale Platform

AI 기반 보안 중심 한중 통합 도소매 플랫폼

## 프로젝트 개요

K-Fashion 플랫폼은 한국과 중국의 패션 브랜드와 도소매업자를 안전하고 효율적으로 연결하는 B2B 플랫폼입니다.

### 주요 기능

- 🏢 **브랜드 관리**: 패션 브랜드 등록 및 관리
- 📦 **상품 관리**: 다국어 지원 상품 등록 및 재고 관리
- 🛒 **주문 관리**: 실시간 주문 처리 및 배송 추적
- 🔐 **보안**: AWS Cognito 기반 인증 시스템
- 🌐 **다국어 지원**: 한국어/중국어 지원
- 📊 **대시보드**: 실시간 통계 및 분석

### 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js + AWS Cognito
- **Database**: Prisma + MySQL (AWS Aurora)
- **File Storage**: AWS S3
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# AWS Cognito
COGNITO_CLIENT_ID=r03rnf7k4b9fafv8rs5av22it
COGNITO_CLIENT_SECRET=your-client-secret
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_xV5GZRniK

# Database
DATABASE_URL="mysql://user:password@localhost:3306/kfashion"

# AWS
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션 (Aurora MySQL 연결 후)
npm run prisma:migrate
```

### 4. AWS Cognito 설정

[Cognito 설정 가이드](./docs/cognito-setup.md)를 참고하여 사용자 그룹과 테스트 계정을 생성하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 테스트 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| master@kfashion.com | TestPass123! | 마스터 관리자 |
| brand@kfashion.com | TestPass123! | 브랜드 관리자 |
| buyer@kfashion.com | TestPass123! | 구매자 |

## 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run typecheck    # TypeScript 타입 체크
npm run prisma:studio # Prisma Studio 실행
```

## 프로젝트 구조

```
.
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── (auth)/         # 인증 관련 페이지
│   ├── (dashboard)/    # 대시보드 페이지
│   └── layout.tsx      # 루트 레이아웃
├── components/         # React 컴포넌트
├── lib/               # 유틸리티 함수
├── prisma/            # 데이터베이스 스키마
├── public/            # 정적 파일
├── types/             # TypeScript 타입 정의
└── middleware.ts      # Next.js 미들웨어
```

## 보안 기능

- 🔐 AWS Cognito 기반 인증
- 🛡️ CSP (Content Security Policy) 헤더
- 🚦 Rate Limiting (Upstash Redis)
- 🔑 JWT 기반 세션 관리
- 👥 역할 기반 접근 제어 (RBAC)
- 📝 감사 로그 (Audit Trail)

## 라이선스

MIT License

## 개발자

- **프로젝트 리드**: 조희진
- **AI 어시스턴트**: Claude Code