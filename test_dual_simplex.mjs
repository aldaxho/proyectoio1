import { createOptimizationProblem } from './src/models/optimizationProblem.model.js';
import { dualSimplexSolve } from './src/services/dualSimplex.service.js';

const problemData = {
  objective: 'max',
  objectiveCoefficients: [3, 5],
  constraints: [
    { coefficients: [1, 0], operator: '>=', rhs: 2 },
    { coefficients: [0, 2], operator: '>=', rhs: 6 },
    { coefficients: [3, 2], operator: '<=', rhs: 18 }
  ]
};

try {
  const problem = createOptimizationProblem(problemData);
  const result = dualSimplexSolve(problem);
  
  console.log('Result:');
  console.log('Status optimal:', result.status === 'optimal');
  console.log('Optimal Value:', result.optimalValue);
  console.log('Iterations:', result.iterations.length - 1);
} catch (error) {
  console.log('Error caught:');
  console.log('Message:', error.message);
  console.log('Status:', error.status);
}
