# CLAUDE.md - Project Context for Claude

## 7 Rules

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.

## Security prompt

Please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited

## Learning from Claude prompt

Please explain the functionality and code you just built out in detail. Walk me through wehat you changed and how it works. Act like you’re a senior engineer teaching me code




## Commands
### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start Production
```bash
npm run start
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## Project Structure
- `/app` - Next.js 14 App Router directory
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/middleware.ts` - Next.js middleware for auth and security

## Key Technologies
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js (Authentication)
- Prisma (ORM)
- AWS Cognito (Auth Provider)
- AWS S3 (File Storage)
- Upstash Redis (Rate Limiting)
- Vercel (Deployment)

## Security Features
- CSP headers with nonce
- Rate limiting
- JWT-based authentication
- Role-based access control (RBAC)
- Security headers (HSTS, X-Frame-Options, etc.)

## Recent Updates
- Migrated from Vite to Next.js 14
- Set up project structure for K-Fashion platform
- Configured TypeScript with strict mode
- Added security middleware with CSP headers
- Created type definitions for the domain model
- Implemented AWS Cognito authentication with NextAuth v5
- Created dashboard layout with role-based navigation
- Added placeholder pages for products, orders, brands, and users
- Implemented role-based access control (BUYER, BRAND_ADMIN, MASTER_ADMIN)
- Fixed all ESLint and TypeScript errors
- Implemented rate limiting with Upstash Redis
- Created API endpoints for products, orders, users, and health check
- Added error boundary and 404 pages
- Set up mock data responses for testing without database
- Created product management UI with list and form components
- Implemented order management with detailed order view
- Added shopping cart functionality using Zustand for state management
- Integrated Tailwind CSS Forms plugin for better form styling

## Authentication Details
- **AWS Cognito Configuration**:
  - Client ID: r03rnf7k4b9fafv8rs5av22it
  - User Pool: ap-northeast-1_xV5GZRniK
  - Region: ap-northeast-1
  - Callback URL: http://localhost:3000/api/auth/callback/cognito
  - Sign out URL: http://localhost:3000
  - **IMPORTANT**: Make sure `http://localhost:3000` is added to the "Allowed sign-out URLs" in your Cognito App Client settings

## Current Status
✅ Authentication with AWS Cognito working  
✅ Role-based access control implemented  
✅ Basic layout and navigation structure  
✅ Dashboard and placeholder pages created  
✅ TypeScript and ESLint configured  
✅ Rate limiting with Upstash Redis implemented  
✅ API endpoints created with mock data  
✅ Error handling and 404 pages added  
✅ Product management UI (list, create, delete)  
✅ Order management UI with detail view  
✅ Shopping cart functionality  
⏳ Database connection pending setup  
⏳ Real data implementation pending  
⏳ Image upload for products pending

## API Endpoints

### Health Check
- `GET /api/health` - Check system health and service status

### Products
- `GET /api/products` - List products (authenticated)
- `POST /api/products` - Create product (BRAND_ADMIN, MASTER_ADMIN only)

### Orders
- `GET /api/orders` - List orders (filtered by user role)
- `POST /api/orders` - Create order (authenticated)

### Users
- `GET /api/users` - List users (MASTER_ADMIN only)
- `PATCH /api/users` - Update user (MASTER_ADMIN only)

### Rate Limits
- API endpoints: 10 requests per 10 seconds
- Auth attempts: 5 per 15 minutes
- Product creation: 20 per hour
- Order creation: 50 per hour

## Important Notes

### Rate Limiting
Rate limiting with Upstash Redis is optional. The application will work without Redis configuration and will use mock rate limiters. To enable actual rate limiting:
1. Create an Upstash Redis database at https://upstash.com
2. Update the environment variables:
   - `UPSTASH_REDIS_REST_URL`: Your Redis REST URL (must start with https://)
   - `UPSTASH_REDIS_REST_TOKEN`: Your Redis REST token

### Database
The application currently works with mock data. To connect a real database:
1. Set up AWS Aurora MySQL or any MySQL-compatible database
2. Update `DATABASE_URL` in `.env`
3. Run `npm run prisma:migrate` to create tables
4. Run `npm run prisma:generate` to generate the Prisma client

### Authentication Issues

#### Sign Out
The sign-out functionality uses NextAuth's built-in signOut which handles CSRF tokens automatically. If you experience issues with logout:
1. Make sure you're using the form-based sign out button (not a client-side fetch)
2. Clear browser cookies manually if needed
3. The app will clear local storage automatically on sign out

#### Role Assignment
Roles are assigned based on email addresses for testing:
- `master@kfashion.com` → MASTER_ADMIN
- `brand@kfashion.com` → BRAND_ADMIN
- All other emails → BUYER

To use Cognito groups for role assignment, add users to these groups in AWS Cognito:
- `master-admins` → MASTER_ADMIN role
- `brand-admins` → BRAND_ADMIN role

## Next Steps
1. Set up database connection to AWS Aurora MySQL
2. Configure Upstash Redis for production rate limiting
3. Set up AWS S3 for image uploads
4. Implement search and filtering with database queries
5. Add real-time notifications with WebSockets
6. Create analytics dashboard with charts
7. Add internationalization (i18n) support
8. Implement email notifications
9. Add payment gateway integration
10. Set up monitoring and logging