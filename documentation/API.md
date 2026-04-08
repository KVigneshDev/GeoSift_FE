# API Documentation

## GraphQL API Integration

This document describes the GraphQL API integration and usage patterns in the Apollo Client application.

## Table of Contents

1. [Connection Configuration](#connection-configuration)
2. [Authentication](#authentication)
3. [Queries](#queries)
4. [Mutations](#mutations)
5. [Fragments](#fragments)
6. [Error Handling](#error-handling)
7. [Usage Examples](#usage-examples)

## Connection Configuration

### Endpoint

```typescript
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
```

### Apollo Client Setup

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
```

## Authentication

### Token Management

All authenticated requests include a JWT token in the Authorization header:

```typescript
headers: {
  'Authorization': `${token}`
}
```

### Auth Flow

1. **Login/Register** → Receive token
2. **Store token** → localStorage
3. **Add to requests** → Auth Link
4. **Validate** → On each request
5. **Clear on error** → Auto-logout

## Queries

### GET_ME

Retrieves the current authenticated user's information.

**Query:**
```graphql
query GetMe {
  me {
    id
    name
    email
    phone
    organization {
      id
      name
    }
  }
}
```

**Response:**
```typescript
{
  me: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    organization: {
      id: string;
      name: string;
    };
  }
}
```

**Usage:**
```typescript
import { useQuery } from '@apollo/client';
import { GET_ME } from '@/apollo/operations';

function UserProfile() {
  const { data, loading, error } = useQuery(GET_ME);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {data.me.name}!</div>;
}
```

**Error Codes:**
- `UNAUTHENTICATED`: User is not authenticated (triggers auto-logout)

## Mutations

### LOGIN_MUTATION

Authenticates a user and returns a JWT token.

**Mutation:**
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      name
      email
      phone
      organization {
        id
        name
      }
    }
  }
}
```

**Variables:**
```typescript
{
  email: string;    // User's email address
  password: string; // User's password
}
```

**Response:**
```typescript
{
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      organization: {
        id: string;
        name: string;
      };
    }
  }
}
```

**Usage:**
```typescript
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/apollo/operations';

function LoginForm() {
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('authToken', data.login.token);
      // Handle successful login
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const handleSubmit = (email: string, password: string) => {
    login({ variables: { email, password } });
  };

  return (
    // Your form JSX
  );
}
```

**Error Cases:**
- Invalid email format
- Incorrect password
- User not found
- Account locked/disabled

### REGISTER_MUTATION

Creates a new user account.

**Mutation:**
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input)
}
```

**Variables:**
```typescript
{
  input: {
    name: string;         // User's full name
    email: string;        // User's email address
    password: string;     // User's password
    phone: string;        // User's phone number
    organization: string; // Organization name
  }
}
```

**Response:**
```typescript
{
  register: boolean; // Returns true on success
}
```

**Usage:**
```typescript
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '@/apollo/operations';

function RegisterForm() {
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      // Registration successful, prompt user to login
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    }
  });

  const handleSubmit = (userData) => {
    register({ variables: { input: userData } });
  };

  return (
    // Your form JSX
  );
}
```

**Error Cases:**
- Email already exists
- Invalid email format
- Password too weak
- Required fields missing
- Organization validation failed

## Fragments

### USER_FRAGMENT

Reusable fragment for user fields.

```graphql
fragment UserFields on User {
  id
  name
  email
  phone
  organization {
    id
    name
  }
}
```

**Usage:**
```graphql
query GetMe {
  me {
    ...UserFields
  }
}
```

**Benefits:**
- Consistency across queries
- Easy maintenance
- DRY principle
- Type safety

## Error Handling

### Error Types

#### 1. GraphQL Errors

Errors returned by the GraphQL server.

**Structure:**
```typescript
{
  message: string;
  extensions?: {
    code: string;
    // Additional error metadata
  };
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}
```

**Common Codes:**
- `UNAUTHENTICATED`: Not authenticated
- `FORBIDDEN`: Not authorized
- `BAD_USER_INPUT`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server error

#### 2. Network Errors

Connection or HTTP errors.

**Examples:**
- Connection refused
- Timeout
- Server unreachable
- CORS issues

### Global Error Handling

```typescript
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: ${message}`);
      
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear auth and redirect
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});
```

### Component-Level Error Handling

```typescript
const { data, loading, error } = useQuery(GET_ME, {
  onError: (error) => {
    // Handle specific error
    if (error.graphQLErrors[0]?.extensions?.code === 'NOT_FOUND') {
      // Handle not found
    }
  }
});
```

## Usage Examples

### Example 1: Fetching User Data

```typescript
import { useQuery } from '@apollo/client';
import { GET_ME } from '@/apollo/operations';

function Dashboard() {
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('User data loaded:', data.me);
    }
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Welcome, {data.me.name}</h1>
      <p>Email: {data.me.email}</p>
      <p>Organization: {data.me.organization.name}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Example 2: Login Form

```typescript
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/apollo/operations';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('authToken', data.login.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login({ variables: { email, password } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 3: Register Form

```typescript
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '@/apollo/operations';
import toast from 'react-hot-toast';

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
  });

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      toast.success('Registration successful! Please login.');
      // Switch to login form
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register({ variables: { input: formData } });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### Example 4: Using Auth Context

```typescript
import { useAuth } from '@/hooks/useAuth';

function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>Logged in as: {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Advanced Patterns

### Optimistic Updates

```typescript
const [updateUser] = useMutation(UPDATE_USER, {
  optimisticResponse: {
    updateUser: {
      __typename: 'User',
      id: userId,
      name: newName
    }
  },
  update: (cache, { data }) => {
    cache.modify({
      id: cache.identify(data.updateUser),
      fields: {
        name: () => data.updateUser.name
      }
    });
  }
});
```

### Refetching Queries

```typescript
const [login] = useMutation(LOGIN_MUTATION, {
  refetchQueries: [{ query: GET_ME }],
  awaitRefetchQueries: true
});
```

### Polling

```typescript
const { data, startPolling, stopPolling } = useQuery(GET_ME, {
  pollInterval: 5000 // Poll every 5 seconds
});
```

### Lazy Queries

```typescript
const [getUser, { called, loading, data }] = useLazyQuery(GET_ME);

// Call when needed
const handleClick = () => {
  getUser();
};
```

## Best Practices

1. **Always handle errors** in both `onError` callback and component rendering
2. **Use fragments** for consistent data fetching
3. **Implement loading states** for better UX
4. **Cache properly** to avoid unnecessary network requests
5. **Type all operations** with TypeScript
6. **Use meaningful operation names** for debugging
7. **Test error scenarios** thoroughly
8. **Implement retry logic** for network failures

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check token in localStorage
   - Verify token format
   - Ensure Auth Link is configured

2. **Network Error**
   - Check server is running
   - Verify endpoint URL
   - Check CORS configuration

3. **GraphQL Error**
   - Check operation syntax
   - Verify variable types
   - Check server logs

4. **Cache Issues**
   - Clear cache: `apolloClient.clearStore()`
   - Check cache configuration
   - Verify type policies

## API Versioning

Current API version: **v1**

Future versions will maintain backward compatibility or provide migration paths.

## Rate Limiting

Check with your Apollo Server configuration for rate limiting details.

## Support

For API-related issues, check:
1. Browser console for errors
2. Network tab for request/response
3. Apollo DevTools for cache and queries
4. Server logs for backend issues
