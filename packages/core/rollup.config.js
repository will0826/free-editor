import path, {dirname} from 'node:path';
import {babel} from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensions = ['.js', '.ts'];

const pathResolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

export default {
    input: pathResolve('./src/index.ts'),
    output: {
        file: './dist/umd/index.js',
        format: 'umd',
        name: 'bridge'
    },
    onwarn: function (warning) {
        if (warning.code === 'THIS_IS_UNDEFINED') {
            return;
        }
    },
    plugins: [
        nodeResolve({browser: true}),
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfig: './tsconfig.json'
        })
    ]
};
