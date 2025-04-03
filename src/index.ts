#!/usr/bin/env node

import { runQuiz } from './services';
import { setupConfig } from './services/config.service';

const args = process.argv.slice(2);

if (args[0] === 'setup') {
  setupConfig().catch(console.error);
} else {
  runQuiz().catch(console.error);
}
