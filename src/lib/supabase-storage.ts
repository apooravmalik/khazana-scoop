export const supabaseBuckets = {
  productImages: "product-images",
  inventoryImages: "inventory-images",
  homepageReels: "homepage-reels",
  scoopPhotos: "scoop-photos",
  packingVideos: "packing-videos",
  profileAvatars: "profile-avatars",
} as const;

export type SupabaseBucket = (typeof supabaseBuckets)[keyof typeof supabaseBuckets];

export type UploadStorageObjectInput = {
  bucket: SupabaseBucket;
  path: string;
  body: BodyInit;
  contentType: string;
  cacheControl?: string;
  upsert?: boolean;
};

export type SignedUrlInput = {
  bucket: SupabaseBucket;
  path: string;
  expiresInSeconds?: number;
};

export type SignedUrlResult = {
  signedUrl: string;
};

type SupabaseStorageConfig = {
  url: string;
  serviceRoleKey: string;
};

function getSupabaseStorageConfig(): SupabaseStorageConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  };
}

function encodeStoragePath(path: string): string {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function getPublicStorageUrl(bucket: SupabaseBucket, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to build Supabase public storage URLs.");
  }

  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeStoragePath(path)}`;
}

export async function uploadStorageObject({
  bucket,
  path,
  body,
  contentType,
  cacheControl = "3600",
  upsert = true,
}: UploadStorageObjectInput): Promise<string> {
  const config = getSupabaseStorageConfig();
  const response = await fetch(`${config.url}/storage/v1/object/${bucket}/${encodeStoragePath(path)}`, {
    body,
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Cache-Control": cacheControl,
      "Content-Type": contentType,
      "x-upsert": String(upsert),
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase storage upload failed: ${response.status} ${message}`);
  }

  return getPublicStorageUrl(bucket, path);
}

export async function createSignedStorageUrl({
  bucket,
  path,
  expiresInSeconds = 60 * 10,
}: SignedUrlInput): Promise<SignedUrlResult> {
  const config = getSupabaseStorageConfig();
  const response = await fetch(`${config.url}/storage/v1/object/sign/${bucket}/${encodeStoragePath(path)}`, {
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase signed URL creation failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL ?? payload.signedUrl;

  if (!signedPath) {
    throw new Error("Supabase did not return a signed URL.");
  }

  return {
    signedUrl: signedPath.startsWith("http") ? signedPath : `${config.url}${signedPath}`,
  };
}
