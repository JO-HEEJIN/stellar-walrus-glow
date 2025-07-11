# K-Fashion Web Platform (KFWP)

AI 기반 보안 중심 하이브리드 패션 B2B 플랫폼

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

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: AWS Cognito, react-oidc-context
- **Routing**: React Router
- **Icons**: Lucide React
- **Build Tool**: Vite

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_DOMAIN=your_cognito_domain
```

## 데모 모드

인증 설정 없이도 데모 모드로 플랫폼의 모든 기능을 체험할 수 있습니다.

## 라이선스

MIT License

## 개발자

JO-HEEJIN