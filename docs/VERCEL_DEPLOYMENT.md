# Vercel 배포 가이드

## 🚨 AWS 계정 해킹으로 인한 RDS 연결 불가

### 현재 상황
AWS 계정이 제3자에 의해 부적절하게 접근되어 보안 조치로 계정이 제한된 상태입니다.
- **대응 기한**: 2025-09-03까지 AWS에 연락
- **계정 정지**: 미대응 시 계정 정지
- **리소스 삭제**: 2025-09-18까지 미복구 시 모든 리소스 삭제

### 즉시 필요한 조치
1. AWS 루트 계정 비밀번호 변경
2. MFA(다단계 인증) 활성화
3. CloudTrail에서 의심스러운 활동 확인 및 삭제
4. 원치 않는 AWS 사용 내역 확인
5. AWS Support에 응답하여 계정 복구

### 임시 해결책
AWS 계정 복구 전까지 PlanetScale, Supabase 등의 무료 데이터베이스 서비스 사용을 권장합니다.
자세한 내용은 [TEMPORARY_DATABASE_SOLUTION.md](./TEMPORARY_DATABASE_SOLUTION.md) 참조

### 즉시 해결 방법

#### 1단계: AWS RDS 콘솔에서 설정 확인
1. [AWS RDS 콘솔](https://console.aws.amazon.com/rds) 접속
2. `k-fashion-aurora-cluster` 선택
3. "연결 및 보안" 탭 확인
4. **퍼블릭 액세스 가능** 상태 확인 (아니요로 되어 있을 가능성 높음)

#### 2단계: RDS 클러스터 수정
1. "수정" 버튼 클릭
2. "연결" 섹션에서:
   - **퍼블릭 액세스 가능**: 예 선택
3. "계속" 클릭
4. "즉시 적용" 선택
5. "클러스터 수정" 클릭

#### 3단계: 보안 그룹 설정
1. RDS 클러스터의 VPC 보안 그룹 클릭
2. "인바운드 규칙" 탭
3. "규칙 편집" 클릭
4. 다음 규칙 추가:
   ```
   유형: MySQL/Aurora
   프로토콜: TCP
   포트 범위: 3306
   소스: 0.0.0.0/0
   설명: Vercel Access (임시)
   ```
5. "규칙 저장"

#### 4단계: Vercel 환경 변수 확인
Vercel 대시보드에서 DATABASE_URL이 올바른지 확인:
```
mysql://[사용자명]:[비밀번호]@k-fashion-aurora-cluster-instance-1-us-east-2b.cf462wy64uko.us-east-2.rds.amazonaws.com:3306/[데이터베이스명]
```

## 필수 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### 1. 필수 환경 변수

```env
# NextAuth 설정
NEXTAUTH_URL=https://k-fashions.com
NEXTAUTH_SECRET=[32자 이상의 랜덤 문자열 생성: openssl rand -base64 32]

# 데이터베이스 설정
DATABASE_URL=mysql://[사용자명]:[비밀번호]@[호스트]:3306/[데이터베이스명]
# 예시: mysql://admin:password123@k-fashion-aurora-cluster.cluster-xxx.us-east-2.rds.amazonaws.com:3306/kfashion

# AWS Cognito 설정
COGNITO_CLIENT_ID=r03rnf7k4b9fafv8rs5av22it
COGNITO_CLIENT_SECRET=[Cognito 앱 클라이언트 시크릿]
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_xV5GZRniK

# JWT 설정
JWT_SECRET=[NEXTAUTH_SECRET과 동일한 값]

# 개발 모드 비활성화 (프로덕션 필수)
NODE_ENV=production
```

### 2. 선택적 환경 변수

```env
# AWS S3 설정 (이미지 업로드용)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=[AWS 액세스 키]
AWS_SECRET_ACCESS_KEY=[AWS 시크릿 키]
S3_BUCKET=[S3 버킷 이름]

# Redis 설정 (rate limiting용)
UPSTASH_REDIS_REST_URL=[Upstash Redis URL]
UPSTASH_REDIS_REST_TOKEN=[Upstash Redis 토큰]
```

## 환경 변수 설정 방법

1. Vercel 대시보드 접속 (https://vercel.com)
2. 프로젝트 선택
3. Settings > Environment Variables
4. 각 환경 변수 추가:
   - Key: 환경 변수 이름
   - Value: 환경 변수 값
   - Environment: Production, Preview, Development 모두 선택

## AWS RDS 설정 가이드

### 1. 보안 그룹 설정
```bash
# AWS CLI로 보안 그룹 규칙 추가
aws ec2 authorize-security-group-ingress \
  --group-id [보안그룹ID] \
  --protocol tcp \
  --port 3306 \
  --cidr 0.0.0.0/0
```

### 2. RDS 클러스터 퍼블릭 액세스 활성화
```bash
aws rds modify-db-cluster \
  --db-cluster-identifier k-fashion-aurora-cluster \
  --publicly-accessible \
  --apply-immediately
```

### 3. 데이터베이스 연결 테스트
```bash
# 로컬에서 연결 테스트
mysql -h k-fashion-aurora-cluster-instance-1-us-east-2b.cf462wy64uko.us-east-2.rds.amazonaws.com \
  -P 3306 -u admin -p
```

## 문제 해결

### 🔴 현재 발생 중인 문제: 데이터베이스 연결 실패

**원인**: AWS RDS가 Vercel 서버에서의 접근을 차단하고 있습니다.

**해결 순서**:
1. AWS RDS 콘솔에서 보안 그룹 확인
2. 인바운드 규칙에 MySQL/Aurora (3306) 추가
3. 소스를 0.0.0.0/0으로 임시 설정
4. RDS 클러스터에서 "퍼블릭 액세스 가능" 활성화
5. Vercel에서 재배포

### 500 에러 발생 시

1. **데이터베이스 연결 확인**
   - DATABASE_URL이 올바른지 확인
   - 데이터베이스 서버가 Vercel IP에서 접근 가능한지 확인

2. **NextAuth 설정 확인**
   - NEXTAUTH_URL이 실제 도메인과 일치하는지 확인
   - NEXTAUTH_SECRET이 설정되어 있는지 확인

3. **Cognito 설정 확인**
   - Cognito 앱 클라이언트에서 콜백 URL 설정:
     - `https://k-fashions.com/api/auth/callback/cognito`
   - 로그아웃 URL 설정:
     - `https://k-fashions.com`

### 401 Unauthorized 에러

- `/api/auth/me` 엔드포인트는 로그인하지 않은 사용자에게 401을 반환하는 것이 정상입니다
- 이는 에러가 아니라 정상적인 동작입니다

### NODE_TLS_REJECT_UNAUTHORIZED 경고

이 경고는 개발 환경에서만 사용되어야 합니다. 프로덕션에서는 제거하세요.

## 배포 후 확인사항

1. 데이터베이스 마이그레이션 실행
2. 로그인 기능 테스트
3. 상품 목록 표시 확인
4. 이미지 업로드 테스트 (S3 설정 시)

## 로그 확인

Vercel 대시보드 > Functions 탭에서 실시간 로그를 확인할 수 있습니다.