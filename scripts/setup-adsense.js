#!/usr/bin/env node

/**
 * Google AdSense 계정 설정 자동화 스크립트
 * K-Fashion 플랫폼용 AdSense 계정 생성 및 설정
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupAdSense() {
  console.log('🚀 K-Fashion Google AdSense 설정을 시작합니다...\n');

  try {
    // 1. 사용자 정보 수집
    console.log('📋 Google AdSense 계정 정보를 입력해주세요:');
    
    const googleEmail = await question('Google 계정 이메일: ');
    const websiteUrl = await question('웹사이트 URL (예: https://k-fashions.com): ');
    const country = await question('국가 (기본값: KR): ') || 'KR';
    const currency = await question('통화 (기본값: USD): ') || 'USD';
    
    console.log('\n✅ 입력 정보 확인:');
    console.log(`- 이메일: ${googleEmail}`);
    console.log(`- 웹사이트: ${websiteUrl}`);
    console.log(`- 국가: ${country}`);
    console.log(`- 통화: ${currency}`);
    
    const confirm = await question('\n계속 진행하시겠습니까? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 설정이 취소되었습니다.');
      return;
    }

    // 2. AdSense 설정 파일 생성
    const adSenseConfig = {
      account: {
        email: googleEmail,
        website: websiteUrl,
        country: country,
        currency: currency,
        createdAt: new Date().toISOString()
      },
      adUnits: {
        banner: {
          name: 'K-Fashion-Banner',
          size: '728x90',
          type: 'DISPLAY'
        },
        sidebar: {
          name: 'K-Fashion-Sidebar',
          size: '300x250',
          type: 'DISPLAY'
        },
        inline: {
          name: 'K-Fashion-Inline',
          size: '336x280',
          type: 'DISPLAY'
        },
        mobile: {
          name: 'K-Fashion-Mobile',
          size: '320x50',
          type: 'DISPLAY'
        }
      },
      setup: {
        autoAds: true,
        adsText: true,
        adsDisplay: true,
        adsVideo: false // K-Fashion은 비디오 광고 비활성화
      }
    };

    // 3. 설정 파일 저장
    const configPath = path.join(__dirname, '..', 'config', 'adsense.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(adSenseConfig, null, 2));
    console.log(`\n💾 AdSense 설정이 저장되었습니다: ${configPath}`);

    // 4. AdSense 신청 가이드 출력
    console.log('\n📋 다음 단계를 따라 AdSense 계정을 생성하세요:');
    console.log('\n1️⃣ Google AdSense 사이트 방문:');
    console.log('   https://adsense.google.com/start/');
    
    console.log('\n2️⃣ 계정 생성:');
    console.log(`   - Google 계정: ${googleEmail}`);
    console.log(`   - 웹사이트 URL: ${websiteUrl}`);
    console.log(`   - 국가/지역: ${country}`);
    console.log(`   - 결제 통화: ${currency}`);
    
    console.log('\n3️⃣ 사이트 추가 및 AdSense 코드 삽입:');
    console.log('   - AdSense에서 제공하는 HTML 코드를 사이트에 추가');
    console.log('   - 자동 광고 활성화');
    
    console.log('\n4️⃣ 광고 단위 생성:');
    console.log('   - 배너 광고: 728x90 (상단/하단)');
    console.log('   - 사이드바 광고: 300x250 (우측 사이드바)');
    console.log('   - 인라인 광고: 336x280 (콘텐츠 사이)');
    console.log('   - 모바일 광고: 320x50 (모바일 전용)');
    
    console.log('\n5️⃣ 승인 대기:');
    console.log('   - Google 검토: 보통 2-4주 소요');
    console.log('   - 정책 준수 확인');
    console.log('   - 승인 후 광고 게재 시작');

    console.log('\n💰 수익 정보:');
    console.log('   - 최소 지급액: $100');
    console.log('   - 수익 분배: 68% (퍼블리셔) / 32% (Google)');
    console.log('   - PIN 인증: $10 달성 시 우편 발송');
    
    console.log('\n🔗 유용한 링크:');
    console.log('   - AdSense 정책: https://support.google.com/adsense/answer/48182');
    console.log('   - 한국 고객센터: https://support.google.com/adsense/?hl=ko');
    
    // 5. 환경 변수 업데이트 가이드
    console.log('\n⚙️  AdSense 승인 후 해야 할 일:');
    console.log('   1. AdSense에서 실제 Publisher ID와 Ad Unit ID 복사');
    console.log('   2. .env 파일의 임시 값들을 실제 값으로 교체');
    console.log('   3. Vercel 환경 변수도 업데이트');
    console.log('   4. 사이트 재배포');

  } catch (error) {
    console.error('❌ 오류가 발생했습니다:', error.message);
  } finally {
    rl.close();
  }
}

// 스크립트 실행
if (require.main === module) {
  setupAdSense();
}

module.exports = { setupAdSense };