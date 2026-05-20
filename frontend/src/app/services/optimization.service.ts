import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Constraint {
  coefficients: number[];
  operator: '<=' | '>=' | '=';
  value: number;
}

export interface OptimizationPayload {
  type: 'max' | 'min';
  objectiveFunction: number[];
  constraints: Constraint[];
  variables?: string[];
}

export interface Iteration {
  phase: number;
  iteration: number;
  tableau: number[][];
  pivotColumn: number | null;
  pivotRow: number | null;
  pivotElement: number | null;
  explanation: string;
}

export interface OptimizationResponse {
  success: boolean;
  method: 'simplex' | 'dual-simplex';
  problemType: 'max' | 'min';
  optimalValue: number;
  solution: Record<string, number>;
  iterations: Iteration[];
  graphData?: {
    chartType: string;
    labels: string[];
    series: { name: string; values: number[] }[];
    summary?: Record<string, number>;
  };
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OptimizationService {
  private baseUrl = '/api/optimization';

  constructor(private http: HttpClient) {}

  checkHealth(): Observable<{ success: boolean; status: string; message: string; timestamp: string }> {
    return this.http.get<{ success: boolean; status: string; message: string; timestamp: string }>(`${this.baseUrl}/health`);
  }

  solveSimplex(payload: OptimizationPayload): Observable<OptimizationResponse> {
    return this.http.post<OptimizationResponse>(`${this.baseUrl}/simplex`, payload);
  }

  solveDualSimplex(payload: OptimizationPayload): Observable<OptimizationResponse> {
    return this.http.post<OptimizationResponse>(`${this.baseUrl}/dual-simplex`, payload);
  }
}
