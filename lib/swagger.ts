import { Options } from 'swagger-jsdoc'

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NIA INTERNATIONAL Platform API',
      version: '1.0.0',
      description: 'API documentation for NIA INTERNATIONAL B2B wholesale platform',
      contact: {
        name: 'NIA INTERNATIONAL Support',
        email: 'master@k-fashions.com',
      },
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization header using the Bearer scheme',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
            requestId: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            brandId: { type: 'string' },
            sku: { type: 'string', description: 'Stock Keeping Unit - unique product identifier' },
            nameKo: { type: 'string' },
            nameCn: { type: 'string' },
            descriptionKo: { type: 'string' },
            descriptionCn: { type: 'string' },
            categoryId: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] },
            basePrice: { type: 'number' },
            inventory: { type: 'integer' },
            images: { type: 'array', items: { type: 'string' } },
            options: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            userId: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] 
            },
            totalAmount: { type: 'number' },
            shippingAddress: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                addressDetail: { type: 'string' },
                zipCode: { type: 'string' },
              },
            },
            paymentMethod: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                  options: { type: 'object' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Brand: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nameKo: { type: 'string' },
            nameCn: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./app/api/**/*.ts'],
}