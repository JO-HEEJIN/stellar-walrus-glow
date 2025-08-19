'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RotateCw, RotateCcw, Crop, Download, X, ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner'

interface ImageEditorProps {
  imageUrl: string
  onSave?: (editedImageBlob: Blob, filename: string) => void
  onCancel?: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  sepia: number
  grayscale: number
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0
  })

  useEffect(() => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setOriginalDimensions({ width: image.width, height: image.height })
      setDimensions({ width: image.width, height: image.height })
      setIsLoading(false)
      drawImage()
    }
    image.src = imageUrl
    if (imageRef.current !== image) {
      // @ts-expect-error - We need to assign to readonly ref for this use case
      imageRef.current = image
    }
  }, [imageUrl])

  useEffect(() => {
    if (!isLoading) {
      drawImage()
    }
  }, [rotation, scale, filters, dimensions, cropArea])

  const drawImage = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()

    // Apply filters
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `sepia(${filters.sepia}%)`,
      `grayscale(${filters.grayscale}%)`
    ].join(' ')
    ctx.filter = filterString

    // Move to center and apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Draw image centered
    const drawWidth = originalDimensions.width
    const drawHeight = originalDimensions.height
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

    // Restore context state
    ctx.restore()

    // Draw crop area if active
    if (cropArea && isCropping) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
      
      // Draw crop overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropStart({ x, y })
    setCropArea({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const width = currentX - cropStart.x
    const height = currentY - cropStart.y

    setCropArea({
      x: width > 0 ? cropStart.x : currentX,
      y: height > 0 ? cropStart.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height)
    })
  }

  const handleMouseUp = () => {
    setCropStart(null)
  }

  const applyCrop = () => {
    if (!cropArea || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create temporary canvas for cropped image
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = cropArea.width
    tempCanvas.height = cropArea.height

    // Copy cropped area to temp canvas
    const imageData = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    tempCtx.putImageData(imageData, 0, 0)

    // Update dimensions and reset states
    setDimensions({ width: cropArea.width, height: cropArea.height })
    setCropArea(null)
    setIsCropping(false)

    toast.success('이미지가 잘렸습니다')
  }

  const resetImage = () => {
    setRotation(0)
    setScale(1)
    setCropArea(null)
    setIsCropping(false)
    setDimensions({ width: originalDimensions.width, height: originalDimensions.height })
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0
    })
    toast.success('이미지가 초기화되었습니다')
  }

  const saveImage = async () => {
    const canvas = canvasRef.current
    if (!canvas || !onSave) return

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const filename = `edited-image-${Date.now()}.png`
          onSave(blob, filename)
          toast.success('이미지가 저장되었습니다')
        }
      }, 'image/png', 0.9)
    } catch (error) {
      toast.error('이미지 저장에 실패했습니다')
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const link = document.createElement('a')
      link.download = `edited-image-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('이미지가 다운로드되었습니다')
    } catch (error) {
      toast.error('이미지 다운로드에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">이미지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>이미지 편집기</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetImage}>
                초기화
              </Button>
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download className="h-4 w-4 mr-1" />
                다운로드
              </Button>
              <Button size="sm" onClick={saveImage}>
                저장
              </Button>
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="max-w-full border bg-white shadow-sm cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Tabs defaultValue="transform" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transform">변형</TabsTrigger>
                  <TabsTrigger value="filters">필터</TabsTrigger>
                  <TabsTrigger value="resize">크기</TabsTrigger>
                </TabsList>

                <TabsContent value="transform" className="space-y-4">
                  {/* Rotation */}
                  <div>
                    <Label className="text-sm font-medium">회전</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation(rotation - 90)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation(rotation + 90)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <Label className="text-sm font-medium">확대/축소</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(scale + 0.1)}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Crop */}
                  <div>
                    <Label className="text-sm font-medium">자르기</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant={isCropping ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsCropping(!isCropping)}
                      >
                        <Crop className="h-4 w-4 mr-1" />
                        {isCropping ? '취소' : '시작'}
                      </Button>
                      {cropArea && (
                        <Button size="sm" onClick={applyCrop}>
                          적용
                        </Button>
                      )}
                    </div>
                    {isCropping && (
                      <p className="text-xs text-gray-600 mt-1">
                        마우스로 영역을 드래그하여 자를 부분을 선택하세요
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <Label className="text-sm font-medium">밝기: {filters.brightness}%</Label>
                    <Slider
                      value={[filters.brightness]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, brightness: value }))}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <Label className="text-sm font-medium">대비: {filters.contrast}%</Label>
                    <Slider
                      value={[filters.contrast]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, contrast: value }))}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <Label className="text-sm font-medium">채도: {filters.saturation}%</Label>
                    <Slider
                      value={[filters.saturation]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, saturation: value }))}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <Label className="text-sm font-medium">흐림: {filters.blur}px</Label>
                    <Slider
                      value={[filters.blur]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, blur: value }))}
                      min={0}
                      max={10}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>

                  {/* Sepia */}
                  <div>
                    <Label className="text-sm font-medium">세피아: {filters.sepia}%</Label>
                    <Slider
                      value={[filters.sepia]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, sepia: value }))}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Grayscale */}
                  <div>
                    <Label className="text-sm font-medium">흑백: {filters.grayscale}%</Label>
                    <Slider
                      value={[filters.grayscale]}
                      onValueChange={([value]) => setFilters(prev => ({ ...prev, grayscale: value }))}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="resize" className="space-y-4">
                  {/* Width */}
                  <div>
                    <Label className="text-sm font-medium">가로</Label>
                    <Input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <Label className="text-sm font-medium">세로</Label>
                    <Input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Aspect Ratio Presets */}
                  <div>
                    <Label className="text-sm font-medium">비율 프리셋</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ width: 800, height: 600 })}
                      >
                        4:3
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ width: 800, height: 450 })}
                      >
                        16:9
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ width: 600, height: 600 })}
                      >
                        1:1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions(originalDimensions)}
                      >
                        원본
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}