import { type Options, defineConfig } from 'tsup';

export default defineConfig((options: Options) => ({
    entryPoints: ['src/**/*.ts'],
    clean: true,
    format: 'esm',
    // keep your internal aliases external and avoid bundling Prisma client
    // external: [],
    platform: 'node',
    treeshake: false, // Disable tree shaking
    splitting: false, // Disable code splitting
    minify: false, // Disable minification which can cause chunking
    ...options,
}));
