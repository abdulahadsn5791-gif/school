import { z } from 'zod';

/** Human-readable school code used in path params (new.md §5). */
export const schoolCodeParamDto = z
  .string()
  .trim()
  .min(2)
  .max(32)
  .regex(/^[A-Za-z0-9-]+$/, 'School code may only contain letters, numbers and dashes.');

export type SchoolCodeParamType = z.infer<typeof schoolCodeParamDto>;
