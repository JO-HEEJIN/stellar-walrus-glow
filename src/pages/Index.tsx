import { MadeWithDyad } from "@/components/made-with-dyad";
import Navigation from "@/components/Navigation";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Globe, Shield, TrendingUp, Star, Package, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const Index = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-700">로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600">{auth.error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <AuthenticatedDashboard user={auth.user} />;
  }

  return <PublicHomePage onLogin={() => auth.signinRedirect()} />;
};

const PublicHomePage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">K-Fashion</h1>
              <Badge variant="secondary" className="ml-2">Platform</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onLogin}>
                로그인
              </Button>
              <Button onClick={onLogin}>
                브랜드 입점 신청
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            전 세계 바이어를
            <span className="text-blue-600"> K-Fashion</span>으로 연결합니다
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI 기반 보안 중심 하이브리드 플랫폼으로 한국과 중국의 패션 브랜드와 도소매업자를 안전하고 효율적으로 연결합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onLogin} className="text-lg px-8 py-3">
              브랜드 입점하기
            </Button>
            <Button size="lg" variant="outline" onClick={onLogin} className="text-lg px-8 py-3">
              구매자로 시작하기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 K-Fashion 플랫폼을 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600">
              최신 기술과 보안을 바탕으로 한 차별화된 서비스를 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>글로벌 네트워크</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  한국과 중국을 중심으로 한 아시아 패션 시장의 허브 역할을 하며, 
                  전 세계 바이어들과의 연결을 지원합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>최고 수준의 보안</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AWS Cognito 기반 인증, Zero Trust 아키텍처, 
                  실시간 보안 모니터링으로 안전한 거래를 보장합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>데이터 기반 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI 기반 시장 분석과 실시간 통계를 통해 
                  더 나은 비즈니스 의사결정을 지원합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>전문 고객 지원</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  24/7 고객 지원과 전담 계정 매니저를 통해 
                  성공적인 비즈니스 파트너십을 구축합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>간편한 주문 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  직관적인 인터페이스와 자동화된 프로세스로 
                  주문부터 배송까지 효율적으로 관리할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <CardTitle>프리미엄 서비스</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  엄선된 브랜드와 검증된 구매자만을 위한 
                  프리미엄 B2B 패션 플랫폼입니다.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              신뢰할 수 있는 플랫폼
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">입점 브랜드</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1,000+</div>
              <div className="text-gray-600">활성 구매자</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">시스템 가용성</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">고객 지원</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            K-Fashion 플랫폼과 함께 글로벌 패션 비즈니스의 새로운 기회를 발견하세요
          </p>
          <Button size="lg" variant="secondary" onClick={onLogin} className="text-lg px-8 py-3">
            무료로 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">K-Fashion Platform</h3>
              <p className="text-gray-400">
                AI 기반 보안 중심 하이브리드 패션 B2B 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>브랜드 입점</li>
                <li>도소매 구매</li>
                <li>글로벌 배송</li>
                <li>결제 서비스</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>고객센터</li>
                <li>이용가이드</li>
                <li>FAQ</li>
                <li>파트너십</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li>회사소개</li>
                <li>채용정보</li>
                <li>개인정보처리방침</li>
                <li>이용약관</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 K-Fashion Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
    </div>
  );
};

const AuthenticatedDashboard = ({ user }: { user: any }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-2">K-Fashion 플랫폼에 오신 것을 환영합니다</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 주문</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">₩2,340,000</div>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">활성 상품</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-blue-600">+3 new this week</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">고객 만족도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-green-600">+2% from last month</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/products/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  새 상품 등록
                </CardTitle>
                <CardDescription>
                  새로운 상품을 플랫폼에 등록하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/brands/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  브랜드 추가
                </CardTitle>
                <CardDescription>
                  새로운 브랜드를 플랫폼에 추가하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  주문 관리
                </CardTitle>
                <CardDescription>
                  최근 주문을 확인하고 관리하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>최근 주문</CardTitle>
              <CardDescription>최근 7일간의 주문 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">주문 #KF-2025-{1000 + i}</p>
                      <p className="text-sm text-gray-600">프리미엄 골프 셔츠 x 10</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₩890,000</p>
                      <Badge variant="outline" className="text-xs">배송중</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>인기 상품</CardTitle>
              <CardDescription>이번 주 가장 많이 주문된 상품</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "프리미엄 골프 셔츠", orders: 45, revenue: "₩4,005,000" },
                  { name: "캐주얼 데님 재킷", orders: 32, revenue: "₩2,880,000" },
                  { name: "비즈니스 정장 세트", orders: 28, revenue: "₩8,400,000" }
                ].map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.orders}건 주문</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue}</p>
                      <p className="text-xs text-green-600">매출</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>현재 로그인된 사용자 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">이메일</label>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1">{user?.profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">사용자 ID</label>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1 font-mono">{user?.profile?.sub}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;