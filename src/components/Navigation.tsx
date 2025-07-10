import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Building2, Package, ShoppingCart, BarChart3, Settings, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";

interface NavigationProps {
  currentPath?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath = "/" }) => {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "16bdq2fib11bcss6po40koivdi";
    const logoutUri = "https://d84l1y8p4kdic.cloudfront.net";
    const cognitoDomain = "https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const navigationItems = [
    {
      href: "/",
      label: "대시보드",
      icon: BarChart3,
      active: currentPath === "/"
    },
    {
      href: "/brands",
      label: "브랜드 관리",
      icon: Building2,
      active: currentPath.startsWith("/brands")
    },
    {
      href: "/products",
      label: "상품 관리",
      icon: Package,
      active: currentPath.startsWith("/products")
    },
    {
      href: "/orders",
      label: "주문 관리",
      icon: ShoppingCart,
      active: currentPath.startsWith("/orders")
    }
  ];

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">K-Fashion</h1>
            <Badge variant="secondary" className="ml-2">Platform</Badge>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-sm text-gray-600">
              {auth.user?.profile?.email}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">계정</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.removeUser()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃 (OIDC)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOutRedirect}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃 (Cognito)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;