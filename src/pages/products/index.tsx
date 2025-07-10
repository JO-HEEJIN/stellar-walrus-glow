import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package, Star, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  nameKo: string;
  nameCn?: string;
  brandName: string;
  categoryName: string;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  basePrice: number;
  inventory: number;
  imageUrl?: string;
  salesCount: number;
  rating: number;
  createdAt: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    sku: "KF-SHIRT-001",
    nameKo: "프리미엄 골프 셔츠",
    nameCn: "高级高尔夫衬衫",
    brandName: "프리미엄 패션",
    categoryName: "셔츠",
    status: "ACTIVE",
    basePrice: 89000,
    inventory: 150,
    salesCount: 245,
    rating: 4.8,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    sku: "KF-JACKET-002",
    nameKo: "캐주얼 데님 재킷",
    nameCn: "休闲牛仔夹克",
    brandName: "캐주얼 라이프",
    categoryName: "재킷",
    status: "ACTIVE",
    basePrice: 125000,
    inventory: 75,
    salesCount: 189,
    rating: 4.6,
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    sku: "KF-SUIT-003",
    nameKo: "비즈니스 정장 세트",
    nameCn: "商务西装套装",
    brandName: "프리미엄 패션",
    categoryName: "정장",
    status: "OUT_OF_STOCK",
    basePrice: 350000,
    inventory: 0,
    salesCount: 156,
    rating: 4.9,
    createdAt: "2024-03-10"
  },
  {
    id: "4",
    sku: "KF-SPORTS-004",
    nameKo: "운동용 트레이닝복",
    nameCn: "运动训练服",
    brandName: "스포츠 액티브",
    categoryName: "스포츠웨어",
    status: "INACTIVE",
    basePrice: 95000,
    inventory: 200,
    salesCount: 98,
    rating: 4.4,
    createdAt: "2024-04-05"
  }
];

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">판매중</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">판매중지</Badge>;
      case "OUT_OF_STOCK":
        return <Badge variant="destructive">품절</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.nameKo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.nameCn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesBrand = brandFilter === "all" || product.brandName === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.basePrice - b.basePrice;
      case "sales":
        return b.salesCount - a.salesCount;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.nameKo.localeCompare(b.nameKo);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const uniqueBrands = Array.from(new Set(mockProducts.map(p => p.brandName)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/products" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">상품 관리</h1>
              <p className="text-gray-600 mt-2">등록된 상품을 관리하고 새로운 상품을 추가하세요</p>
            </div>
            <Link href="/products/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                새 상품 등록
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="상품명, SKU, 브랜드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="ACTIVE">판매중</SelectItem>
                <SelectItem value="INACTIVE">판매중지</SelectItem>
                <SelectItem value="OUT_OF_STOCK">품절</SelectItem>
              </SelectContent>
            </Select>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="브랜드 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 브랜드</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">등록일순</SelectItem>
                <SelectItem value="name">상품명순</SelectItem>
                <SelectItem value="price">가격순</SelectItem>
                <SelectItem value="sales">판매량순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 상품</p>
                  <p className="text-2xl font-bold">{mockProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">판매중</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockProducts.filter(p => p.status === "ACTIVE").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">품절</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockProducts.filter(p => p.status === "OUT_OF_STOCK").length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{product.nameKo}</CardTitle>
                    {product.nameCn && (
                      <p className="text-sm text-gray-500 mt-1">{product.nameCn}</p>
                    )}
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">브랜드</span>
                    <span className="font-medium">{product.brandName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-mono text-xs">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">재고</span>
                    <span className={`font-medium ${product.inventory === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.inventory}개
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">판매량</span>
                    <span className="font-medium">{product.salesCount}개</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">평점</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.basePrice)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        상세
                      </Button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        수정
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">상품이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "검색 조건에 맞는 상품이 없습니다." : "아직 등록된 상품이 없습니다."}
            </p>
            {!searchTerm && (
              <Link href="/products/new">
                <Button>첫 번째 상품 등록하기</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default ProductsPage;