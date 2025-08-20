# AWS Support 응답 템플릿

아래 내용을 AWS Support 케이스에 복사하여 전송하세요:

---

Subject: Account Security Measures Completed - Request for Account Reinstatement

Dear AWS Support Team,

I have received your security notice regarding unauthorized access to my AWS account. I have completed all the required security measures as instructed:

## Step 1: Root Account Password Changed ✓
- Changed root account password on [날짜 입력]
- New password is unique and not used for any other services
- Email account password has also been changed as a precaution

## Step 2: MFA Enabled ✓
- Multi-Factor Authentication has been enabled on the root user account
- MFA device type: [Google Authenticator/AWS Virtual MFA/Hardware token 중 선택]
- Enabled on: [날짜 입력]

## Step 3: CloudTrail Review and Cleanup ✓
I have thoroughly reviewed CloudTrail logs and removed the following unauthorized resources:

### Unauthorized IAM Resources Deleted:
- [ ] List any suspicious IAM users found and deleted
- [ ] List any suspicious IAM roles found and deleted
- [ ] List any suspicious IAM policies found and deleted
- [ ] No unauthorized resources found (if applicable)

### Review Period: [시작 날짜] to [종료 날짜]

## Step 4: Unwanted AWS Usage Review ✓
I have checked all regions for unauthorized usage:

### Resources Reviewed:
- EC2 Instances: [Found/Not found - if found, list instance IDs deleted]
- Lambda Functions: [Found/Not found - if found, list functions deleted]
- EC2 Spot Bids: [Found/Not found - if found, list bids cancelled]
- Other services: [List any other unauthorized resources found]

### Billing Impact:
- Estimated unauthorized charges: $[금액] (based on Bills page review)
- Time period of unauthorized usage: [시작일] to [종료일]

## Additional Security Measures Taken:
1. Reviewed and updated all IAM user access keys
2. Enabled CloudTrail logging for all regions
3. Set up billing alerts to monitor unusual activity
4. Reviewed S3 bucket policies and access controls
5. Enabled GuardDuty for threat detection (optional)

## Account Details:
- AWS Account ID: [계정 ID]
- Account Email: [등록 이메일]
- Primary Contact Name: [이름]

## Request:
1. Please reinstate my AWS account access
2. Please consider a billing adjustment for the unauthorized usage during the compromise period
3. Please provide any additional security recommendations

I confirm that my account is now secured and there is no ongoing unauthorized access. I am available for immediate phone or chat support if you need any additional information.

Thank you for your prompt attention to this matter.

Best regards,
[귀하의 이름]

---

## 응답 전 체크리스트:

1. **필수 확인 사항**:
   - [ ] 루트 계정 비밀번호 변경 완료
   - [ ] MFA 활성화 완료
   - [ ] CloudTrail 로그 확인 완료
   - [ ] 의심스러운 리소스 모두 삭제 완료
   - [ ] 모든 리전에서 불필요한 리소스 확인 완료

2. **증거 자료 준비**:
   - 삭제한 리소스 목록 스크린샷
   - MFA 활성화 스크린샷
   - 청구서 페이지의 비정상 요금 스크린샷

3. **응답 방법**:
   - AWS Support Console에서 기존 케이스에 응답
   - 또는 새 케이스 생성: https://console.aws.amazon.com/support/

4. **긴급 지원 요청**:
   - 케이스에서 "Request a phone call" 또는 "Start a chat" 선택
   - Business/Enterprise Support가 있는 경우 즉시 전화 요청 가능

## 주의사항:
- 모든 단계를 실제로 완료한 후에만 응답하세요
- 거짓 정보를 제공하면 계정이 영구 정지될 수 있습니다
- 2025-09-03까지 반드시 응답해야 합니다