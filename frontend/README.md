# Simplex Optimizer - Frontend

Este es el frontend del proyecto de optimización lineal, desarrollado con **Angular 18.2.21** de forma standalone (sin módulos) y configurado con un estilo oscuro premium y glassmorphism.

---

## 🚀 Servidor de Desarrollo

Para levantar el servidor de desarrollo del frontend:

1. Asegúrate de estar dentro del directorio `frontend/`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia la aplicación (utilizando el CLI de Angular local):
   ```bash
   npm start
   ```
   o
   ```bash
   npx ng serve
   ```
4. Abre tu navegador y navega a:
   **[http://localhost:4200/](http://localhost:4200/)**

La aplicación se recargará automáticamente si realizas modificaciones en cualquiera de los archivos del código fuente.

---

## 📁 Estructura clave de archivos

* `src/styles.css`: Contiene los tokens globales del sistema de diseño (colores, fondos translúcidos, tipografía *Inter* y animaciones).
* `src/app/app.component.ts`: Contiene la lógica central de la interfaz, el monitor del estado del backend, el spinner de carga y el control de visibilidad del modal de resultados.
* `src/app/services/optimization.service.ts`: Servicio Angular de comunicación HTTP que consume los endpoints `/api/optimization/simplex` y `/api/optimization/dual-simplex` del backend.
* `src/app/components/problem-form/`: Formulario dinámico para ingresar las variables, coeficientes y restricciones con carga de ejemplos predeterminados.
* `src/app/components/results-display/`: Muestra los resultados finales de las variables, el valor óptimo $Z$ y dibuja un gráfico interactivo utilizando SVG nativo.
* `src/app/components/tableau-viewer/`: Muestra las matrices del método simplex iteración por iteración con resaltado del pivote (celda, columna entrante y fila saliente).

---

## 🛠️ Comandos Adicionales de Angular CLI

Dado que el CLI de Angular no está instalado globalmente en la máquina del desarrollador, debes prefijar todos los comandos con `npx`:

* **Compilar en producción**: `npx ng build` (los archivos resultantes se guardarán en `dist/frontend`).
* **Ejecutar pruebas unitarias**: `npx ng test` (mediante Karma).
* **Generar nuevos componentes**: `npx ng generate component components/nombre-componente`
