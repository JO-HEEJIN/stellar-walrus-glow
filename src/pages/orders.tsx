import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Truck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "KF-2025-1001",
    customerName: "김철수",
    customerEmail: "kim@example.com",
    status: "SHIPPED",
    totalAmount: 890000,
    itemCount: 3,
    createdAt: "2025-01-15T09:30:00Z",
    shippingAddress: {
      name: "김철수",
      address: "서울시 강남구 테헤란로 123",
      phone: "010-1234-5678"
    },
    items: [
      { productName: "프리미엄 골프 셔츠", quantity: 10, price: 89000 }
    ]
  },
  {
    id: "2",
    orderNumber: "KF-2025-1002",
    customerName: "이영희",
    customerEmail: "lee@example.com",
    status: "PREPARING",
    totalAmount: 1250000,
    itemCount: 5,
    createdAt: "2025-01-14T14:20:00Z",
    shippingAddress: {
      name: "이영희",
      address: "부산시 해운대구 센텀로 456",
      phone: "010-9876-5432"
    },
    items: [
      { productName: "캐주얼 데님 재킷", quantity: 10, price: 125000 }
    ]
  },
  {
    id: "3",
    orderNumber: "KF-2025-1003",
    customerName: "박민수",
    customerEmail: "park@example.com",
    status: "PENDING",
    totalAmount: 3500000,
    itemCount: 2,
    createdAt: "2025-01-13T11:45:00Z",
    shippingAddress: {
      name: "박민수",
      address: "대구시 중구 동성로 789",
      phone: "010-5555-1234"
    },
    items: [
      { productName: "비즈니스 정장 세트", quantity: 10, price: 350000 }
    ]
  }
];

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "결제대기", icon: Clock },
      PAID: { variant: "default" as const, label: "결제완료", icon: CheckCircle },
      PREPARING: { variant: "default" as const, label: "배송준비", icon: Package },
      SHIPPED: { variant: "default" as const, label: "배송중", icon: Truck },
      DELIVERED: { variant: "default" as const, label: "배송완료", icon: CheckCircle },
      CANCELLED: { variant: "destructive" as const, label: "취소됨", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">알 수 없음</Badge>;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.totalAmount - a.totalAmount;
      case "customer":
        return a.customerName.localeCompare(b.customerName);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/orders" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
              <p className="text-gray-600 mt-2">플랫폼의 모든 주문을 관리하고 처리하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="주문번호, 고객명, 이메일로 검색..."
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
                <SelectItem value="PENDING">결제대기</SelectItem>
                <SelectItem value="PAID">결제완료</SelectItem>
                <SelectItem value="PREPARING">배송준비</SelectItem>
                <SelectItem value="SHIPPED">배송중</SelectItem>
                <SelectItem value="DELIVERED">배송완료</SelectItem>
                <SelectItem value="CANCELLED">취소됨</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">주문일순</SelectItem>
                <SelectItem value="amount">주문금액순</SelectItem>
                <SelectItem value="customer">고객명순</SelectItem>
                <SelectItem value="status">상태순</SelectItem>
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
                  <p className="text-sm text-gray-600">전체 주문</p>
                  <p className="text-2xl font-bold">{mockOrders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">배송중</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {mockOrders.filter(o => o.status === "SHIPPED").length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">배송완료</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockOrders.filter(o => o.status === "DELIVERED").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(mockOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      {order.customerName} ({order.customerEmail})
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">주문 정보</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">주문일시:</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상품 수:</span>
                        <span>{order.itemCount}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 금액:</span>
                        <span className="font-semibold text-blue-600">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">배송 정보</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">수령인: </span>
                        <span>{order.shippingAddress.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">연락처: </span>
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">주소: </span>
                        <span className="break-words">{order.shippingAddress.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">주문 상품</h4>
                    <div className="space-y-1 text-sm">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600 truncate">{item.productName}</span>
                          <span>{item.quantity}개</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Link to={`/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      상세보기
                    </Button>
                  </Link>
                  {order.status === "PAID" && (
                    <Button size="sm" className="flex-1">
                      배송 시작
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button size="sm" className="flex-1">
                      배송 처리
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">주문이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "검색 조건에 맞는 주문이 없습니다." : "아직 접수된 주문이 없습니다."}
            </p>
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default OrdersPage;