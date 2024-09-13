import javaScriptLint from './javascript.js';
import typeScriptLint from './typescript.js';
import packageJson from './package-json.js';

export default [...javaScriptLint, ...typeScriptLint, ...packageJson];
