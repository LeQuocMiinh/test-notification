import { Env } from "../interface/env";

export async function getYamlFromKVStorage(env: Env): Promise<any> {
    try {

        const yamlContent = await env.yaml_kv.get("yaml-config");

        if (!yamlContent) {
            return new Error("Yaml content not found");
        }

        return JSON.parse(yamlContent);

    } catch (error: any) {
        return new Error(error.message);
    }
}