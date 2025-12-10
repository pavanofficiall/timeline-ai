import { log } from "../utils/logger";

export async function ensureBucket(supabase: any, bucketId = "documents", makePublic = false) {
  try {
    const { data: bucket, error: getErr } = await supabase.storage.getBucket(bucketId);
    if (!getErr && bucket) return { ok: true } as const;
    // If not found or error, attempt create
    const { error: createErr } = await supabase.storage.createBucket(bucketId, { public: makePublic });
    if (createErr) {
      log("ensureBucket: create failed", createErr);
      return { ok: false, error: createErr } as const;
    }
    return { ok: true } as const;
  } catch (e) {
    log("ensureBucket: unexpected error", e);
    return { ok: false, error: e } as const;
  }
}

