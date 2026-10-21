import { z } from 'zod';

// Keep Zod on its interpreter path. Its optional JIT capability probe uses
// `Function`, which strict CSP correctly blocks and reports even when caught.
z.config({ jitless: true });
