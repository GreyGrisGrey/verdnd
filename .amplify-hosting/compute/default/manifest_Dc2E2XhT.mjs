import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_bTjnUxVN.mjs';
import 'clsx';
import './chunks/astro-designed-error-pages_D3xzmujX.mjs';
import 'es-module-lexer';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_-iYvQsP8.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/greybox/secondShmep/","cacheDir":"file:///C:/greybox/secondShmep/node_modules/.astro/","outDir":"file:///C:/greybox/secondShmep/dist/","srcDir":"file:///C:/greybox/secondShmep/src/","publicDir":"file:///C:/greybox/secondShmep/public/","buildClientDir":"file:///C:/greybox/secondShmep/.amplify-hosting/static/","buildServerDir":"file:///C:/greybox/secondShmep/.amplify-hosting/compute/default/","adapterName":"astro-aws-amplify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_actions/[...path]","pattern":"^\\/_actions(?:\\/(.*?))?\\/?$","segments":[[{"content":"_actions","dynamic":false,"spread":false}],[{"content":"...path","dynamic":true,"spread":true}]],"params":["...path"],"component":"node_modules/astro/dist/actions/runtime/route.js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"#board[data-astro-cid-t7f5cdi3]{background:#444;position:absolute;z-index:0;left:0;top:0}#rollContainer[data-astro-cid-ekujjhak]{visibility:hidden}.colLabel[data-astro-cid-ekujjhak]{position:absolute;left:10px}#redLabel[data-astro-cid-ekujjhak]{top:45px}#greenLabel[data-astro-cid-ekujjhak]{top:75px}#blueLabel[data-astro-cid-ekujjhak]{top:105px}#opacLabel[data-astro-cid-ekujjhak]{top:135px}#colContainer[data-astro-cid-ekujjhak]{pointer-events:auto}.colorTab[data-astro-cid-ekujjhak]{background-color:#c8c8c880;position:absolute;width:30px;height:30px;top:8px;border:solid black}#leftBar[data-astro-cid-ekujjhak]{background-color:#c8c8c880;position:absolute;bottom:480px;left:10px;width:250px;height:280px;border:solid black;pointer-events:none}#redColSlide[data-astro-cid-ekujjhak]{position:absolute;top:45px;left:25px;width:175px}#redColText[data-astro-cid-ekujjhak]{position:absolute;top:45px;left:215px;width:25px}#greenColSlide[data-astro-cid-ekujjhak]{position:absolute;top:75px;left:25px;width:175px}#greenColText[data-astro-cid-ekujjhak]{position:absolute;top:75px;left:215px;width:25px}#blueColSlide[data-astro-cid-ekujjhak]{position:absolute;top:105px;left:25px;width:175px}#blueColText[data-astro-cid-ekujjhak]{position:absolute;top:105px;left:215px;width:25px}#opacColSlide[data-astro-cid-ekujjhak]{position:absolute;top:135px;left:25px;width:175px}#opacColText[data-astro-cid-ekujjhak]{position:absolute;top:135px;left:215px;width:25px}#colourSquare[data-astro-cid-ekujjhak]{position:absolute;bottom:10px;left:10px;width:230px;height:100px;background-color:#c80000}#tokenMenuItems[data-astro-cid-sti65rzb]{background:#c8c8c8;width:250px;height:50px;position:absolute;top:150px;left:0;visibility:hidden}#tokenSize[data-astro-cid-sti65rzb]{position:absolute;left:60px;width:100px;pointer-events:auto}#tokenNameLabel[data-astro-cid-sti65rzb]{position:absolute;left:10px;width:100px;top:27px}#tokenSizeLabel[data-astro-cid-sti65rzb]{position:absolute;left:10px;width:100px;top:2px}#tokenName[data-astro-cid-sti65rzb]{position:absolute;left:60px;width:100px;top:25px;pointer-events:auto}.modeButton[data-astro-cid-sti65rzb]{background:#c8c8c8;z-index:3;width:250px;height:50px;pointer-events:auto}.modeButton[data-astro-cid-sti65rzb]:disabled{background-color:#969696}#modeMenuID[data-astro-cid-sti65rzb]{background-color:#c8c8c880;border:solid black;position:absolute;z-index:2;bottom:10px;left:10px;width:250px;height:150px;pointer-events:none}.modeExplain[data-astro-cid-sti65rzb]{background-color:#c8c8c880;border:solid black;position:absolute;z-index:2;bottom:170px;left:10px;width:250px;height:300px;pointer-events:none}#modeParagraph[data-astro-cid-sti65rzb]{position:absolute;bottom:10px;left:10px}.rightTab[data-astro-cid-hbyrvezf]{background-color:#c8c8c880;border:solid black;position:absolute;z-index:2;top:10px;left:-20px;width:20px;height:30px;pointer-events:auto}#tokenTab[data-astro-cid-hbyrvezf]{top:50px}#layerTab[data-astro-cid-hbyrvezf]{top:90px}#characterTab[data-astro-cid-hbyrvezf]{top:130px}#rightBar[data-astro-cid-hbyrvezf]{background-color:#c8c8c880;border:solid black;position:absolute;z-index:2;bottom:10px;right:10px;width:250px;height:300px;pointer-events:none}#rightPara[data-astro-cid-hbyrvezf]{position:absolute;bottom:10px;left:10px}#chatBox[data-astro-cid-hbyrvezf]{position:absolute}html,body{margin:0;width:100%;height:100%}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/greybox/secondShmep/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/entrypoint":"entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/actions/runtime/route@_@js":"pages/_actions/_---path_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_Dc2E2XhT.mjs","C:/greybox/secondShmep/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BA5tf_HX.mjs","C:/greybox/secondShmep/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.D0n8LzKD.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/stats.html","/favicon.ico","/favicon.svg","/_astro/index.astro_astro_type_script_index_0_lang.D0n8LzKD.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"fPDOw4tRzPpXpm9P48CCnMuhYxDZ1GRZYNE84vsnE4s="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
