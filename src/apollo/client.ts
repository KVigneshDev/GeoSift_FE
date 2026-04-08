import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// HTTP Link
const httpLink = new HttpLink({
  uri: (import.meta as any).env.VITE_GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
});

// Auth Link - Adds authentication token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');

  return {
    headers: {
      ...headers,
      authorization: token || '',
    },
  };
});

// Error Link - Global error handling
const errorLink = onError(({ graphQLErrors, networkError, operation: _operation, forward: _forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear auth token
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Retry Link - Retry failed requests
const retryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let retries = 0;
    const maxRetries = 3;

    const attemptRequest = () => {
      forward(operation).subscribe({
        next: (result) => observer.next(result),
        error: (error) => {
          if (retries < maxRetries && isRetryableError(error)) {
            retries++;
            console.log(`Retrying request (${retries}/${maxRetries})...`);
            setTimeout(attemptRequest, 1000 * retries);
          } else {
            observer.error(error);
          }
        },
        complete: () => observer.complete(),
      });
    };

    attemptRequest();
  });
});

// Helper function to determine if error is retryable
const isRetryableError = (error: any): boolean => {
  return (
    error.networkError &&
    !error.graphQLErrors?.some(
      (e: any) => e.extensions?.code === 'UNAUTHENTICATED'
    )
  );
};

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        me: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        // Cache propertyFeatures by propertyId so repeated clicks on the same
        // building are served instantly from cache without a network round-trip.
        propertyFeatures: {
          keyArgs: ['propertyId'],
          merge(_existing, incoming) {
            return incoming;
          },
        },
        // availableFilters are keyed by bbox + filters so each unique
        // combination gets its own cache entry.
        availableFilters: {
          keyArgs: ['bbox', 'filters'],
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    User: {
      keyFields: ['id'],
    },
    Organization: {
      keyFields: ['id'],
    },
    // PropertyLayout has a stable id field — use it as the cache key.
    PropertyLayout: {
      keyFields: ['id'],
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache,
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
  connectToDevTools: true,
});

// Helper function to clear Apollo cache
export const clearApolloCache = async () => {
  await apolloClient.clearStore();
};

// Helper function to reset Apollo store
export const resetApolloStore = async () => {
  await apolloClient.resetStore();
};