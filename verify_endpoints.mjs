import request from 'supertest';
import app from './src/app.js';

async function runTests() {
  console.log('--- Testing GET /api/optimization/health ---');
  try {
    const healthRes = await request(app).get('/api/optimization/health');
    console.log(`Status: ${healthRes.status}`);
    console.log(`Keys: ${Object.keys(healthRes.body).join(', ')}`);
    if (healthRes.status !== 200) console.log('Unexpected status for health check');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  console.log('\n--- Testing POST /api/optimization/simplex ---');
  const payload = {
    "type": "max",
    "objectiveFunction": [5, 4],
    "constraints": [
      { "coefficients": [6, 4], "operator": "<=", "value": 24 },
      { "coefficients": [1, 2], "operator": "<=", "value": 6 }
    ],
    "variables": ["x1", "x2"]
  };

  try {
    const simplexRes = await request(app)
      .post('/api/optimization/simplex')
      .send(payload);
    console.log(`Status: ${simplexRes.status}`);
    console.log(`Keys: ${Object.keys(simplexRes.body).join(', ')}`);
    if (simplexRes.status !== 200 && simplexRes.status !== 201) {
       console.log('Unexpected status for simplex');
       console.log('Body:', JSON.stringify(simplexRes.body));
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

runTests();
