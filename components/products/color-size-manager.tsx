'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Color {
  id?: string
  name: string
  code: string
  available: boolean
}

interface Size {
  id?: string
  name: string
  available: boolean
  order?: number
}

interface ColorSizeManagerProps {
  colors: Color[]
  sizes: Size[]
  onColorsChange: (colors: Color[]) => void
  onSizesChange: (sizes: Size[]) => void
}

export function ColorSizeManager({
  colors = [],
  sizes = [],
  onColorsChange,
  onSizesChange,
}: ColorSizeManagerProps) {
  const [newColorName, setNewColorName] = useState('')
  const [newColorCode, setNewColorCode] = useState('#000000')
  const [newSizeName, setNewSizeName] = useState('')

  // 색상 추가
  const addColor = () => {
    if (!newColorName.trim()) return
    
    const newColor: Color = {
      name: newColorName.trim(),
      code: newColorCode,
      available: true,
    }
    
    onColorsChange([...colors, newColor])
    setNewColorName('')
    setNewColorCode('#000000')
  }

  // 색상 제거
  const removeColor = (index: number) => {
    if (confirm(`"${colors[index].name}" 색상을 삭제하시겠습니까?`)) {
      onColorsChange(colors.filter((_, i) => i !== index))
    }
  }

  // 색상 가용성 토글
  const toggleColorAvailability = (index: number) => {
    const updated = [...colors]
    updated[index].available = !updated[index].available
    onColorsChange(updated)
  }

  // 색상 코드 업데이트
  const updateColorCode = (index: number, code: string) => {
    const updated = [...colors]
    updated[index].code = code
    onColorsChange(updated)
  }

  // 사이즈 추가
  const addSize = () => {
    if (!newSizeName.trim()) return
    
    const newSize: Size = {
      name: newSizeName.trim(),
      available: true,
      order: sizes.length,
    }
    
    onSizesChange([...sizes, newSize])
    setNewSizeName('')
  }

  // 사이즈 제거
  const removeSize = (index: number) => {
    if (confirm(`"${sizes[index].name}" 사이즈를 삭제하시겠습니까?`)) {
      onSizesChange(sizes.filter((_, i) => i !== index))
    }
  }

  // 사이즈 가용성 토글
  const toggleSizeAvailability = (index: number) => {
    const updated = [...sizes]
    updated[index].available = !updated[index].available
    onSizesChange(updated)
  }

  // 사이즈 순서 변경
  const moveSizeUp = (index: number) => {
    if (index === 0) return
    const updated = [...sizes]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    onSizesChange(updated)
  }

  const moveSizeDown = (index: number) => {
    if (index === sizes.length - 1) return
    const updated = [...sizes]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    onSizesChange(updated)
  }

  return (
    <div className="space-y-8">
      {/* 색상 관리 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">색상 관리</h3>
        
        {/* 색상 추가 폼 */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="색상명 (예: 블랙)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addColor()}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorCode}
              onChange={(e) => setNewColorCode(e.target.value)}
              className="w-10 h-10 border rounded cursor-pointer"
            />
            <Input
              type="text"
              value={newColorCode}
              onChange={(e) => setNewColorCode(e.target.value)}
              className="w-24"
              placeholder="#000000"
            />
          </div>
          <Button onClick={addColor} size="sm">
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {/* 색상 목록 */}
        <div className="space-y-2">
          {colors.map((color, index) => (
            <div
              key={color.id || index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: color.code }}
                />
                <span className="font-medium">{color.name}</span>
                <input
                  type="color"
                  value={color.code}
                  onChange={(e) => updateColorCode(index, e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={color.code}
                  onChange={(e) => updateColorCode(index, e.target.value)}
                  className="w-24"
                  placeholder="#000000"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`color-available-${index}`} className="text-sm">
                  판매중
                </Label>
                <Switch
                  id={`color-available-${index}`}
                  checked={color.available}
                  onCheckedChange={() => toggleColorAvailability(index)}
                />
              </div>
              <Button
                onClick={() => removeColor(index)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {colors.length === 0 && (
            <p className="text-gray-500 text-sm">등록된 색상이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 사이즈 관리 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">사이즈 관리</h3>
        
        {/* 사이즈 추가 폼 */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="사이즈명 (예: S, M, L, XL)"
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSize()}
            className="flex-1"
          />
          <Button onClick={addSize} size="sm">
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {/* 사이즈 목록 */}
        <div className="space-y-2">
          {sizes.map((size, index) => (
            <div
              key={size.id || index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium flex-1">{size.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => moveSizeUp(index)}
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  onClick={() => moveSizeDown(index)}
                  size="sm"
                  variant="ghost"
                  disabled={index === sizes.length - 1}
                >
                  ↓
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`size-available-${index}`} className="text-sm">
                  판매중
                </Label>
                <Switch
                  id={`size-available-${index}`}
                  checked={size.available}
                  onCheckedChange={() => toggleSizeAvailability(index)}
                />
              </div>
              <Button
                onClick={() => removeSize(index)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {sizes.length === 0 && (
            <p className="text-gray-500 text-sm">등록된 사이즈가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}