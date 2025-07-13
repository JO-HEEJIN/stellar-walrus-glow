'use client'

import { useState } from 'react'

export default function TestRateLimitPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const testRateLimit = async () => {
    setLoading(true)
    const newResults: string[] = []

    // Make 15 rapid requests to test rate limiting
    for (let i = 0; i < 15; i++) {
      try {
        const response = await fetch('/api/products')
        const status = response.status
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
        
        if (status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          newResults.push(`Request ${i + 1}: Rate limited! Retry after ${retryAfter}s`)
        } else if (status === 401) {
          newResults.push(`Request ${i + 1}: Unauthorized (not logged in)`)
        } else {
          newResults.push(`Request ${i + 1}: Success (${status}), Remaining: ${rateLimitRemaining || 'N/A'}`)
        }
      } catch (error) {
        newResults.push(`Request ${i + 1}: Error - ${error}`)
      }
    }

    setResults(newResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Rate Limiting Test</h1>
      
      <div className="mb-4 p-4 bg-yellow-50 rounded">
        <p className="text-sm text-yellow-800">
          This page tests the rate limiting functionality. The API allows 10 requests per 10 seconds.
        </p>
        <p className="text-sm text-yellow-800 mt-1">
          Note: Rate limiting requires Upstash Redis to be configured with UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.
        </p>
      </div>

      <button
        onClick={testRateLimit}
        disabled={loading}
        className="mb-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Rate Limiting (15 requests)'}
      </button>

      {results.length > 0 && (
        <div className="space-y-1">
          <h2 className="font-semibold mb-2">Results:</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className={`text-sm p-2 rounded ${
                result.includes('Rate limited')
                  ? 'bg-red-50 text-red-800'
                  : result.includes('Success')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50 text-gray-800'
              }`}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}