"use client";

/**
 * This configuration is used for the Sanity Studio mounted at `/app/studio/[[...tool]]/page.tsx`.
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { resolvePublicSiteOriginSync } from "./lib/resolvePublicSiteOrigin";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const previewUrl = resolvePublicSiteOriginSync();

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: `${previewUrl}/api/draft-mode/enable`,
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
