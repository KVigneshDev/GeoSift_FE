import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const USER_FRAGMENT = gql`
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
`;

// ==================== QUERIES ====================

export const GET_ME = gql`
  ${USER_FRAGMENT}
  query GetMe {
    me {
      ...UserFields
    }
  }
`;

// ==================== MUTATIONS ====================

export const LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input)
  }
`;