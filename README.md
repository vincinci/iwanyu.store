# Iwanyu Store Rwanda

Iwanyu is a modern e-commerce platform built for the Rwandan market, featuring:

## Features

- Multi-language support (English, Kinyarwanda, French)
- Vendor application and subscription system
- Product catalog with categories
- User authentication and profiles
- Shopping cart and checkout
- Payment processing with Flutterwave

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **Hosting**: Render (Backend and Frontend)

## Deployment

The application is deployed with:
- Backend API: https://iwanyu-store.onrender.com
- Frontend: https://iwanyu-frontend.onrender.com

## Environment Variables

### Backend
- DATABASE_URL
- JWT_SECRET
- FRONTEND_URL
- FLUTTERWAVE_PUBLIC_KEY
- FLUTTERWAVE_SECRET_KEY
- FLUTTERWAVE_ENCRYPTION_KEY

### Frontend
- NEXT_PUBLIC_API_URL

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Davy-00/iwanyustorerw.git

# Install dependencies
npm install

# Run the development server
npm run dev
```
