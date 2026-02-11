/**
 * @fileoverview Zod schemas for validating LLM-generated architecture plans.
 */

import { z } from 'zod';

/** Single component in the architecture */
export const ComponentSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    description: z.string().optional().default(''),
});

/** Relationship between two components */
export const RelationshipSchema = z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    label: z.string().optional().default(''),
    protocol: z.string().optional().default(''),
});

/** Data flow between two components */
export const DataFlowSchema = z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    data: z.string().optional().default(''),
});

/** Infrastructure element */
export const InfraSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().optional().default(''),
});

/** Full architecture plan from LLM */
export const ArchitecturePlanSchema = z.object({
    components: z.array(ComponentSchema).min(1),
    relationships: z.array(RelationshipSchema).default([]),
    data_flows: z.array(DataFlowSchema).default([]),
    infra: z.array(InfraSchema).default([]),
    constraints: z.array(z.string()).default([]),
    architecture_style: z.string().default('layered'),
});

/** Single node in the diagram plan */
export const DiagramNodeSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.string(),
    cloud_icon: z.string().optional().default(''),
    layer: z.string().optional().default('Application'),
    x: z.number().optional(),
    y: z.number().optional(),
});

/** Single edge in the diagram plan */
export const DiagramEdgeSchema = z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional().default(''),
    protocol: z.string().optional().default(''),
});

/** Full diagram plan */
export const DiagramPlanSchema = z.object({
    nodes: z.array(DiagramNodeSchema),
    edges: z.array(DiagramEdgeSchema),
});
