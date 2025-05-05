# Setting Up Environment Variables for Neon PostgreSQL

To complete the migration from Firebase to Neon PostgreSQL, you need to set up the following environment variables in your `.env` file:

1. Create or edit the `.env` file in the `backend` directory with the following content:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgres://username:password@host:port/database
JWT_SECRET=your_jwt_secret_key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3002

# Flutterwave API Keys
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
```

2. Replace the placeholder values with your actual Neon PostgreSQL credentials:
   - Replace `postgres://username:password@host:port/database` with your actual Neon PostgreSQL connection string
   - Replace `your_jwt_secret_key` with a secure random string for JWT token signing
   - Update the Flutterwave API keys if needed

3. After setting up the environment variables, you can run the migration and seed scripts:

```bash
cd /Users/dushimiyimanadavy/CascadeProjects/Iwanyu/backend
npx tsx src/db/migrate.ts
npx tsx src/db/seed.ts
```

4. Once the database is set up, you can start the server:

```bash
cd /Users/dushimiyimanadavy/CascadeProjects/Iwanyu/backend
npm run dev
```

## Getting Neon PostgreSQL Connection String

1. Sign up or log in to [Neon](https://neon.tech/)
2. Create a new project
3. In your project dashboard, click on "Connection Details"
4. Copy the connection string in the format: `postgres://username:password@host:port/database`
5. Paste it as the `DATABASE_URL` value in your `.env` file

## Generating a Secure JWT Secret

You can generate a secure random string for your JWT_SECRET using the following command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` value in the `.env` file.
