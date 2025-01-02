import { z } from "zod";

const ApnsDtoSchema = z.object({
    data: z.unknown(),
    channelId: z.string().min(2, { message: "channelId is required" }),
    isVoip: z.boolean(),
    title: z.string().optional(),
    body: z.string().optional(),
    category: z.string().optional(),
    threadId: z.string().optional(),
    badge: z.number().int().nonnegative().optional(),
    args: z.array(z.string()).optional(),
    collapseId: z.string().optional(),
    priority: z.number().int().default(10),
});

export async function ApnsDtoSchemaHandler(data: unknown) {
    try {
        const validate = ApnsDtoSchema.parse(data);
        return validate;
    } catch (error: any) {
        return new Error(error.message);
    }
}
