'use client'

import { ProductFormWithImages } from '@/components/products/product-form-with-images'

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Image Upload</h1>
        <p className="text-gray-600">Test the S3 image upload functionality with product creation</p>
      </div>
      
      <ProductFormWithImages
        onSubmit={async (data) => {
          console.log('Product data with images:', data)
          // Handle successful submission
          alert('Product created successfully! Check console for data.')
        }}
        onCancel={() => {
          console.log('Form cancelled')
        }}
      />
    </div>
  )
}