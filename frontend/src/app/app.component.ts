import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  OptimizationService, 
  OptimizationPayload, 
  OptimizationResponse 
} from './services/optimization.service';
import { ProblemFormComponent } from './components/problem-form/problem-form.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { TableauViewerComponent } from './components/tableau-viewer/tableau-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ProblemFormComponent, 
    ResultsDisplayComponent, 
    TableauViewerComponent
  ],
  template: `
    <!-- Top Glass Header -->
    <header class="app-header glass-panel">
      <div class="header-container">
        <div class="logo-area">
          <span class="logo-icon">📊</span>
          <div>
            <h1 class="logo-title text-gradient">Simplex Optimizer</h1>
            <p class="logo-subtitle">Investigación Operativa I</p>
          </div>
        </div>

        <div class="status-area">
          <div class="status-indicator">
            <span class="pulse-dot" [class.pulse-active]="isOnline" [class.offline]="!isOnline"></span>
            <span class="status-text">{{ isOnline ? 'API Conectada' : 'API Desconectada' }}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" (click)="checkHealth()">
            🔄 Reintentar
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace Layout (Centered) -->
    <main class="container main-layout">
      <!-- Problem Form -->
      <section class="form-section">
        <app-problem-form (solve)="onSolveProblem($event)"></app-problem-form>
      </section>

      <!-- Status and Alerts (Loading & Errors) -->
      <section class="status-section">
        <!-- Loading Spinner -->
        <div class="glass-panel loading-panel fade-in" *ngIf="loading">
          <div class="spinner"></div>
          <h3>Resolviendo modelo...</h3>
          <p>La API está ejecutando las iteraciones del algoritmo.</p>
        </div>

        <!-- Error Card -->
        <div class="glass-panel error-panel fade-in" *ngIf="error">
          <div class="error-header">
            <span class="error-icon">⚠️</span>
            <h3>Error de Optimización</h3>
          </div>
          <p class="error-message">{{ error }}</p>
          <div class="error-tips">
            <strong>Consejos útiles:</strong>
            <ul>
              <li>Asegúrate de que el modelo tenga solución factible.</li>
              <li>Si usas restricciones de tipo mayor o igual (&ge;), el método **Simplex Dual** suele ser la opción recomendada.</li>
              <li>Revisa que los coeficientes del RHS no hagan el sistema inconsistente.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal Overlay for Results -->
    <div class="modal-overlay fade-in" *ngIf="showModal && response" (click)="closeModal()">
      <div class="modal-content glass-panel" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <div class="modal-title-area">
            <span class="modal-icon">🏆</span>
            <div>
              <h2 class="modal-title text-gradient">Resultados de la Optimización</h2>
              <p class="modal-subtitle">Resultados calculados con éxito por la API</p>
            </div>
          </div>
          <button type="button" class="btn-icon btn-close" (click)="closeModal()">✖</button>
        </div>

        <div class="modal-body-content">
          <app-results-display [response]="response"></app-results-display>
          
          <app-tableau-viewer 
            [iterations]="response.iterations"
            [variableNames]="lastUsedVariables">
          </app-tableau-viewer>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Cerrar Resultados</button>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
      <p>&copy; 2026 - Backend &amp; Frontend de Optimización Lineal. Bolivian Universities IO Project.</p>
    </footer>
  `,
  styles: [`
    .app-header {
      margin: 1.5rem auto 0 auto;
      max-width: 800px;
      border-radius: 16px;
      padding: 1rem 2rem;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo-icon {
      font-size: 2.25rem;
    }
    .logo-title {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .logo-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-area {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.4);
      padding: 0.5rem 0.875rem;
      border-radius: 9999px;
      border: 1px solid var(--border-color);
    }
    .status-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .pulse-dot.offline {
      background-color: var(--accent-rose);
      box-shadow: 0 0 8px var(--accent-rose);
      animation: none;
    }

    /* Main Grid Layout (Centered Form) */
    .main-layout {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .status-section {
      width: 100%;
    }

    /* Loading Panel */
    .loading-panel {
      text-align: center;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(139, 92, 246, 0.1);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-panel h3 {
      font-size: 1.25rem;
      font-weight: 700;
    }
    .loading-panel p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    /* Error Panel */
    .error-panel {
      border-color: rgba(244, 63, 94, 0.3);
      background: rgba(244, 63, 94, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .error-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fca5a5;
    }
    .error-icon {
      font-size: 1.5rem;
    }
    .error-message {
      font-size: 0.95rem;
      color: #fecaca;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border-left: 3px solid var(--accent-rose);
      font-family: monospace;
    }
    .error-tips {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .error-tips ul {
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* Modal Overlay Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(5, 7, 15, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .modal-content {
      width: 100%;
      max-width: 950px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
      padding: 1.75rem;
      overflow: hidden; /* Lock scroll to contents */
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }
    .modal-title-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .modal-icon {
      font-size: 1.75rem;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .modal-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.1rem;
    }
    .btn-close {
      font-size: 1.25rem;
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--border-color);
    }
    .modal-body-content {
      overflow-y: auto;
      flex: 1;
      padding-right: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .modal-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Footer */
    .app-footer {
      text-align: center;
      padding: 2rem 0;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      margin-top: 3rem;
    }
  `]
})
export class AppComponent implements OnInit {
  isOnline = false;
  loading = false;
  showModal = false;
  response: OptimizationResponse | null = null;
  error: string | null = null;
  lastUsedVariables: string[] = [];

  constructor(private optService: OptimizationService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.optService.checkHealth().subscribe({
      next: (res) => {
        this.isOnline = res.success || res.status === 'ok';
      },
      error: () => {
        this.isOnline = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSolveProblem(event: { method: string; payload: OptimizationPayload }): void {
    this.loading = true;
    this.error = null;
    this.response = null;
    this.showModal = false;
    this.lastUsedVariables = event.payload.variables || [];

    const solveObservable = event.method === 'simplex' 
      ? this.optService.solveSimplex(event.payload)
      : this.optService.solveDualSimplex(event.payload);

    solveObservable.subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.response = res;
          this.showModal = true;
        } else {
          this.error = res.error || res.message || 'Ocurrió un error inesperado al resolver el modelo.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error && err.error.error) {
          this.error = err.error.error;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'No se pudo conectar con el servidor de optimización. Asegúrate de que el backend esté ejecutándose.';
        }
      }
    });
  }
}
