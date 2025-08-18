// Environment variables and constants
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  API_KEY: process.env.NEXT_PUBLIC_API_KEY!,
} as const;

export const WOMPI_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_WOMPI_BASE_URL!,
  PUBLIC_KEY: process.env.NEXT_PUBLIC_WOMPI_KEY!,
  PRIVATE_KEY: process.env.NEXT_PUBLIC_WOMPI_PRIVATE_KEY!,
  INTEGRITY_SECRET: process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_SECRET!,
} as const;

export const DEMO_CONFIG = {
  CUSTOMER_ID: process.env.NEXT_PUBLIC_BYPASS_USER_ID!,
  CUSTOMER_EMAIL: 'demo@example.com',
  CUSTOMER_NAME: 'Cliente DEMO',
  CUSTOMER_PHONE: '+573001234567',
} as const;

// Payment constants
export const PAYMENT_CONFIG = {
  DEFAULT_CURRENCY: 'COP',
  DEFAULT_INSTALLMENTS: 1,
} as const;

// API Headers
export const HEADERS = {
  CONTENT_TYPE: 'application/json',
  API_KEY_HEADER: 'x-api-key',
} as const;