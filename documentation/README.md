# Apollo Client Application

A modern, scalable, and robust GraphQL Apollo Client application built with React, TypeScript, and Apollo Client. This application integrates seamlessly with your Apollo Server backend.

## 🚀 Features

- **Apollo Client Integration**: Full-featured GraphQL client with caching, error handling, and optimistic updates
- **Type-Safe GraphQL**: TypeScript integration with GraphQL Code Generator for type-safe queries and mutations
- **Authentication System**: Complete auth flow with JWT token management
- **Protected Routes**: Route protection based on authentication status
- **Error Handling**: Comprehensive error handling for network and GraphQL errors
- **Retry Logic**: Automatic retry for failed network requests
- **Context Management**: React Context for global auth state
- **Modern UI**: Beautiful, responsive UI built with Tailwind CSS
- **Toast Notifications**: User-friendly notifications for all actions

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running Apollo Server (from your backend)

## 🛠️ Installation

1. **Clone or extract the project:**
   ```bash
   cd apollo-client-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your GraphQL endpoint:
   ```
   VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   ```

4. **Generate TypeScript types from GraphQL schema (optional):**
   ```bash
   npm run codegen
   ```
   
   Note: Make sure your Apollo Server is running before running codegen.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
apollo-client-app/
├── src/
│   ├── apollo/
│   │   ├── client.ts              # Apollo Client configuration
│   │   ├── operations.ts          # GraphQL queries and mutations
│   │   └── generated/             # Generated TypeScript types (after codegen)
│   ├── components/
│   │   ├── InputField.tsx         # Reusable input component
│   │   └── ProtectedRoute.tsx    # Route protection wrapper
│   ├── hooks/
│   │   └── useAuth.tsx            # Auth context and hook
│   ├── pages/
│   │   ├── LandingPage.tsx        # Login/Register page
│   │   ├── Dashboard.tsx          # Protected dashboard
│   │   └── NotFound.tsx           # 404 page
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── codegen.ts                     # GraphQL Code Generator config
```

## 🔑 Key Features Explained

### Apollo Client Configuration

The Apollo Client is configured with multiple links for enhanced functionality:

- **HTTP Link**: Connects to your GraphQL server
- **Auth Link**: Automatically adds JWT token to requests
- **Error Link**: Global error handling and automatic logout on auth errors
- **Retry Link**: Retries failed network requests automatically

### Authentication Flow

1. User registers or logs in via the Landing Page
2. JWT token is stored in localStorage and Apollo Client headers
3. User is redirected to the protected Dashboard
4. All subsequent requests include the JWT token
5. On logout, token is cleared and cache is reset

### Type Safety

GraphQL operations are co-located with their usage, and TypeScript types can be automatically generated using:

```bash
npm run codegen
```

This generates:
- Types for all GraphQL operations
- React hooks for queries and mutations
- Full type safety across the application

### Error Handling

The application handles errors at multiple levels:

1. **Network Errors**: Automatic retries with exponential backoff
2. **GraphQL Errors**: Parsed and displayed to users
3. **Authentication Errors**: Automatic logout and redirect
4. **Validation Errors**: Form validation with inline error messages

### Apollo Client Options

Modify Apollo Client behavior in `src/apollo/client.ts`:

```typescript
defaultOptions: {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  // ... more options
}
```

## 🔒 Security

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All GraphQL requests are authenticated via Authorization header
- Automatic token expiration handling
- XSS protection through React's built-in sanitization
- CSRF protection through Apollo Server configuration

## 🧪 Testing

To test the application:

1. Ensure your Apollo Server is running
2. Start the development server: `npm run dev`
3. Register a new user
4. Login with the registered credentials
5. Access the protected dashboard
6. Test logout functionality

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist` directory.

## 🚀 Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Integration with Apollo Server

This client is designed to work with your Apollo Server. Ensure your server:

1. Accepts JWT tokens in the Authorization header
2. Implements the GraphQL schema defined in your `user.graphql` and `auth.graphql` files
3. Has CORS properly configured for your client domain
4. Returns errors in the standard GraphQL error format

## 📚 Additional Resources

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## Code Style

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- **Types**: PascalCase (`UserType`)

### Import Order

1. React imports
2. Third-party imports
3. Local imports (absolute paths with @/)
4. Relative imports
5. Styles

## Debugging

### Browser DevTools

#### React DevTools
- Install React DevTools extension
- Inspect component hierarchy
- View props and state
- Profile performance

#### Apollo Client DevTools
- Install Apollo Client DevTools extension
- View queries and mutations
- Inspect cache
- Track network requests

## 🐛 Troubleshooting

### Cannot connect to GraphQL server
- Ensure your Apollo Server is running
- Check the `VITE_GRAPHQL_ENDPOINT` in your `.env` file
- Verify CORS is configured on your server

### Authentication not persisting
- Check browser localStorage for `authToken`
- Verify JWT token format and expiration
- Check browser console for errors

### Types not generating
- Ensure Apollo Server is running before running codegen
- Check the schema URL in `codegen.ts`
- Verify network connectivity to the server

## 📝 License

MIT

## 👥 Support

For issues and questions, please refer to the documentation or create an issue in the repository.
