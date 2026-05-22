// Wrapper around the Vercel Next.js adapter to fix Next.js 16 compatibility.
// Next.js 16.2.1 removed `projectDir` from the modifyConfig context, but the
// Vercel adapter still expects it. This wrapper adds it back using process.cwd().
Object.defineProperty(exports, '__esModule', { value: true });

const NEXT_ADAPTER_PATH = process.env.NEXT_ADAPTER_PATH;

let realAdapter = null;
if (NEXT_ADAPTER_PATH) {
  try {
    const mod = require(NEXT_ADAPTER_PATH);
    realAdapter = mod.default || mod;
  } catch (e) {
    // ignore — real adapter unavailable outside Vercel environment
  }
}

exports.default = {
  name: realAdapter?.name ?? 'Vercel',

  async modifyConfig(config, ctx) {
    if (realAdapter?.modifyConfig) {
      return realAdapter.modifyConfig(config, {
        ...ctx,
        projectDir: ctx.projectDir ?? process.cwd(),
      });
    }
    return config;
  },

  async onBuildComplete(ctx) {
    if (realAdapter?.onBuildComplete) {
      return realAdapter.onBuildComplete(ctx);
    }
  },
};
