# AWS Aurora MySQL 단계별 생성 가이드

## 🚀 Aurora 클러스터 생성하기

### Step 1: RDS 콘솔에서 데이터베이스 생성

1. **AWS RDS 콘솔**로 이동
2. **"데이터베이스 생성"** 버튼 클릭
3. 다음 옵션 선택:

### Step 2: 엔진 옵션

```
✅ 표준 생성
✅ Amazon Aurora
✅ MySQL 호환 버전
✅ Aurora MySQL 3.06.0 (MySQL 8.0.35 호환)
```

### Step 3: 템플릿

```
✅ 프로덕션 (고가용성 원한다면)
또는
✅ 개발/테스트 (비용 절감)
```

### Step 4: 설정

```
DB 클러스터 식별자: k-fashion-aurora-cluster
마스터 사용자 이름: kfashion_admin
마스터 암호: [강력한 암호 생성]
암호 확인: [동일한 암호]
```

**⚠️ 중요: 암호를 안전한 곳에 저장하세요!**

### Step 5: 인스턴스 구성

**개발/테스트 환경:**
```
DB 인스턴스 클래스: db.t4g.medium (2 vCPU, 4GB RAM)
```

**프로덕션 환경:**
```
DB 인스턴스 클래스: db.r6g.large (2 vCPU, 16GB RAM)
```

### Step 6: 가용성 및 내구성

```
✅ Aurora 복제본 생성
   복제본 수: 1개 이상
   다른 가용 영역에 생성
```

### Step 7: 연결

```
Virtual Private Cloud (VPC): Default VPC (또는 기존 VPC)
서브넷 그룹: default (또는 기존 서브넷)
퍼블릭 액세스: 아니요 (보안상)
VPC 보안 그룹: 새로 생성
   - 이름: k-fashion-aurora-sg
```

### Step 8: 데이터베이스 인증

```
✅ 암호 인증
```

### Step 9: 추가 구성

```
초기 데이터베이스 이름: kfashion_prod
DB 클러스터 파라미터 그룹: default.aurora-mysql8.0
DB 파라미터 그룹: default.aurora-mysql8.0

✅ 자동 백업 활성화
백업 보존 기간: 7일

✅ 암호화 활성화
마스터 키: aws/rds

✅ 로그 내보내기
- ✅ 오류 로그
- ✅ 느린 쿼리 로그
```

### Step 10: 생성 및 대기

- **"데이터베이스 생성"** 클릭
- 약 10-15분 대기 (클러스터 생성 중)

---

## 🔒 보안 그룹 설정

### 클러스터 생성 후:

1. RDS 콘솔에서 생성된 클러스터 클릭
2. **"연결 및 보안"** 탭
3. **VPC 보안 그룹** 클릭
4. **인바운드 규칙** 편집:

```
유형: MySQL/Aurora
프로토콜: TCP
포트: 3306
소스: 
  - 개발 중: 내 IP
  - 프로덕션: 애플리케이션 서버의 보안 그룹
```

---

## 📋 엔드포인트 확인

클러스터 생성 완료 후:

### Writer 엔드포인트 (Primary):
```
k-fashion-aurora-cluster.cluster-xxxxx.us-east-2.rds.amazonaws.com
```

### Reader 엔드포인트 (Read Replica):
```
k-fashion-aurora-cluster.cluster-ro-xxxxx.us-east-2.rds.amazonaws.com
```

---

## 🧪 연결 테스트

### MySQL 클라이언트로 테스트:

```bash
mysql -h k-fashion-aurora-cluster.cluster-xxxxx.us-east-2.rds.amazonaws.com \
      -u kfashion_admin \
      -p \
      kfashion_prod
```

### 연결 문자열 형식:

```
mysql://kfashion_admin:PASSWORD@k-fashion-aurora-cluster.cluster-xxxxx.us-east-2.rds.amazonaws.com:3306/kfashion_prod
```

---

## 💰 비용 예상

### 개발/테스트 (db.t4g.medium):
- Writer 인스턴스: ~$0.082/시간
- Reader 인스턴스: ~$0.082/시간
- 스토리지: $0.10/GB/월
- **월 예상**: ~$120-150

### 프로덕션 (db.r6g.large):
- Writer 인스턴스: ~$0.26/시간
- Reader 인스턴스: ~$0.26/시간
- 스토리지: $0.10/GB/월
- **월 예상**: ~$380-450

### 💡 비용 절감 팁:
1. 개발 환경은 사용하지 않을 때 중지
2. Aurora Serverless v2 고려 (자동 스케일링)
3. Reserved Instances로 최대 60% 절감

---

## ✅ 체크리스트

- [ ] Aurora 클러스터 생성 완료
- [ ] Writer/Reader 엔드포인트 확보
- [ ] 보안 그룹 설정 완료
- [ ] 연결 테스트 성공
- [ ] 암호 안전하게 저장

---

## 🚨 문제 해결

### 연결 실패 시:
1. 보안 그룹 인바운드 규칙 확인
2. VPC 네트워크 ACL 확인
3. 인스턴스 상태 확인 (Available 상태인지)

### 느린 쿼리:
1. Performance Insights 활성화
2. 느린 쿼리 로그 확인
3. 인덱스 최적화 필요

---

## 다음 단계

Aurora 생성이 완료되면:

1. `.env` 파일 업데이트:
```bash
DATABASE_URL="mysql://kfashion_admin:PASSWORD@writer-endpoint:3306/kfashion_prod"
DATABASE_URL_PRIMARY="mysql://kfashion_admin:PASSWORD@writer-endpoint:3306/kfashion_prod"
DATABASE_URL_REPLICA="mysql://kfashion_admin:PASSWORD@reader-endpoint:3306/kfashion_prod"
```

2. 데이터베이스 마이그레이션 실행:
```bash
npm run prisma:migrate deploy
```

3. 연결 테스트:
```bash
npm run test:database
```