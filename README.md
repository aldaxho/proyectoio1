# Optimization Backend API

REST API for solving Linear Programming problems using the **Simplex** and **Dual Simplex** methods.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
cd backend
npm install
```

### Run (development)
```bash
npm run dev
```

### Run (production)
```bash
npm start
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                          # Express app setup (middlewares, routes)
│   ├── server.js                       # HTTP server entry point
│   │
│   ├── routes/
│   │   └── optimization.routes.js      # Route definitions
│   │
│   ├── controllers/
│   │   └── optimization.controller.js  # Request / Response handlers
│   │
│   ├── services/
│   │   ├── simplex.service.js          # Simplex algorithm
│   │   ├── dualSimplex.service.js      # Dual Simplex algorithm
│   │   └── validation.service.js       # Input validation logic
│   │
│   ├── utils/
│   │   ├── matrix.utils.js             # Matrix operations
│   │   ├── pivot.utils.js              # Pivot element selection
│   │   └── response.utils.js           # Standardized API responses
│   │
│   └── models/
│       └── optimizationProblem.model.js  # Problem data model / schema
│
├── package.json
├── .env
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | `/api/optimization/simplex`      | Solve using Simplex method     |
| POST   | `/api/optimization/dual-simplex` | Solve using Dual Simplex       |
| GET    | `/api/optimization/health`      | Health check                   |

Se mantienen alias compatibles en `/api/optimize/simplex`, `/api/optimize/dual` y `/api/health`.

## Contracto de la API

### 1) GET `/api/optimization/health`

No recibe body.

Respuesta:

```json
{
  "success": true,
  "status": "ok",
  "message": "Backend de optimización operativo.",
  "timestamp": "2026-05-20T12:00:00.000Z"
}
```

### 2) POST `/api/optimization/simplex`

Recibe un problema de programación lineal para resolver con el método Simplex.

Campos del body:

- `type`: tipo del problema, `max` o `min`.
- `objectiveFunction`: arreglo de coeficientes de la función objetivo.
- `constraints`: arreglo de restricciones.
- `constraints[].coefficients`: coeficientes de cada restricción.
- `constraints[].operator`: operador permitido, `<=`, `>=` o `=`.
- `constraints[].value`: valor independiente de la restricción.
- `variables`: nombres de las variables, opcional pero recomendado.

Ejemplo de request:

```json
{
  "type": "max",
  "objectiveFunction": [5, 4],
  "constraints": [
    { "coefficients": [6, 4], "operator": "<=", "value": 24 },
    { "coefficients": [1, 2], "operator": "<=", "value": 6 }
  ],
  "variables": ["x1", "x2"]
}
```

Respuesta:

```json
{
  "success": true,
  "method": "simplex",
  "problemType": "max",
  "optimalValue": 21,
  "solution": {
    "x1": 3,
    "x2": 1.5
  },
  "iterations": [
    {
      "iteration": 0,
      "tableau": [],
      "pivotColumn": null,
      "pivotRow": null,
      "pivotElement": null,
      "explanation": "Tabla inicial del método Simplex."
    }
  ],
  "graphData": {
    "chartType": "bar",
    "labels": ["Banco Unión", "Banco Mercantil Santa Cruz", "Banco Nacional de Bolivia"],
    "series": [
      {
        "name": "Monto invertido",
        "values": [60000, 40000, 0]
      }
    ],
    "summary": {
      "totalInvestment": 100000,
      "totalReturn": 7100
    }
  },
  "message": "Solución óptima encontrada."
}
```

### 3) POST `/api/optimization/dual-simplex`

Recibe el mismo body que Simplex, pero se usa cuando la tabla inicial puede ser no factible y el método Dual Simplex resulta adecuado.

Ejemplo de request:

```json
{
  "type": "max",
  "objectiveFunction": [4, 1],
  "constraints": [
    { "coefficients": [1, 1], "operator": ">=", "value": 5 },
    { "coefficients": [2, 1], "operator": ">=", "value": 8 }
  ],
  "variables": ["x1", "x2"]
}
```

Respuesta:

```json
{
  "success": true,
  "method": "dual-simplex",
  "problemType": "max",
  "optimalValue": 21,
  "solution": {
    "x1": 3,
    "x2": 2
  },
  "iterations": [
    {
      "phase": 1,
      "iteration": 0,
      "tableau": [],
      "pivotColumn": null,
      "pivotRow": null,
      "pivotElement": null,
      "explanation": "Tabla inicial del método Simplex Dual."
    }
  ],
  "graphData": {
    "chartType": "bar",
    "labels": ["x1", "x2"],
    "series": [
      {
        "name": "Monto invertido",
        "values": [3, 2]
      }
    ],
    "summary": {
      "totalInvestment": 5,
      "totalReturn": 21
    }
  },
  "message": "Solución óptima encontrada."
}
```

### Ejemplos de prueba

#### Simplex con 6 bancos

```json
{
  "type": "max",
  "objectiveFunction": [0.08, 0.046, 0.04, 0.075, 0.051, 0.045],
  "constraints": [
    { "coefficients": [1, 1, 1, 1, 1, 1], "operator": "=", "value": 100000 },
    { "coefficients": [1, 0, 0, 0, 0, 0], "operator": "<=", "value": 60000 },
    { "coefficients": [0, 1, 0, 0, 0, 0], "operator": "<=", "value": 60000 },
    { "coefficients": [0, 0, 1, 0, 0, 0], "operator": "<=", "value": 60000 },
    { "coefficients": [0, 0, 0, 1, 0, 0], "operator": "<=", "value": 60000 },
    { "coefficients": [0, 0, 0, 0, 1, 0], "operator": "<=", "value": 60000 },
    { "coefficients": [0, 0, 0, 0, 0, 1], "operator": "<=", "value": 60000 }
  ],
  "variables": [
    "Banco Unión",
    "Banco Mercantil Santa Cruz",
    "Banco Nacional de Bolivia",
    "Banco 4",
    "Banco 5",
    "Banco 6"
  ]
}
```

La respuesta incluye `graphData` con `labels`, `series` y `summary` para que el frontend pueda graficar el reparto de inversión y el retorno total.

#### Dual Simplex

```json
{
  "type": "max",
  "objectiveFunction": [4, 1],
  "constraints": [
    { "coefficients": [1, 1], "operator": ">=", "value": 5 },
    { "coefficients": [2, 1], "operator": ">=", "value": 8 }
  ],
  "variables": ["x1", "x2"]
}
```

## Respuestas de error

Todos los errores se devuelven en formato JSON:

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error"
}
```

Errores comunes:

- `400`: datos incompletos o inválidos.
- `422`: problema no acotado, no existe solución factible o el método no aplica.
- `500`: error interno del servidor.

---

## ⚙️ Environment Variables

| Variable   | Default       | Description        |
|------------|---------------|--------------------|
| `PORT`     | `3000`        | Server port        |
| `NODE_ENV` | `development` | Runtime environment|
