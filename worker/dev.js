// Local development only (yarn dev:worker): the real worker, plus a stand-in
// for Cloudflare's /cdn-cgi/image resizing, which doesn't run locally. It
// serves the original image unresized. Not used when deployed.
import worker from "./index.js";

export default {
  ...worker,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/cdn-cgi\/image\/[^/]+(\/.*)$/);
    if (m) return worker.fetch(new Request(new URL(m[1], url), request), env, ctx);
    return worker.fetch(request, env, ctx);
  },
};
