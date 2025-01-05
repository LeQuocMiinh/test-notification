import { z } from "zod";

export const UnRegisterDtoSchema = z.object({
    deviceIds: z.string().array().nonempty({
        message: "deviceIds can't be empty!",
    })
});

export async function UnRegisterDtoSchemaHandler(data: unknown) {
    try {
        const validate = UnRegisterDtoSchema.parse(data);
        return validate;
    } catch (error: any) {
        return new Error(error.message);
    }
}