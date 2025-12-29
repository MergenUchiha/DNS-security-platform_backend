import { z } from 'zod';

// Attack Type Enum
export const AttackTypeEnum = z.enum([
  'dns_cache_poisoning',
  'man_in_the_middle',
  'local_dns_hijack',
  'rogue_dns_server',
]);

// Attack Intensity Enum
export const AttackIntensityEnum = z.enum(['low', 'medium', 'high']);

// Simulation Schema
export const StartSimulationSchema = z.object({
  type: AttackTypeEnum,
  targetDomain: z.string().min(1, 'Target domain is required'),
  spoofedIP: z.string().ip('Invalid IP address'),
  intensity: AttackIntensityEnum,
  duration: z.number().int().min(10).max(300),
});

// Mitigation Config Schema
export const UpdateMitigationConfigSchema = z.object({
  dnssecEnabled: z.boolean().optional(),
  firewallEnabled: z.boolean().optional(),
  ratelimitingEnabled: z.boolean().optional(),
  maxQueriesPerSecond: z.number().int().min(1).max(1000).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  ipBlacklist: z.array(z.string()).optional(),
  trustedResolvers: z.array(z.string()).optional(),
});

// Types
export type StartSimulationInput = z.infer<typeof StartSimulationSchema>;
export type UpdateMitigationConfigInput = z.infer<typeof UpdateMitigationConfigSchema>;
export type AttackType = z.infer<typeof AttackTypeEnum>;
export type AttackIntensity = z.infer<typeof AttackIntensityEnum>;