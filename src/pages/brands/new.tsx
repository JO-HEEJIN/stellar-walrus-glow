import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Building2, Save, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface BrandFormData {
  nameKo: string;
  nameCn: string;
  slug: string;
  description: string;
  location: string;
  establishedYear: number;
  contactEmail: string;
  contactPhone: string;
  businessNumber: string;
  isActive: boolean;
}

const NewBrandPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    nameKo: '',
    nameCn: '',
    slug: '',
    description: '',
    location: '',
    establishedYear: new Date().getFullYear(),
    contactEmail: '',
    contactPhone: '',
    businessNumber: '',
    isActive: true
  });

  const handleInputChange = (field: keyof BrandFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from Korean name
    if (field === 'nameKo' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.nameKo || !formData.contactEmail || !formData.businessNumber) {
        showError('필수 항목을 모두 입력해주세요.');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      showSuccess('브랜드가 성공적으로 등록되었습니다!');
      navigate('/brands');
    } catch (error) {
      showError('브랜드 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/brands" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link to="/brands">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 브랜드 등록</h1>
              <p className="text-gray-600 mt-2">새로운 브랜드를 플랫폼에 등록하세요</p>
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
                  <Building2 className="h-5 w-5" />
                  기본 정보
                </CardTitle>
                <CardDescription>
                  브랜드의 기본 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameKo">브랜드명 (한국어) *</Label>
                    <Input
                      id="nameKo"
                      value={formData.nameKo}
                      onChange={(e) => handleInputChange('nameKo', e.target.value)}
                      placeholder="예: 프리미엄 패션"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameCn">브랜드명 (중국어)</Label>
                    <Input
                      id="nameCn"
                      value={formData.nameCn}
                      onChange={(e) => handleInputChange('nameCn', e.target.value)}
                      placeholder="例: 高级时装"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="slug">브랜드 슬러그</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="premium-fashion"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL에 사용될 고유 식별자입니다. 한국어 브랜드명에서 자동 생성됩니다.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">브랜드 설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="브랜드의 특징과 주력 상품에 대해 설명해주세요"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">소재지</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="예: 서울, 한국"
                    />
                  </div>
                  <div>
                    <Label htmlFor="establishedYear">설립년도</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value))}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>연락처 정보</CardTitle>
                <CardDescription>
                  브랜드 담당자의 연락처 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">담당자 이메일 *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@brand.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">담당자 연락처</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                  <Input
                    id="businessNumber"
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                    placeholder="123-45-67890"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand Logo */}
            <Card>
              <CardHeader>
                <CardTitle>브랜드 로고</CardTitle>
                <CardDescription>
                  브랜드 로고 이미지를 업로드해주세요 (선택사항)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">로고 이미지를 드래그하거나 클릭하여 업로드</p>
                  <p className="text-xs text-gray-500">PNG, JPG 파일만 지원 (최대 5MB)</p>
                  <Button type="button" variant="outline" className="mt-4">
                    파일 선택
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>설정</CardTitle>
                <CardDescription>
                  브랜드 활성화 상태를 설정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">브랜드 활성화</Label>
                    <p className="text-sm text-gray-500">
                      활성화된 브랜드만 플랫폼에서 상품을 판매할 수 있습니다
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Link to="/brands">
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
                    브랜드 등록
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

export default NewBrandPage;