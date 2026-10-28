import "dotenv/config";
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET || "safihub";
const endpoint =
  process.env.R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : process.env.AWS_ENDPOINT_URL_S3);

console.log("Configuring CORS for R2 bucket:", bucket);
console.log("Endpoint:", endpoint);

if (!accessKeyId || !secretAccessKey) {
  console.error("Missing R2 credentials in environment");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

async function main() {
  try {
    const allowedOrigins = process.env.R2_CORS_ORIGINS
      ? process.env.R2_CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
      : ["*"];

    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["Content-Type"],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedOrigins: allowedOrigins,
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await client.send(corsCommand);
    console.log("Successfully configured CORS on R2 bucket!");

    const getCors = new GetBucketCorsCommand({ Bucket: bucket });
    const corsRules = await client.send(getCors);
    console.log("Current CORS rules on bucket:", JSON.stringify(corsRules.CORSRules, null, 2));
  } catch (error) {
    console.error("Failed to set CORS on R2 bucket:", error);
    process.exit(1);
  }
}

main();
