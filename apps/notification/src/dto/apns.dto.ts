import { z } from "zod";

export const ApnsDtoSchema = z.object({
    channelId: z.string(),
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).optional(),
    apns: z
        .object({
            isVoip: z.boolean().optional(),
            priority: z.number().optional(),
            category: z.string().optional(),
            threadId: z.string().optional(),
            badge: z.number().optional(),
            collapseId: z.string().optional(),
            args: z.array(z.string()).optional(),
        })
        .optional(),
});

export type ApnsDtoSchemaType = z.infer<typeof ApnsDtoSchema>;

export async function ApnsDtoSchemaHandler(data: unknown) {
    try {
        const validate = ApnsDtoSchema.parse(data);
        return validate;
    } catch (error: any) {
        return new Error(error.message);
    }
}
