import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from '@packages/common';

const execAsync = promisify(exec);

const kvStorageName = "yaml_kv";
const wranglerTomlPath = path.resolve("wrangler.toml");

const createKvStorage = async (): Promise<string> => {
    try {
        const prodCommand = `wrangler kv:namespace create ${kvStorageName}`;
        const prodResult = await execAsync(prodCommand);
        logger.info(`Production KV Storage Created:\n${prodResult.stdout}`);

        const namespaceIdMatch = prodResult.stdout.match(/id = "(.*?)"/);
        if (!namespaceIdMatch) throw new Error("Unable to extract Production Namespace ID.");
        const namespaceId = namespaceIdMatch[1];
        logger.info(`Extracted Production Namespace ID: ${namespaceId}`);

        const previewCommand = `wrangler kv:namespace create ${kvStorageName} --preview`;
        const previewResult = await execAsync(previewCommand);
        logger.info(`Preview KV Storage Created:\n${previewResult.stdout}`);

        const previewIdMatch = previewResult.stdout.match(/id = "(.*?)"/);
        if (!previewIdMatch) throw new Error("Unable to extract Preview Namespace ID.");
        const previewId = previewIdMatch[1];
        logger.info(`Extracted Preview Namespace ID: ${previewId}`);

        updateWranglerToml(kvStorageName, namespaceId, previewId);

        return kvStorageName;
    } catch (error) {
        logger.error(`Error during KV namespace creation: ${error}`);
        throw error;
    }
};

const updateWranglerToml = (name: string, id: string, previewId: string) => {
    try {
        const tomlContent = fs.readFileSync(wranglerTomlPath, "utf-8");

        const namespaceRegex = new RegExp(
            `\\[\\[kv_namespaces\\]\\]\\n(binding = "${name}"\\n)(id = ".*?"\\n?)(preview_id = ".*?"\\n?)?`,
            "g"
        );

        if (namespaceRegex.test(tomlContent)) {
            const updatedContent = tomlContent.replace(
                namespaceRegex,
                `[[kv_namespaces]]\nbinding = "${name}"\nid = "${id}"\npreview_id = "${previewId}"\n`
            );
            fs.writeFileSync(wranglerTomlPath, updatedContent, "utf-8");
            logger.info(`Updated existing namespace "${name}" with ID "${id}" and Preview ID "${previewId}" in wrangler.toml.`);
        } else {
            const newNamespaceEntry = `\n[[kv_namespaces]]\nbinding = "${name}"\nid = "${id}"\npreview_id = "${previewId}"\n`;
            fs.appendFileSync(wranglerTomlPath, newNamespaceEntry);
            logger.info(`Added namespace "${name}" with ID "${id}" and Preview ID "${previewId}" to wrangler.toml.`);
        }
    } catch (error: any) {
        logger.error(`Error updating wrangler.toml: ${error.message}`);
    }
};


const loadYamlConfig = async (filePath: string): Promise<Record<string, unknown>> => {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents) as Record<string, unknown>;
    } catch (error) {
        logger.error('Error reading YAML file:', error);
        throw error;
    }
};

const saveToKVStorage = async (namespace: string, key: string, value: Record<string, unknown>): Promise<void> => {
    const command_sub = `wrangler kv key put --binding=${namespace} "${key}" '${JSON.stringify(value)}' --preview true`;
    const command_main = `wrangler kv key put --binding=${namespace} "${key}" '${JSON.stringify(value)}' --preview false`;

    try {
        await execAsync(command_sub);
        await execAsync(command_main);
        logger.info(`KV Storage save sucessfully`);
    } catch (error) {
        logger.error(`Error executing wrangler command: ${error}`);
        throw error;
    }
};

const preloadConfig = async () => {
    const yamlFile = path.resolve("env.development.yaml");
    try {
        const configData = await loadYamlConfig(yamlFile);

        const namespace = await createKvStorage();
        await saveToKVStorage(namespace, 'yaml-config', configData);
    } catch (error) {
        logger.error(`Preloading configuration failed: ${error}`);
    }
};

preloadConfig();
