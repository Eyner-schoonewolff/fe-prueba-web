# FE Prueba App

Frontend (Next.js) para **demo de pagos con Wompi** y backend propio.

**Dominio en Amplify:**  
[https://develop.d1evdclv6vuhvn.amplifyapp.com](https://develop.d1evdclv6vuhvn.amplifyapp.com)

---

## Requisitos

- [Node.js](https://nodejs.org/) `>= 18`
- [npm](https://www.npmjs.com/) (ó `pnpm` / `yarn`)

---

## Instalación y ejecución

1. **Instalar dependencias**
```bash
cd fe_prueba_app
npm install
````

2. **Configurar variables de entorno** → Crear un archivo `.env` en la raíz con:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:9000   # URL base del backend
NEXT_PUBLIC_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_WOMPI_BASE_URL=https://sandbox.wompi.co/v1
NEXT_PUBLIC_WOMPI_KEY=pk_test_XXXX
NEXT_PUBLIC_WOMPI_PRIVATE_KEY=prv_test_XXXX
NEXT_PUBLIC_WOMPI_INTEGRITY_SECRET=INTEGRITY_SECRET
NEXT_PUBLIC_BYPASS_USER_ID=demo_user_123
```

3. **Modo desarrollo**

```bash
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

4. **Otros scripts útiles**

```bash
# Build de producción
npm run build

# Ejecutar en producción
npm start

# Linter
npm run lint

# Tests
npm test
```

---

## Estructura de carpetas

```bash
fe_wompi_app/
├── app/                     # Rutas y layouts (Next.js App Router)
│   ├── (checkout)/          # Flujo de checkout
│   │   ├── payment/         # Pago con tarjeta
│   │   ├── status/          # Estado de la transacción
│   │   └── summary/         # Resumen de compra
│   ├── deliveries/          # Gestión/listado de entregas
│   ├── transactions/        # Historial de transacciones
│   ├── layout.tsx           # Layout principal + Sidebar
│   ├── page.tsx             # Home
│   └── globals.css          # Estilos globales
│
├── components/              # Componentes UI y de dominio
│   ├── layout/Sidebar.tsx
│   ├── payment/             # CardForm, Summary
│   ├── product/ProductCard.tsx
│   └── ui/Backdrop.tsx
│
├── hooks/                   # Hooks personalizados
│   ├── useCart.ts
│   ├── useLocalStorage.ts
│   └── usePayment.ts
│
├── lib/                     # Capa de datos y utilidades
│   ├── api/                 # Integración backend + Wompi
│   │   ├── backend.ts
│   │   ├── wompi.ts
│   │   └── index.ts
│   ├── apiClient.ts         # Wrapper fetch + ApiError
│   ├── constants.ts         # Constantes/env
│   ├── utils.ts             # Helpers (firma Wompi)
│   └── validators.ts        # Validadores (tarjeta, CVC, email…)
│
├── public/                  # Recursos estáticos
│   └── logos/ (visa.png, mastercard.png, wompi_logo.png…)
│
├── styles/                  # Estilos globales y variables
├── types/                   # Tipos TypeScript
├── __tests__/               # Base de pruebas
├── next.config.ts           # Configuración Next.js
├── tsconfig.json            # Configuración TS
└── package.json
```

---

## Decisiones técnicas

* **Next.js App Router** → modularidad por rutas + layouts compartidos
* **TypeScript** → tipado estricto (modelos en `types/`)
* **Capa de datos aislada** (`lib/apiClient.ts`, `lib/api/*`)

  * `apiClient` centraliza `fetch` + manejo de errores
  * `backend.ts` expone operaciones de negocio
  * `wompi.ts` encapsula integración con Wompi
* **Seguridad/Integridad Wompi** → firma SHA-256 (`lib/utils.ts`)
* **Estado y composición**

  * Estado local y contextos (SidebarProvider)
  * Hooks reutilizables (`useCart`, `usePayment`, `useLocalStorage`)
* **Estilos** → Tailwind CSS + variables CSS
* **Imágenes remotas** configuradas en `next.config.ts`

---

## Demo rápida

1. Seleccionar un producto
2. Ir al **checkout**
3. Ingresar datos de tarjeta (sandbox Wompi)
4. Confirmar pago → ver **status** de transacción

---

https://github.com/user-attachments/assets/d0ae699f-6e7b-4202-a7a3-8bfc7ae4dd75



Con esta app podrás simular **pagos con Wompi**, revisar **transacciones** y gestionar **entregas**.

