import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OptimizationPayload } from '../../services/optimization.service';

interface ConstraintFormModel {
  coefficients: number[];
  operator: '<=' | '>=' | '=';
  value: number;
}

@Component({
  selector: 'app-problem-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel form-panel fade-in">
      <div class="header-row">
        <h3 class="panel-title">Configuración del Problema</h3>
        
        <!-- Examples quick load -->
        <div class="examples-dropdown">
          <select class="glass-input glass-select example-select" (change)="loadExample($event)">
            <option value="">📂 Cargar un problema de ejemplo...</option>
            <option value="simplex-basic">Ejemplo Simplex Básico (2 var, 2 rest)</option>
            <option value="dual-basic">Ejemplo Simplex Dual (2 var, 2 rest)</option>
            <option value="six-banks">Ejemplo Simplex Avanzado (6 Bancos)</option>
          </select>
        </div>
      </div>

      <!-- Controls for Type & Method -->
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Objetivo</label>
          <div class="toggle-group">
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="type === 'max'"
              (click)="type = 'max'">
              Maximizar (MAX)
            </button>
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="type === 'min'"
              (click)="type = 'min'">
              Minimizar (MIN)
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Método</label>
          <div class="toggle-group">
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="method === 'simplex'"
              (click)="method = 'simplex'">
              Simplex Primal
            </button>
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="method === 'dual-simplex'"
              (click)="method = 'dual-simplex'">
              Simplex Dual
            </button>
          </div>
        </div>
      </div>

      <!-- Section: Decision Variables -->
      <div class="section-divider"></div>
      <div class="section-header">
        <h4 class="section-title">Variables de Decisión</h4>
        <button type="button" class="btn btn-secondary btn-sm" (click)="addVariable()">
          ➕ Agregar Variable
        </button>
      </div>

      <div class="variables-list">
        <div class="variable-item" *ngFor="let name of variables; let idx = index; trackBy:trackByFn">
          <span class="var-badge">x{{ idx + 1 }}</span>
          <input 
            type="text" 
            [(ngModel)]="variables[idx]" 
            class="glass-input var-name-input" 
            placeholder="Nombre de variable (ej: x{{ idx + 1 }})" 
          />
          <button 
            type="button" 
            class="btn-icon btn-danger-icon" 
            [disabled]="variables.length <= 1"
            (click)="removeVariable(idx)">
            ✖
          </button>
        </div>
      </div>

      <!-- Section: Objective Function Coefficients -->
      <div class="section-divider"></div>
      <div class="section-header">
        <h4 class="section-title">Función Objetivo (Coeficientes)</h4>
      </div>

      <div class="objective-row">
        <div class="coef-item" *ngFor="let coef of objectiveFunction; let idx = index; trackBy:trackByFn">
          <div class="coef-input-wrapper">
            <input 
              type="number" 
              [(ngModel)]="objectiveFunction[idx]" 
              class="glass-input coef-input" 
            />
            <span class="coef-suffix">{{ variables[idx] || 'x' + (idx + 1) }}</span>
          </div>
          <span class="plus-sign" *ngIf="idx < objectiveFunction.length - 1">+</span>
        </div>
      </div>

      <!-- Section: Constraints -->
      <div class="section-divider"></div>
      <div class="section-header">
        <h4 class="section-title">Restricciones</h4>
        <button type="button" class="btn btn-secondary btn-sm" (click)="addConstraint()">
          ➕ Agregar Restricción
        </button>
      </div>

      <div class="constraints-list">
        <div class="constraint-row-card" *ngFor="let con of constraints; let cIdx = index">
          <div class="constraint-header">
            <span>Restricción {{ cIdx + 1 }}</span>
            <button 
              type="button" 
              class="btn-icon btn-danger-icon" 
              [disabled]="constraints.length <= 1"
              (click)="removeConstraint(cIdx)">
              ✖
            </button>
          </div>

          <div class="constraint-body">
            <!-- Coefficients inputs -->
            <div class="constraint-coefs">
              <div class="coef-item" *ngFor="let coef of con.coefficients; let vIdx = index; trackBy:trackByFn">
                <div class="coef-input-wrapper">
                  <input 
                    type="number" 
                    [(ngModel)]="con.coefficients[vIdx]" 
                    class="glass-input coef-input" 
                  />
                  <span class="coef-suffix">{{ variables[vIdx] || 'x' + (vIdx + 1) }}</span>
                </div>
                <span class="plus-sign" *ngIf="vIdx < con.coefficients.length - 1">+</span>
              </div>
            </div>

            <!-- Operator and RHS value -->
            <div class="constraint-rhs">
              <select [(ngModel)]="con.operator" class="glass-input glass-select operator-select">
                <option value="<=">&le; (Menor o Igual)</option>
                <option value=">=">&ge; (Mayor o Igual)</option>
                <option value="=">= (Igual)</option>
              </select>

              <input 
                type="number" 
                [(ngModel)]="con.value" 
                class="glass-input rhs-value-input" 
                placeholder="Valor (RHS)" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Section -->
      <div class="submit-section">
        <button type="button" class="btn btn-primary btn-lg" (click)="onSubmit()">
          🚀 Resolver Modelo
        </button>
      </div>

    </div>
  `,
  styles: [`
    .form-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .panel-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .example-select {
      max-width: 280px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toggle-group {
      display: flex;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.25rem;
    }
    .toggle-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .toggle-btn.active {
      background: var(--accent-primary);
      color: white;
      box-shadow: var(--shadow-sm);
    }
    
    .section-divider {
      height: 1px;
      background: var(--border-color);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8125rem;
    }

    .variables-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .variable-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.2);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.5rem;
      border-radius: 8px;
    }

    .var-badge {
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .var-name-input {
      padding: 0.35rem 0.5rem;
      font-size: 0.8125rem;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-danger-icon {
      color: var(--accent-rose);
    }
    .btn-danger-icon:hover {
      background: rgba(244, 63, 94, 0.15);
    }
    .btn-danger-icon:disabled {
      opacity: 0.25;
      cursor: not-allowed;
      background: transparent !important;
    }

    .objective-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      background: rgba(15, 23, 42, 0.2);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .coef-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .coef-input-wrapper {
      display: flex;
      align-items: center;
      position: relative;
    }

    .coef-input {
      width: 70px;
      padding-right: 2.2rem;
      text-align: center;
    }

    .coef-suffix {
      position: absolute;
      right: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      pointer-events: none;
    }

    .plus-sign {
      color: var(--text-muted);
      font-weight: 700;
      font-size: 1.125rem;
    }

    /* Constraints List */
    .constraints-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .constraint-row-card {
      background: rgba(15, 23, 42, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .constraint-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .constraint-body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.25rem;
    }

    .constraint-coefs {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 250px;
    }

    .constraint-rhs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 280px;
      justify-content: flex-end;
    }

    .operator-select {
      width: 130px;
      font-size: 0.8125rem;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
    }

    .rhs-value-input {
      width: 100px;
      text-align: center;
    }

    .submit-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .btn-lg {
      padding: 0.875rem 2rem;
      font-size: 1rem;
    }
  `]
})
export class ProblemFormComponent {
  @Output() solve = new EventEmitter<{ method: string; payload: OptimizationPayload }>();

  // State
  type: 'max' | 'min' = 'max';
  method: 'simplex' | 'dual-simplex' = 'simplex';
  variables: string[] = ['x1', 'x2'];
  objectiveFunction: number[] = [5, 4];
  constraints: ConstraintFormModel[] = [
    { coefficients: [6, 4], operator: '<=', value: 24 },
    { coefficients: [1, 2], operator: '<=', value: 6 }
  ];

  trackByFn(index: any, item: any) {
    return index;
  }

  addVariable(): void {
    this.variables.push(`x${this.variables.length + 1}`);
    this.objectiveFunction.push(0);
    this.constraints.forEach(con => {
      con.coefficients.push(0);
    });
  }

  removeVariable(idx: number): void {
    if (this.variables.length <= 1) return;

    this.variables.splice(idx, 1);
    this.objectiveFunction.splice(idx, 1);
    this.constraints.forEach(con => {
      con.coefficients.splice(idx, 1);
    });

    // Rename variables to follow sequential order if they were default names
    this.variables = this.variables.map((name, i) => {
      if (/^x\d+$/.test(name)) {
        return `x${i + 1}`;
      }
      return name;
    });
  }

  addConstraint(): void {
    const numVars = this.variables.length;
    this.constraints.push({
      coefficients: new Array(numVars).fill(0),
      operator: '<=',
      value: 0
    });
  }

  removeConstraint(idx: number): void {
    if (this.constraints.length <= 1) return;
    this.constraints.splice(idx, 1);
  }

  loadExample(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const exampleType = select.value;
    if (!exampleType) return;

    if (exampleType === 'simplex-basic') {
      this.type = 'max';
      this.method = 'simplex';
      this.variables = ['x1', 'x2'];
      this.objectiveFunction = [5, 4];
      this.constraints = [
        { coefficients: [6, 4], operator: '<=', value: 24 },
        { coefficients: [1, 2], operator: '<=', value: 6 }
      ];
    } else if (exampleType === 'dual-basic') {
      this.type = 'max';
      this.method = 'dual-simplex';
      this.variables = ['x1', 'x2'];
      this.objectiveFunction = [4, 1];
      this.constraints = [
        { coefficients: [1, 1], operator: '>=', value: 5 },
        { coefficients: [2, 1], operator: '>=', value: 8 }
      ];
    } else if (exampleType === 'six-banks') {
      this.type = 'max';
      this.method = 'simplex';
      this.variables = [
        'Banco Unión',
        'M. Santa Cruz',
        'B. Nacional',
        'Banco 4',
        'Banco 5',
        'Banco 6'
      ];
      this.objectiveFunction = [0.08, 0.046, 0.04, 0.075, 0.051, 0.045];
      this.constraints = [
        { coefficients: [1, 1, 1, 1, 1, 1], operator: '=', value: 100000 },
        { coefficients: [1, 0, 0, 0, 0, 0], operator: '<=', value: 60000 },
        { coefficients: [0, 1, 0, 0, 0, 0], operator: '<=', value: 60000 },
        { coefficients: [0, 0, 1, 0, 0, 0], operator: '<=', value: 60000 },
        { coefficients: [0, 0, 0, 1, 0, 0], operator: '<=', value: 60000 },
        { coefficients: [0, 0, 0, 0, 1, 0], operator: '<=', value: 60000 },
        { coefficients: [0, 0, 0, 0, 0, 1], operator: '<=', value: 60000 }
      ];
    }

    // Reset select
    select.value = '';
  }

  onSubmit(): void {
    // Coerce coefficients and values to numbers
    const finalObjective = this.objectiveFunction.map(n => Number(n) || 0);
    const finalConstraints = this.constraints.map(con => ({
      coefficients: con.coefficients.map(n => Number(n) || 0),
      operator: con.operator,
      value: Number(con.value) || 0
    }));

    const payload: OptimizationPayload = {
      type: this.type,
      objectiveFunction: finalObjective,
      constraints: finalConstraints,
      variables: [...this.variables]
    };

    this.solve.emit({
      method: this.method,
      payload
    });
  }
}
