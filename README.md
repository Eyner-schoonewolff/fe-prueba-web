# FE Prueba App

# dominio Amplify
- https://develop.d1evdclv6vuhvn.amplifyapp.com

Aplicación frontend (Next.js) para demo de pagos con Wompi y backend propio.

## Requisitos
- Node.js >= 18
- npm (o pnpm/yarn)

## Instalación y ejecución
1) Instalar dependencias
- cd fe_prueba_app
- npm install

2) Configurar variables de entorno creando un archivo .env en la raíz del proyecto con las siguientes claves:
- NEXT_PUBLIC_API_BASE_URL=URL base del backend (ej: http://localhost:9000)
- NEXT_PUBLIC_API_KEY=API Key para el backend
- NEXT_PUBLIC_WOMPI_BASE_URL=URL base de la API de Wompi (sandbox o producción)
- NEXT_PUBLIC_WOMPI_KEY=Public Key de Wompi (pk_…)
- NEXT_PUBLIC_WOMPI_PRIVATE_KEY=Private Key de Wompi (prv_…)
- NEXT_PUBLIC_WOMPI_INTEGRITY_SECRET=Integrity Signature Secret de Wompi
- NEXT_PUBLIC_BYPASS_USER_ID=ID de cliente DEMO para pruebas

3) Ejecutar en modo desarrollo
- npm run dev
- Abrir http://localhost:3000

4) Otros scripts útiles
- Build: npm run build
- Producción: npm start
- Lint: npm run lint
- Tests: npm test

## Estructura de carpetas

Estructura del frontend (fe_wompi_app):
```
fe_wompi_app/
├── app/
│   ├── (checkout)/
│   │   ├── payment/              # Página/flujo de pago con tarjeta
│   │   ├── status/               # Estado de la transacción (resultado)
│   │   └── summary/              # Resumen de compra/pago
│   ├── deliveries/
│   │   └── page.tsx              # Gestión/listado de entregas
│   ├── transactions/
│   │   └── page.tsx              # Historial de transacciones
│   ├── layout.tsx                # Layout principal + Sidebar
│   ├── page.tsx                  # Home
│   ├── globals.css               # Estilos globales
│   └── icon.svg                  # Ícono de la app
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx           # Sidebar + contexto
│   ├── payment/
│   │   ├── CardForm.tsx          # Formulario de tarjeta
│   │   └── Summary.tsx           # Resumen del pago
│   ├── product/
│   │   └── ProductCard.tsx       # Tarjeta de producto
│   └── ui/
│       └── Backdrop.tsx          # Componente UI de fondo
├── hooks/
│   ├── useCart.ts                # Carrito (demo)
│   ├── useLocalStorage.ts        # Persistencia en localStorage
│   └── usePayment.ts             # Orquestación del flujo de pago
├── lib/
│   ├── api/
│   │   ├── backend.ts            # Llamadas al backend propio
│   │   ├── wompi.ts              # Integración Wompi (tokens, transacciones)
│   │   └── index.ts              # Re-exports
│   ├── apiClient.ts              # Wrapper fetch + ApiError
│   ├── constants.ts              # Variables/constantes de entorno
│   ├── utils.ts                  # Firma de integridad (Wompi)
│   └── validators.ts             # Validadores (tarjeta, CVC, fecha, email)
├── public/
│   ├── logos/
│   │   ├── mastercard.png
│   │   ├── visa.png
│   │   └── wompi_logo.png
│   └── …                         # Otros assets estáticos
├── styles/
│   ├── globals.css               # Estilos globales
│   └── variables.css             # Variables CSS
├── types/
│   ├── customer.d.ts
│   ├── product.d.ts
│   └── transaction.d.ts
├── __tests__/                    # Base de pruebas
│   ├── components/
│   ├── pages/
│   └── utils/
├── next.config.ts                # Config de imágenes/dominios/env
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

- app/ → Rutas y layouts con App Router de Next.js
  - (checkout)/ → Flujo de checkout (payment, status, summary)
  - deliveries/page.tsx → Listado/gestión de entregas
  - transactions/page.tsx → Historial de transacciones
  - layout.tsx → Layout principal (Sidebar, navbar)
  - page.tsx → Home
- components/ → Componentes UI y de dominio
  - layout/Sidebar.tsx → Sidebar + contexto de apertura/cierre
  - payment/ → CardForm, Summary
  - product/ProductCard.tsx
  - ui/Backdrop.tsx
- hooks/ → Hooks personalizados (useCart, useLocalStorage, usePayment)
- lib/ → Utilidades y capa de acceso a datos
  - api/ → Llamadas al backend y a Wompi (backend.ts, wompi.ts, index.ts)
  - apiClient.ts → Wrapper fetch con manejo de errores (ApiError)
  - constants.ts → Variables y constantes de entorno (API/Wompi/demo)
  - utils.ts → Helpers (firma de integridad para Wompi)
  - validators.ts → Validadores simples (tarjeta, CVC, fecha, email)
- public/ → Recursos estáticos (logos, íconos, imágenes permitidas en next.config.ts)
- styles/ → CSS globales y variables
- types/ → Tipos compartidos (customer, product, transaction)
- __tests__/ → Base para pruebas

## Decisiones técnicas
- Next.js App Router: estructura modular por rutas, layout compartido y optimizaciones de rendimiento.
- TypeScript: tipado estricto para modelos (types/) y APIs.
- Capa de datos aislada (lib/apiClient.ts, lib/api/*):
  - apiClient centraliza fetch, headers JSON y errores (ApiError)
  - backend.ts expone operaciones de negocio (productos, transacciones, entregas)
  - wompi.ts encapsula integración con Wompi (tokens, transactions, polling estado)
- Seguridad/Integridad en Wompi: generación de signature SHA-256 en lib/utils.ts usando Web Crypto/Node.
- Estado y composición:
  - Predominio de estado local y Context (SidebarProvider)
  - Hooks reutilizables (useCart, usePayment, useLocalStorage)
  - Nota: existe dependencia react-redux, pero actualmente no se utiliza un store global.
- Estilos: utilidades modernas (Tailwind CSS 4 + CSS variables) y clases utilitarias en componentes.
- Imágenes remotas: dominios permitidos configurados en next.config.ts (images.domains).

## Entregables visuales
