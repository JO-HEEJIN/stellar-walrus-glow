import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Save, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface ProductFormData {
  brandId: string;
  sku: string;
  nameKo: string;
  nameCn: string;
  descriptionKo: string;
  descriptionCn: string;
  categoryId: string;
  basePrice: number;
  inventory: number;
  images: string[];
  status: "ACTIVE" | "INACTIVE";
}

const mockBrands = [
  { id: "1", name: "프리미엄 패션" },
  { id: "2", name: "캐주얼 라이프" },
  { id: "3", name: "스포츠 액티브" }
];

const mockCategories = [
  { id: "1", name: "셔츠" },
  { id: "2", name: "재킷" },
  { id: "3", name: "정장" },
  { id: "4", name: "스포츠웨어" },
  { id: "5", name: "액세서리" }
];

const NewProductPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    brandId: '',
    sku: '',
    nameKo: '',
    nameCn: '',
    descriptionKo: '',
    descriptionCn: '',
    categoryId: '',
    basePrice: 0,
    inventory: 0,
    images: [],
    status: 'ACTIVE'
  });

  const handleInputChange = (field: keyof ProductFormData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate SKU from Korean name
    if (field === 'nameKo' && typeof value === 'string') {
      const sku = `KF-${value
        .toUpperCase()
        .replace(/[^A-Z0-9가-힣]/g, '')
        .substring(0, 10)}-${String(Date.now()).slice(-3)}`;
      setFormData(prev => ({
        ...prev,
        sku: sku
      }));
    }
  };

  const handleImageUpload = () => {
    // Simulate image upload
    const newImageUrl = `https://via.placeholder.com/400x400?text=Product+${formData.images.length + 1}`;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl]
    }));
    showSuccess('이미지가 업로드되었습니다.');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.nameKo || !formData.brandId || !formData.categoryId || !formData.basePrice) {
        showError('필수 항목을 모두 입력해주세요.');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showSuccess('상품이 성공적으로 등록되었습니다!');
      navigate('/products');
    } catch (error) {
      showError('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/products" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link to="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 상품 등록</h1>
              <p className="text-gray-600 mt-2">새로운 상품을 플랫폼에 등록하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  기본 정보
                </CardTitle>
                <CardDescription>
                  상품의 기본 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandId">브랜드 *</Label>
                    <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="브랜드를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockBrands.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoryId">카테고리 *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">상품 코드 (SKU)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="KF-SHIRT-001"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    상품명에서 자동 생성됩니다. 필요시 수정 가능합니다.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameKo">상품명 (한국어) *</Label>
                    <Input
                      id="nameKo"
                      value={formData.nameKo}
                      onChange={(e) => handleInputChange('nameKo', e.target.value)}
                      placeholder="예: 프리미엄 골프 셔츠"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameCn">상품명 (중국어)</Label>
                    <Input
                      id="nameCn"
                      value={formData.nameCn}
                      onChange={(e) => handleInputChange('nameCn', e.target.value)}
                      placeholder="例: 高级高尔夫衬衫"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descriptionKo">상품 설명 (한국어)</Label>
                    <Textarea
                      id="descriptionKo"
                      value={formData.descriptionKo}
                      onChange={(e) => handleInputChange('descriptionKo', e.target.value)}
                      placeholder="상품의 특징과 장점을 설명해주세요"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionCn">상품 설명 (중국어)</Label>
                    <Textarea
                      id="descriptionCn"
                      value={formData.descriptionCn}
                      onChange={(e) => handleInputChange('descriptionCn', e.target.value)}
                      placeholder="请描述产品的特点和优势"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>가격 및 재고</CardTitle>
                <CardDescription>
                  상품의 가격과 재고 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">기본 가격 (원) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange('basePrice', parseInt(e.target.value) || 0)}
                      placeholder="89000"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventory">재고 수량</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={formData.inventory}
                      onChange={(e) => handleInputChange('inventory', parseInt(e.target.value) || 0)}
                      placeholder="100"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>상품 이미지</CardTitle>
                <CardDescription>
                  상품 이미지를 업로드해주세요 (최대 10장)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG 파일만 지원 (최대 5MB)</p>
                    <Button type="button" variant="outline" onClick={handleImageUpload}>
                      파일 선택
                    </Button>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>상품 상태</CardTitle>
                <CardDescription>
                  상품의 판매 상태를 설정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="status">판매 상태</Label>
                  <Select value={formData.status} onValueChange={(value: "ACTIVE" | "INACTIVE") => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">판매중</SelectItem>
                      <SelectItem value="INACTIVE">판매중지</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Link to="/products">
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    등록 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    상품 등록
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default NewProductPage;