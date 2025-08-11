'use client'

import { ProductFormWithImages } from '@/components/products/product-form-with-images'
import { SimpleProductForm } from '@/components/products/simple-product-form'
import ErrorBoundary from '@/components/error-boundary'

export default function TestFormPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 space-y-8">
          <h1 className="text-2xl font-bold mb-8">Form Test</h1>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Simple Form (Working Test)</h2>
            <ErrorBoundary>
              <SimpleProductForm 
                onSubmit={async (data) => {
                  console.log('Simple form data:', data)
                  alert('Simple form submitted successfully!')
                }}
                onCancel={() => {
                  console.log('Simple form cancelled')
                  alert('Simple form cancelled')
                }}
              />
            </ErrorBoundary>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Complex Form (Testing for Errors)</h2>
            <ErrorBoundary>
              <ProductFormWithImages 
                onSubmit={async (data) => {
                  console.log('Complex form data:', data)
                  alert('Complex form submitted successfully!')
                }}
                onCancel={() => {
                  console.log('Complex form cancelled')
                  alert('Complex form cancelled')
                }}
              />
            </ErrorBoundary>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
}