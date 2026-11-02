import assert from 'node:assert/strict';
import {
  fetchHistoricalDemoRecords,
  fetchModelSchema,
  predictVehicleClaim,
  toModelFeatureRecord,
  validateModelFeatures,
} from '../src/services/mlApi';

async function main() {
  const schema = await fetchModelSchema();
  assert.equal(schema.length, 32, 'schema must expose all model features');
  assert.equal(new Set(schema.map((feature) => feature.name)).size, 32, 'feature names must be unique');
  assert.ok(schema.every((feature) => feature.kind === 'number' || feature.categories.length > 0));

  const corsResponse = await fetch('http://localhost:8000/api/schema', {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(corsResponse.status, 200);
  assert.equal(corsResponse.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  const missingErrors = validateModelFeatures(schema, {});
  assert.equal(Object.keys(missingErrors).length, 32, 'all blank required fields must be rejected');

  const historical = await fetchHistoricalDemoRecords();
  assert.equal(historical.demonstration_only, true);
  assert.ok(historical.records.length >= 2, 'both source labels should be available');
  assert.deepEqual(new Set(historical.records.map((record) => record.actual_label)), new Set([0, 1]));

  const predictions = [];
  for (const record of historical.records) {
    assert.equal(Object.keys(record.features).length, 32);
    const recordValues = Object.fromEntries(schema.map((feature) => [feature.name, String(record.features[feature.name])]));
    assert.deepEqual(validateModelFeatures(schema, recordValues), {}, 'genuine row must pass frontend validation');
    const recordFeatures = toModelFeatureRecord(schema, recordValues);
    const recordPrediction = await predictVehicleClaim(recordFeatures);
    assert.equal(recordPrediction.success, true);
    assert.ok([0, 1].includes(recordPrediction.prediction));
    assert.ok(recordPrediction.fraud_probability === null || (recordPrediction.fraud_probability >= 0 && recordPrediction.fraud_probability <= 1));
    predictions.push({ record, values: recordValues, features: recordFeatures, prediction: recordPrediction });
  }
  const { record: row, values, features, prediction } = predictions[0];

  const category = schema.find((feature) => feature.kind === 'category');
  assert.ok(category);
  const invalidCategoryValues = { ...values, [category.name]: '__invalid_training_category__' };
  assert.ok(validateModelFeatures(schema, invalidCategoryValues)[category.name]);
  await assert.rejects(
    () => predictVehicleClaim({ ...features, [category.name]: '__invalid_training_category__' }),
    /training|category|input/i,
  );
  await assert.rejects(
    () => {
      const incomplete = { ...features };
      delete incomplete[schema[0].name];
      return predictVehicleClaim(incomplete);
    },
    /required|missing|32/i,
  );

  const numeric = schema.find((feature) => feature.kind === 'number');
  assert.ok(numeric);
  assert.ok(validateModelFeatures(schema, { ...values, [numeric.name]: '2.5' })[numeric.name]);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'simulated model service outage' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
  try {
    await assert.rejects(() => fetchModelSchema(), /simulated model service outage/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log(JSON.stringify({
    result: 'passed',
    feature_count: schema.length,
    historical_records_tested: predictions.length,
    source_record: row.record_id,
    actual_label: row.actual_label,
    prediction: prediction.prediction,
    fraud_probability: prediction.fraud_probability,
    validation_checks: ['all required fields', 'invalid category', 'fractional numeric', 'backend missing input', 'backend outage error handling', 'CORS origin'],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
