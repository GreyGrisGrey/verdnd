import { e as createComponent, m as maybeRenderHead, r as renderTemplate, g as addAttribute, k as renderHead, l as renderSlot, h as createAstro, n as renderComponent, o as renderScript } from '../chunks/astro/server_bTjnUxVN.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Board = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="canvasContainer" data-astro-cid-t7f5cdi3> <canvas id="board" data-astro-cid-t7f5cdi3></canvas> </div> `;
}, "C:/greybox/secondShmep/src/components/Board.astro", void 0);

const $$LeftBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="leftBar" data-astro-cid-ekujjhak> <div id="colContainer" data-astro-cid-ekujjhak> <input type="range" id="redColSlide" min="0" max="255" data-astro-cid-ekujjhak> <label class="colLabel" id="redLabel" data-astro-cid-ekujjhak>R</label> <input type="text" id="redColText" data-astro-cid-ekujjhak> <input type="range" id="greenColSlide" min="0" max="255" data-astro-cid-ekujjhak> <label class="colLabel" id="greenLabel" data-astro-cid-ekujjhak>G</label> <input type="text" id="greenColText" data-astro-cid-ekujjhak> <input type="range" id="blueColSlide" min="0" max="255" data-astro-cid-ekujjhak> <label class="colLabel" id="blueLabel" data-astro-cid-ekujjhak>B</label> <input type="text" id="blueColText" data-astro-cid-ekujjhak> <input type="range" id="opacColSlide" min="0" max="100" data-astro-cid-ekujjhak> <label class="colLabel" id="opacLabel" data-astro-cid-ekujjhak>O</label> <input type="text" id="opacColText" data-astro-cid-ekujjhak> <canvas id="colourSquare" data-astro-cid-ekujjhak></canvas> <button class="colorTab" id="col1" data-astro-cid-ekujjhak></button> <button class="colorTab" id="col2" data-astro-cid-ekujjhak></button> <button class="colorTab" id="col3" data-astro-cid-ekujjhak></button> <button class="colorTab" id="col4" data-astro-cid-ekujjhak></button> <button class="colorTab" id="col5" data-astro-cid-ekujjhak></button> <button class="colorTab" id="col6" data-astro-cid-ekujjhak></button> </div> <div id="rollContainer" data-astro-cid-ekujjhak></div> </div>  `;
}, "C:/greybox/secondShmep/src/components/LeftBar.astro", void 0);

const $$ModeMenu = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="modeMenuID" data-astro-cid-sti65rzb> <button class="modeButton" id="viewMenuButton" disabled data-astro-cid-sti65rzb>View</button> <button class="modeButton" id="tokenMenuButton" data-astro-cid-sti65rzb>Token</button> <button class="modeButton" id="drawMenuButton" data-astro-cid-sti65rzb>Draw</button> </div> <div class="modeExplain" id="modeExplainations" data-astro-cid-sti65rzb> <p id="modeParagraph" data-astro-cid-sti65rzb>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p> <div id="tokenMenuItems" data-astro-cid-sti65rzb> <input type="text" id="tokenSize" data-astro-cid-sti65rzb> <input type="text" id="tokenName" data-astro-cid-sti65rzb> <label id="tokenNameLabel" data-astro-cid-sti65rzb>Name</label> <label id="tokenSizeLabel" data-astro-cid-sti65rzb>Size</label> </div> </div> `;
}, "C:/greybox/secondShmep/src/components/ModeMenu.astro", void 0);

const $$RightBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="rightBar" data-astro-cid-hbyrvezf> <p id="rightPara" data-astro-cid-hbyrvezf>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p> <button class="rightTab" id="rollTab" data-astro-cid-hbyrvezf>R</button> <button class="rightTab" id="tokenTab" data-astro-cid-hbyrvezf>T</button> <button class="rightTab" id="layerTab" data-astro-cid-hbyrvezf>L</button> <button class="rightTab" id="characterTab" data-astro-cid-hbyrvezf>C</button> <div id="chatBox" data-astro-cid-hbyrvezf></div> <div id="layerLayerObj" data-astro-cid-hbyrvezf> <div id="descLayerObj" data-astro-cid-hbyrvezf></div> </div> </div>  `;
}, "C:/greybox/secondShmep/src/components/RightBar.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro2.generator, "content")}>${renderHead()}</head> <body data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/greybox/secondShmep/src/layouts/Layout.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` <title>Gameboard</title> ${renderScript($$result2, "C:/greybox/secondShmep/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ${renderComponent($$result2, "ModeMenu", $$ModeMenu, {})} ${renderComponent($$result2, "Board", $$Board, {})} ${renderComponent($$result2, "LeftBar", $$LeftBar, {})} ${renderComponent($$result2, "RightBar", $$RightBar, {})} ` })}`;
}, "C:/greybox/secondShmep/src/pages/index.astro", void 0);

const $$file = "C:/greybox/secondShmep/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
