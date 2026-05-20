import { validateProblem } from "./src/services/validation.service.js";
import { createOptimizationProblem } from "./src/models/optimizationProblem.model.js";
import { simplexSolve } from "./src/services/simplex.service.js";
import { dualSimplexSolve } from "./src/services/dualSimplex.service.js";
import app from "./src/app.js";

const simplexPayload = {
  "type": "max",
  "objectiveFunction": [3, 5],
  "constraints": [
    { "coefficients": [1, 0], "operator": "<=", "value": 4 },
    { "coefficients": [0, 2], "operator": "<=", "value": 12 },
    { "coefficients": [3, 2], "operator": "<=", "value": 18 }
  ],
  "variables": ["x1", "x2"]
};

try {
  console.log("--- Validation ---");
  const validationErrors = validateProblem(simplexPayload);
  if (validationErrors.length > 0) {
    console.log("Validation Errors:", validationErrors);
  } else {
    console.log("Validation successful.");
  }

  console.log("\n--- Solving Simplex ---");
  const problem = createOptimizationProblem(simplexPayload);
  const result = simplexSolve(problem);
  
  console.log("Response keys:", Object.keys(result));
  console.log("Optimal Value:", result.optimalValue);
  console.log("Solution:", JSON.stringify(result.solution));

  console.log("\n--- Loading App ---");
  if (app && typeof app === "function") {
    console.log("Express app loaded successfully.");
  } else {
    console.log("Failed to load Express app.");
  }
} catch (error) {
  console.error("An error occurred:", error);
}
