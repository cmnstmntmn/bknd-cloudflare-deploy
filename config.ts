import { boolean, em, entity, text } from "bknd";
import type { CloudflareBkndConfig } from "bknd/adapter/cloudflare";
import { cloudflareImageOptimization } from "bknd/plugins";
import { secureRandomString } from "bknd/utils";

const schema = em({
  todos: entity("todos", {
    titles: text(),
    done: boolean(),
  }),
});

export default {
  d1: {
    session: true,
  },
  app: (_env) => {
    return {
      // in production mode, we use the appconfig.json file as static config
      config: {
        data: schema.toJSON(),
        server: {
          mcp: {
            enabled: true,
          },
        },
        auth: {
          enabled: false,
          jwt: {
            issuer: "domzz",
            secret: secureRandomString(64),
          },
          guard: { enabled: true },
          roles: {
            EDITOR: {
              is_default: true,
              implicit_allow: false,
              permissions: [
                "system.access.api",
                "media.file.read",
                "data.entity.read",
              ],
            },
            ADMIN: {
              implicit_allow: true,
            },
          },
        },
        media: {
          enabled: true,
          adapter: {
            type: "r2",
            config: {
              binding: "BUCKET",
            },
          },
        },
      },
      options: {
        mode: "code",
        plugins: [
          cloudflareImageOptimization({
            accessUrl: "/api/_plugin/image/optimize",
            explain: true,
          }),
        ],
      },
      onBuilt: async (app) => {
        console.log("On build");

        const hono = app.server;
        hono.get("/hello", (c) => c.text("Hello from bknd hono route"));
      },
    };
  },
} satisfies CloudflareBkndConfig;
