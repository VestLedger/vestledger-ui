import { execFileSync } from 'node:child_process';

const spec =
  process.env.OPENAPI_SPEC ||
  process.env.npm_config_openapi_spec ||
  '../vestledger-api/openapi.json';

const outFile = 'src/api/generated/openapi.ts';

execFileSync('openapi-typescript', [spec, '--output', outFile], {
  stdio: 'inherit',
});
