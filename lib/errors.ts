// Comprehensive Error Handling System

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// HTTP Status Codes
export enum HttpStatus {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  // 4xx Client Error
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Business Error Codes
export const ErrorCodes = {
  // Authentication & Authorization (1xxx)
  AUTH_INVALID_CREDENTIALS: '1001',
  AUTH_EMAIL_EXISTS: '1002',
  AUTH_SESSION_EXPIRED: '1003',
  AUTH_INSUFFICIENT_PERMISSION: '1004',
  AUTH_ACCOUNT_LOCKED: '1005',
  AUTH_INVALID_TOKEN: '1006',
  AUTHENTICATION_REQUIRED: '1007',
  AUTHORIZATION_ROLE_REQUIRED: '1008',
  AUTHENTICATION_INVALID: '1009',
  AUTHORIZATION_INSUFFICIENT_PERMISSIONS: '1010',

  // User Management (11xx)
  USER_NOT_FOUND: '1101',
  USER_ALREADY_EXISTS: '1102',
  USER_INVALID_STATUS: '1103',
  USER_CANNOT_DELETE: '1104',
  USER_EMAIL_EXISTS: '1105',

  // Product Management (2xxx)
  PRODUCT_NOT_FOUND: '2001',
  PRODUCT_SKU_EXISTS: '2002',
  PRODUCT_INSUFFICIENT_INVENTORY: '2003',
  PRODUCT_INVALID_PRICE: '2004',
  PRODUCT_INVALID_STATUS: '2005',
  PRODUCT_BRAND_MISMATCH: '2006',
  PRODUCT_IN_USE: '2007',

  // Brand Management (25xx)
  BRAND_NOT_FOUND: '2501',
  BRAND_ALREADY_EXISTS: '2502',

  // Order Management (3xxx)
  ORDER_NOT_FOUND: '3001',
  ORDER_INVALID_STATUS: '3002',
  ORDER_MIN_AMOUNT_NOT_MET: '3003',
  ORDER_INVALID_TRANSITION: '3004',
  ORDER_PAYMENT_FAILED: '3005',
  ORDER_ALREADY_CANCELLED: '3006',
  ORDER_INVALID_STATUS_TRANSITION: '3007',

  // File Management (4xxx)
  FILE_TOO_LARGE: '4001',
  FILE_INVALID_TYPE: '4002',
  FILE_UPLOAD_FAILED: '4003',
  FILE_NOT_FOUND: '4004',

  // Payment (5xxx)
  PAYMENT_INVALID_METHOD: '5001',
  PAYMENT_PROCESSING_ERROR: '5002',
  PAYMENT_VERIFICATION_FAILED: '5003',

  // Validation Errors (8xxx)
  VALIDATION_FAILED: '8001',
  
  // System Errors (9xxx)
  SYSTEM_DATABASE_ERROR: '9001',
  SYSTEM_EXTERNAL_SERVICE_ERROR: '9002',
  SYSTEM_RATE_LIMIT_EXCEEDED: '9003',
  SYSTEM_MAINTENANCE: '9004',
  SYSTEM_UNKNOWN_ERROR: '9999'
} as const

// Error Messages (Korean)
export const ErrorMessages: Record<string, string> = {
  // Authentication & Authorization
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [ErrorCodes.AUTH_EMAIL_EXISTS]: '이미 사용중인 이메일입니다.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
  [ErrorCodes.AUTH_INSUFFICIENT_PERMISSION]: '권한이 없습니다.',
  [ErrorCodes.AUTH_ACCOUNT_LOCKED]: '계정이 잠겼습니다. 고객센터에 문의해주세요.',
  [ErrorCodes.AUTH_INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ErrorCodes.AUTHENTICATION_REQUIRED]: '인증이 필요합니다.',
  [ErrorCodes.AUTHORIZATION_ROLE_REQUIRED]: '필요한 권한이 없습니다.',
  [ErrorCodes.AUTHENTICATION_INVALID]: '유효하지 않은 인증입니다.',
  [ErrorCodes.AUTHORIZATION_INSUFFICIENT_PERMISSIONS]: '권한이 부족합니다.',

  // User Management
  [ErrorCodes.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [ErrorCodes.USER_ALREADY_EXISTS]: '이미 존재하는 사용자입니다.',
  [ErrorCodes.USER_INVALID_STATUS]: '유효하지 않은 사용자 상태입니다.',
  [ErrorCodes.USER_CANNOT_DELETE]: '해당 사용자는 삭제할 수 없습니다.',
  [ErrorCodes.USER_EMAIL_EXISTS]: '이미 사용중인 이메일입니다.',

  // Product Management
  [ErrorCodes.PRODUCT_NOT_FOUND]: '상품을 찾을 수 없습니다.',
  [ErrorCodes.PRODUCT_SKU_EXISTS]: '이미 사용중인 SKU입니다.',
  [ErrorCodes.PRODUCT_INSUFFICIENT_INVENTORY]: '재고가 부족합니다.',
  [ErrorCodes.PRODUCT_INVALID_PRICE]: '유효하지 않은 가격입니다.',
  [ErrorCodes.PRODUCT_INVALID_STATUS]: '유효하지 않은 상품 상태입니다.',
  [ErrorCodes.PRODUCT_BRAND_MISMATCH]: '브랜드가 일치하지 않습니다.',
  [ErrorCodes.PRODUCT_IN_USE]: '이 상품은 주문에서 사용 중이므로 삭제할 수 없습니다.',

  // Brand Management
  [ErrorCodes.BRAND_NOT_FOUND]: '브랜드를 찾을 수 없습니다.',
  [ErrorCodes.BRAND_ALREADY_EXISTS]: '이미 존재하는 브랜드입니다.',

  // Order Management
  [ErrorCodes.ORDER_NOT_FOUND]: '주문을 찾을 수 없습니다.',
  [ErrorCodes.ORDER_INVALID_STATUS]: '유효하지 않은 주문 상태입니다.',
  [ErrorCodes.ORDER_MIN_AMOUNT_NOT_MET]: '최소 주문 금액을 충족하지 않습니다.',
  [ErrorCodes.ORDER_INVALID_TRANSITION]: '해당 상태로 변경할 수 없습니다.',
  [ErrorCodes.ORDER_PAYMENT_FAILED]: '결제 처리에 실패했습니다.',
  [ErrorCodes.ORDER_ALREADY_CANCELLED]: '이미 취소된 주문입니다.',
  [ErrorCodes.ORDER_INVALID_STATUS_TRANSITION]: '유효하지 않은 주문 상태 변경입니다.',

  // File Management
  [ErrorCodes.FILE_TOO_LARGE]: '파일 크기가 너무 큽니다.',
  [ErrorCodes.FILE_INVALID_TYPE]: '지원하지 않는 파일 형식입니다.',
  [ErrorCodes.FILE_UPLOAD_FAILED]: '파일 업로드에 실패했습니다.',
  [ErrorCodes.FILE_NOT_FOUND]: '파일을 찾을 수 없습니다.',

  // Payment
  [ErrorCodes.PAYMENT_INVALID_METHOD]: '유효하지 않은 결제 수단입니다.',
  [ErrorCodes.PAYMENT_PROCESSING_ERROR]: '결제 처리 중 오류가 발생했습니다.',
  [ErrorCodes.PAYMENT_VERIFICATION_FAILED]: '결제 검증에 실패했습니다.',

  // Validation Errors
  [ErrorCodes.VALIDATION_FAILED]: '입력값이 유효하지 않습니다.',

  // System Errors
  [ErrorCodes.SYSTEM_DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [ErrorCodes.SYSTEM_EXTERNAL_SERVICE_ERROR]: '외부 서비스 오류가 발생했습니다.',
  [ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED]: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorCodes.SYSTEM_MAINTENANCE]: '시스템 점검 중입니다.',
  [ErrorCodes.SYSTEM_UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.'
}

// Custom Business Error Class
export class BusinessError extends Error {
  constructor(
    public code: string,
    public statusCode: HttpStatus,
    public details?: any
  ) {
    super(ErrorMessages[code] || '오류가 발생했습니다.')
    this.name = 'BusinessError'
  }
}

// Error Response Builder
export function createErrorResponse(
  error: BusinessError | Error,
  path: string
): NextResponse {
  const timestamp = new Date().toISOString()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

  if (error instanceof BusinessError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        timestamp,
        path,
        requestId
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 유효하지 않습니다.',
          details: error.errors
        },
        timestamp,
        path,
        requestId
      },
      { status: HttpStatus.BAD_REQUEST }
    )
  }

  // Generic error
  console.error('Unhandled error:', error)
  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.SYSTEM_UNKNOWN_ERROR,
        message: ErrorMessages[ErrorCodes.SYSTEM_UNKNOWN_ERROR]
      },
      timestamp,
      path,
      requestId
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  )
}

// Common error responses
export const CommonErrors = {
  unauthorized: () => new BusinessError(
    ErrorCodes.AUTH_INVALID_CREDENTIALS,
    HttpStatus.UNAUTHORIZED
  ),
  
  forbidden: () => new BusinessError(
    ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
    HttpStatus.FORBIDDEN
  ),
  
  notFound: (resource: string) => new BusinessError(
    ErrorCodes.PRODUCT_NOT_FOUND,
    HttpStatus.NOT_FOUND,
    { resource }
  ),
  
  conflict: (message: string) => new BusinessError(
    ErrorCodes.PRODUCT_SKU_EXISTS,
    HttpStatus.CONFLICT,
    { message }
  ),
  
  invalidRequest: (details?: any) => new BusinessError(
    ErrorCodes.SYSTEM_UNKNOWN_ERROR,
    HttpStatus.BAD_REQUEST,
    details
  ),
  
  rateLimitExceeded: () => new BusinessError(
    ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
    HttpStatus.TOO_MANY_REQUESTS
  )
}