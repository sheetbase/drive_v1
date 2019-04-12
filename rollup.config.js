import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './dist/esm3/public_api.js',
    output: [
        {
            file: './dist/fesm3/sheetbase-drive.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/bundles/sheetbase-drive.umd.js',
            format: 'umd',
            sourcemap: true,
            name: 'Drive'
        }
    ],
    plugins: [
        resolve(),
        commonjs()
    ]
};
