import { FcmServiceAccount } from "./fcm-service-account";
import { KVNamespace } from "@cloudflare/workers-types";

export interface FcmOptions {
  serviceAccount: FcmServiceAccount;
  kvStore?: KVNamespace;
  kvCacheKey?: string;
}
