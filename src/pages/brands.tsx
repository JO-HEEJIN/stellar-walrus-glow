import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building2, MapPin, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Brand {
  id: string;
  nameKo: string;
  nameCn?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  location: string;
  establishedYear: number;
  productCount: number;
  totalSales: string;
  createdAt: string;
}

const mockBrands: Brand[] = [
  {
    id: "1",
    nameKo: "프리미엄 패션",
    nameCn: "高级时装",
    slug: "premium-fashion",
    description: "고급 비즈니스 의류 전문 브랜드",
    isActive: true,
    location: "서울, 한국",
    establishedYear: 2018,
    productCount: 156,
    totalSales: "₩2.4억",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    nameKo: "캐주얼 라이프",
    nameCn: "休闲生活",
    slug: "casual-life",
    description: "일상복과 캐주얼 웨어 전문",
    isActive: true,
    location: "부산, 한국",
    establishedYear: 2020,
    productCount: 89,
    totalSales: "₩1.8억",
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    nameKo: "스포츠 액티브",
    nameCn: "运动活力",
    slug: "sports-active",
    description: "스포츠웨어 및 액티브웨어",
    isActive: false,
    location: "대구, 한국",
    establishedYear: 2019,
    productCount: 234,
    totalSales: "₩3.1억",
    createdAt: "2024-03-10"
  }
];

const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredBrands = mockBrands.filter(brand => {
    const matchesSearch = brand.nameKo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.nameCn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && brand.isActive) ||
                         (statusFilter === "inactive" && !brand.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/brands" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">브랜드 관리</h1>
              <p className="text-gray-600 mt-2">입점된 브랜드를 관리하고 새로운 브랜드를 추가하세요</p>
            </div>
            <Link to="/brands/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                새 브랜드 추가
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="브랜드명, 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                전체 ({mockBrands.length})
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                활성 ({mockBrands.filter(b => b.isActive).length})
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
                size="sm"
              >
                비활성 ({mockBrands.filter(b => !b.isActive).length})
              </Button>
            </div>
          </div>
        </div>

        {/* Brand Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{brand.nameKo}</CardTitle>
                      {brand.nameCn && (
                        <p className="text-sm text-gray-500">{brand.nameCn}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={brand.isActive ? "default" : "secondary"}>
                    {brand.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {brand.description}
                </CardDescription>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {brand.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    설립 {brand.establishedYear}년
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    상품 {brand.productCount}개
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">총 매출</span>
                    <span className="font-semibold text-green-600">{brand.totalSales}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/brands/${brand.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        상세보기
                      </Button>
                    </Link>
                    <Link to={`/brands/${brand.id}/products`} className="flex-1">
                      <Button size="sm" className="w-full">
                        상품관리
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">브랜드가 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "검색 조건에 맞는 브랜드가 없습니다." : "아직 등록된 브랜드가 없습니다."}
            </p>
            {!searchTerm && (
              <Link to="/brands/new">
                <Button>첫 번째 브랜드 추가하기</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default BrandsPage;