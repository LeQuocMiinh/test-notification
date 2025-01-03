import { z } from "zod";

export const UnSubscribeDtoSchema = z.object({
    channelIds: z.string().array().nonempty({
        message: "channelIds can't be empty!",
    })
});

export async function UnSubscribeDtoSchemaHandler(data: unknown) {
    try {
        const validate = UnSubscribeDtoSchema.parse(data);
        return validate;
    } catch (error: any) {
        return new Error(error.message);
    }
}