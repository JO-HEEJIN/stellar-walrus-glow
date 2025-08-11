'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDebugPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debugFetch() {
      console.log('🔍 Debug: Starting product fetch for ID:', params.id);
      
      try {
        const apiUrl = `/api/products/${params.id}`;
        console.log('🔍 Debug: API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('🔍 Debug: Response status:', response.status);
        console.log('🔍 Debug: Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('🔍 Debug: Raw response text:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('🔍 Debug: Parsed JSON:', data);
        } catch (parseError) {
          console.error('🔍 Debug: JSON parse error:', parseError);
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (!response.ok) {
          console.error('🔍 Debug: API Error response:', data);
          throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        setDebugInfo({
          success: true,
          status: response.status,
          data: data,
          productId: params.id,
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        console.error('🔍 Debug: Fetch error:', error);
        
        setDebugInfo({
          success: false,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          productId: params.id,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }

    debugFetch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>
        <p>Loading product {params.id}...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>
      <div className="mb-4">
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
        >
          뒤로가기
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          새로고침
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
        <pre className="text-sm overflow-auto bg-white p-4 rounded border">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {debugInfo.success && debugInfo.data?.data?.product && (
        <div className="mt-6 bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2 text-green-800">Product Data Preview:</h2>
          <p><strong>Name:</strong> {debugInfo.data.data.product.name}</p>
          <p><strong>Brand:</strong> {debugInfo.data.data.product.brandName}</p>
          <p><strong>Price:</strong> ₩{debugInfo.data.data.product.discountPrice?.toLocaleString()}</p>
          <p><strong>Images:</strong> {debugInfo.data.data.product.images?.length || 0} images</p>
        </div>
      )}

      {!debugInfo.success && (
        <div className="mt-6 bg-red-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2 text-red-800">Error Details:</h2>
          <p><strong>Message:</strong> {debugInfo.error?.message}</p>
          <p><strong>Product ID:</strong> {debugInfo.productId}</p>
        </div>
      )}
    </div>
  );
}