import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptimizationResponse } from '../../services/optimization.service';

interface ChartBar {
  name: string;
  value: number;
  heightPercent: number;
}

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-container fade-in" *ngIf="response">
      
      <!-- Summary Card -->
      <div class="glass-panel summary-card">
        <div class="header">
          <span class="badge" [class.badge-success]="response.success" [class.badge-danger]="!response.success">
            {{ response.success ? 'Factible' : 'Infactible' }}
          </span>
          <span class="method-badge">{{ response.method === 'simplex' ? 'Simplex Primal' : 'Simplex Dual' }}</span>
        </div>

        <div class="solution-hero">
          <p class="hero-label">Valor Óptimo (Z)</p>
          <h1 class="hero-value text-gradient">{{ response.optimalValue | number:'1.1-4' }}</h1>
          <p class="hero-message">{{ response.message }}</p>
        </div>

        <!-- Grid of Decision Variables -->
        <div class="variables-grid">
          <div class="var-card" *ngFor="let entry of solutionEntries">
            <div class="var-name">{{ entry.key }}</div>
            <div class="var-value">{{ entry.value | number:'1.1-4' }}</div>
          </div>
        </div>
      </div>

      <!-- Custom SVG Chart Panel -->
      <div class="glass-panel chart-panel" *ngIf="chartBars.length > 0">
        <h3 class="panel-title">Reparto de Variables</h3>
        <p class="panel-subtitle">Visualización proporcional de los valores finales asignados a las variables de decisión.</p>
        
        <div class="svg-chart-container">
          <svg viewBox="0 0 600 240" class="svg-chart" preserveAspectRatio="xMidYMid meet">
            <!-- Grids background lines -->
            <line x1="50" y1="20" x2="550" y2="20" class="grid-line" />
            <line x1="50" y1="70" x2="550" y2="70" class="grid-line" />
            <line x1="50" y1="120" x2="550" y2="120" class="grid-line" />
            <line x1="50" y1="170" x2="550" y2="170" class="grid-line" />
            <line x1="50" y1="200" x2="550" y2="200" class="grid-line base" />

            <!-- Bars -->
            <g *ngFor="let bar of chartBars; let idx = index">
              <!-- Animated Bar -->
              <rect
                [attr.x]="getBarX(idx)"
                [attr.y]="getBarY(bar.heightPercent)"
                [attr.width]="barWidth"
                [attr.height]="getBarHeight(bar.heightPercent)"
                rx="6"
                fill="url(#barGradient)"
                class="chart-bar"
              />
              
              <!-- Value on top of bar -->
              <text
                [attr.x]="getBarX(idx) + barWidth / 2"
                [attr.y]="getBarY(bar.heightPercent) - 8"
                text-anchor="middle"
                class="bar-value"
                *ngIf="bar.value > 0"
              >
                {{ bar.value | number:'1.0-2' }}
              </text>

              <!-- Label below bar -->
              <text
                [attr.x]="getBarX(idx) + barWidth / 2"
                [attr.y]="220"
                text-anchor="middle"
                class="bar-label"
              >
                {{ truncateLabel(bar.name) }}
              </text>
            </g>

            <!-- Definitions for Gradients -->
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#a78bfa" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .results-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .summary-card {
      position: relative;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .method-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.03);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
    .solution-hero {
      padding: 1rem 0;
    }
    .hero-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .hero-value {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.5rem 0;
    }
    .hero-message {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }
    .variables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .var-card {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--border-color);
      padding: 0.875rem;
      border-radius: 12px;
      text-align: center;
      transition: all 0.2s ease;
    }
    .var-card:hover {
      border-color: rgba(139, 92, 246, 0.2);
      transform: translateY(-2px);
    }
    .var-name {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .var-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    /* Chart Panel */
    .chart-panel {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .panel-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .panel-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .svg-chart-container {
      width: 100%;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid var(--border-color);
    }
    .svg-chart {
      width: 100%;
      height: auto;
    }
    .grid-line {
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 1.5;
    }
    .grid-line.base {
      stroke: rgba(255, 255, 255, 0.15);
      stroke-width: 2;
    }
    .chart-bar {
      transition: height 0.5s ease-out, y 0.5s ease-out, opacity 0.2s;
      cursor: pointer;
    }
    .chart-bar:hover {
      opacity: 0.85;
    }
    .bar-value {
      fill: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .bar-label {
      fill: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 500;
    }
  `]
})
export class ResultsDisplayComponent implements OnChanges {
  @Input() response: OptimizationResponse | null = null;

  solutionEntries: { key: string; value: number }[] = [];
  chartBars: ChartBar[] = [];
  
  // SVG positioning helpers
  barWidth = 40;
  chartWidth = 500; // x spans from 50 to 550
  chartBaseY = 200; // bottom of bars
  chartMaxHeight = 170; // 200 - 30 (leave room at top)

  ngOnChanges(): void {
    if (this.response && this.response.solution) {
      this.solutionEntries = Object.keys(this.response.solution).map(key => ({
        key,
        value: this.response!.solution[key]
      }));

      this.buildChartData();
    } else {
      this.solutionEntries = [];
      this.chartBars = [];
    }
  }

  buildChartData(): void {
    if (this.solutionEntries.length === 0) return;

    // Find the maximum value to scale the bars
    const maxVal = Math.max(...this.solutionEntries.map(e => e.value), 0);

    this.chartBars = this.solutionEntries.map(entry => {
      const heightPercent = maxVal > 0 ? entry.value / maxVal : 0;
      return {
        name: entry.key,
        value: entry.value,
        heightPercent
      };
    });
  }

  getBarX(idx: number): number {
    const totalBars = this.chartBars.length;
    if (totalBars === 0) return 50;

    // Calculate spacing evenly
    const segmentWidth = this.chartWidth / totalBars;
    const startX = 50 + (segmentWidth - this.barWidth) / 2;
    return startX + idx * segmentWidth;
  }

  getBarY(percent: number): number {
    return this.chartBaseY - percent * this.chartMaxHeight;
  }

  getBarHeight(percent: number): number {
    return Math.max(percent * this.chartMaxHeight, 4); // minimum 4px height so it's visible if non-zero
  }

  truncateLabel(label: string): string {
    return label.length > 12 ? label.substring(0, 10) + '..' : label;
  }
}
