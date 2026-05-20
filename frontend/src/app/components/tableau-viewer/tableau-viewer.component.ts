import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Iteration } from '../../services/optimization.service';

@Component({
  selector: 'app-tableau-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tableau-container fade-in" *ngIf="iterations && iterations.length > 0">
      <div class="header-section">
        <h3 class="title">Historial de Iteraciones</h3>
        <p class="subtitle">Explora el paso a paso del algoritmo simplex con el resaltado del elemento pivote.</p>
      </div>

      <!-- Tab navigation for iterations -->
      <div class="tabs-scroll">
        <div class="tabs-list">
          <button 
            *ngFor="let iter of iterations; let idx = index" 
            class="tab-btn"
            [class.active]="selectedIterationIndex === idx"
            (click)="selectIteration(idx)">
            <span>Iteración {{ iter.iteration }}</span>
            <span class="phase-badge" *ngIf="iter.phase">Fase {{ iter.phase }}</span>
          </button>
        </div>
      </div>

      <!-- Selected Tableau Display -->
      <div class="tableau-card glass-panel" *ngIf="currentIteration">
        <div class="explanation-box">
          <div class="icon">💡</div>
          <div class="text">
            <strong>Explicación:</strong> {{ currentIteration.explanation }}
          </div>
        </div>

        <div class="table-wrapper">
          <table class="simplex-table">
            <thead>
              <tr>
                <th class="corner-header">Base</th>
                <th *ngFor="let colHeader of columnHeaders; let colIdx = index"
                    [class.pivot-col-header]="isPivotColumn(colIdx)">
                  {{ colHeader }}
                </th>
                <th class="rhs-header">RHS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of currentIteration.tableau; let rowIdx = index; let last = last"
                  [class.objective-row]="last"
                  [class.pivot-row-highlight]="isPivotRow(rowIdx)">
                <td class="row-label">
                  <strong>{{ last ? 'Z' : 'R' + (rowIdx + 1) }}</strong>
                </td>
                <td *ngFor="let value of row.slice(0, -1); let colIdx = index"
                    [class.pivot-cell]="isPivotElement(rowIdx, colIdx)"
                    [class.pivot-col-cell]="isPivotColumn(colIdx) && !isPivotElement(rowIdx, colIdx)">
                  {{ value | number:'1.1-4' }}
                </td>
                <td class="rhs-cell" [class.pivot-col-cell]="isPivotColumn(row[row.length - 1])">
                  {{ row[row.length - 1] | number:'1.1-4' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tableau Legend / Metadata -->
        <div class="tableau-footer" *ngIf="currentIteration.pivotElement !== null">
          <div class="legend-item">
            <span class="legend-dot pivot"></span>
            <span>Elemento Pivote: <strong>{{ currentIteration.pivotElement | number:'1.1-4' }}</strong></span>
          </div>
          <div class="legend-item">
            <span class="legend-dot entering"></span>
            <span>Columna entrante: <strong>{{ columnHeaders[currentIteration.pivotColumn!] }}</strong></span>
          </div>
          <div class="legend-item">
            <span class="legend-dot leaving"></span>
            <span>Fila saliente: <strong>R{{ currentIteration.pivotRow! + 1 }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tableau-container {
      margin-top: 2rem;
    }
    .header-section {
      margin-bottom: 1rem;
    }
    .title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .tabs-scroll {
      overflow-x: auto;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
    }
    .tabs-list {
      display: flex;
      gap: 0.5rem;
    }
    .tab-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      white-space: nowrap;
      min-width: 100px;
    }
    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: var(--text-primary);
    }
    .tab-btn.active {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--accent-primary);
      color: #c084fc;
    }
    .phase-badge {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--accent-secondary);
      color: white;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      margin-top: 0.25rem;
    }
    .tableau-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .explanation-box {
      display: flex;
      gap: 0.75rem;
      background: rgba(99, 102, 241, 0.08);
      border-left: 4px solid var(--accent-secondary);
      padding: 0.75rem 1rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .table-wrapper {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .simplex-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      text-align: right;
    }
    .simplex-table th, .simplex-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .simplex-table th {
      background: rgba(15, 23, 42, 0.4);
      font-weight: 600;
      color: var(--text-secondary);
    }
    .corner-header, .row-label {
      text-align: left;
      font-weight: 600;
      background: rgba(15, 23, 42, 0.4) !important;
      position: sticky;
      left: 0;
      z-index: 2;
    }
    .objective-row td {
      border-top: 2px solid rgba(255, 255, 255, 0.2);
      font-weight: 700;
      color: var(--text-primary);
      background: rgba(15, 23, 42, 0.2);
    }
    .pivot-col-header {
      color: #f59e0b !important;
      background: rgba(245, 158, 11, 0.05) !important;
    }
    .pivot-row-highlight td {
      background: rgba(139, 92, 246, 0.05);
    }
    .pivot-col-cell {
      background: rgba(245, 158, 11, 0.05);
    }
    .pivot-cell {
      background: rgba(245, 158, 11, 0.2) !important;
      border: 2px solid var(--accent-amber) !important;
      color: #fbbf24 !important;
      font-weight: 700 !important;
    }
    .rhs-header {
      font-weight: 700;
      border-left: 2px solid var(--border-color);
    }
    .rhs-cell {
      font-weight: 600;
      border-left: 2px solid var(--border-color);
    }
    .tableau-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.8125rem;
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .legend-dot.pivot {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid var(--accent-amber);
    }
    .legend-dot.entering {
      background: rgba(245, 158, 11, 0.05);
      border: 1px dashed var(--accent-amber);
    }
    .legend-dot.leaving {
      background: rgba(139, 92, 246, 0.05);
      border: 1px dashed var(--accent-primary);
    }
  `]
})
export class TableauViewerComponent implements OnChanges {
  @Input() iterations: Iteration[] = [];
  @Input() variableNames: string[] = [];

  selectedIterationIndex = 0;
  columnHeaders: string[] = [];

  get currentIteration(): Iteration | null {
    if (this.iterations && this.iterations.length > this.selectedIterationIndex) {
      return this.iterations[this.selectedIterationIndex];
    }
    return null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['iterations'] || changes['variableNames']) {
      this.selectedIterationIndex = 0;
      this.buildColumnHeaders();
    }
  }

  selectIteration(idx: number): void {
    this.selectedIterationIndex = idx;
  }

  buildColumnHeaders(): void {
    if (!this.currentIteration) {
      this.columnHeaders = [];
      return;
    }

    const firstTab = this.currentIteration.tableau;
    if (!firstTab || firstTab.length === 0) {
      this.columnHeaders = [];
      return;
    }

    const numCols = firstTab[0].length; // total columns (vars + slack + RHS)
    const numOriginalVars = this.variableNames.length;
    const numSlackVars = numCols - numOriginalVars - 1;

    const headers: string[] = [];

    // Original variables
    for (let i = 0; i < numOriginalVars; i++) {
      headers.push(this.variableNames[i] || `x${i + 1}`);
    }

    // Slack variables
    for (let i = 0; i < numSlackVars; i++) {
      headers.push(`s${i + 1}`);
    }

    this.columnHeaders = headers;
  }

  isPivotColumn(colIdx: number): boolean {
    return this.currentIteration?.pivotColumn === colIdx;
  }

  isPivotRow(rowIdx: number): boolean {
    return this.currentIteration?.pivotRow === rowIdx;
  }

  isPivotElement(rowIdx: number, colIdx: number): boolean {
    return this.currentIteration?.pivotRow === rowIdx && this.currentIteration?.pivotColumn === colIdx;
  }
}
