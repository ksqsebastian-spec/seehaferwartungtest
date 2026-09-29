import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createIntakeToken} from '../src/intake.js';
const secret=process.env.INTAKE_SECRET||await fs.readFile('.deploy/intake-secret','utf8');
const id=process.argv[2]||randomUUID();
const token=await createIntakeToken(secret.trim(),id);
console.log('https://seehaferwartungtest.ksqsebastian.workers.dev/aufnahme.html#token='+token);
