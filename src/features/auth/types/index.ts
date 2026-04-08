// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: Organization;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  organization: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  organization: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}