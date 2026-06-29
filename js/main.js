(()=>{var m=(i,s)=>()=>(s||i((s={exports:{}}).exports,s),s.exports);var h=m(c=>{window.throttle=(i,s)=>{let l,a;return(...e)=>{let r=c;!a||Date.now()-a>=s?(i.apply(r,e),a=Date.now()):(clearTimeout(l),l=setTimeout(()=>{i.apply(r,e),a=Date.now()},s-(Date.now()-a)))}};(function(){[Element,Document,Window].forEach(e=>{e.prototype._addEventListener=e.prototype.addEventListener,e.prototype._removeEventListener=e.prototype.removeEventListener,e.prototype.addEventListener=e.prototype.on=function(r,n,t){this.__listeners__=this.__listeners__||{},this.__listeners__[r]=this.__listeners__[r]||[];for(let[o,d]of this.__listeners__[r])if(o===n&&JSON.stringify(d)===JSON.stringify(t))return this;return this.__listeners__[r].push([n,t]),this._addEventListener(r,n,t),this},e.prototype.removeEventListener=e.prototype.off=function(r,n,t){return!this.__listeners__||!this.__listeners__[r]?this:n?(this._removeEventListener(r,n,t),this.__listeners__[r]=this.__listeners__[r].filter(([o,d])=>o!==n||JSON.stringify(d)!==JSON.stringify(t)),this.__listeners__[r].length===0&&delete this.__listeners__[r],this):(this.__listeners__[r].forEach(([o,d])=>{this.removeEventListener(r,o,d)}),delete this.__listeners__[r],this)}}),window._$=e=>document.querySelector(e),window._$$=e=>document.querySelectorAll(e);let i=window.matchMedia("(prefers-color-scheme: dark)").matches;function s(e){document.documentElement.setAttribute("data-theme","dark"),localStorage.setItem("dark_mode","true"),document.body.dispatchEvent(new CustomEvent("reimu:theme-set",{detail:{isDark:!0,mode:e}}))}s("true");let l=0;if(document.addEventListener("scroll",()=>{let e=document.documentElement.scrollTop||document.body.scrollTop,r=e-l;window.diffY=r,l=e,r<0?_$("#header-nav")?.classList.remove("header-nav-hidden"):_$("#header-nav")?.classList.add("header-nav-hidden")}),window.Pace&&Pace.on("done",()=>{Pace.sources[0].elements=[]}),window.materialTheme){let r=function(){if(_$("#reimu-generated-theme-style"))return;let o=`
    :root {
      --red-0: var(--md-sys-color-primary-light);
      --red-1: color-mix(in srgb, var(--md-sys-color-primary-light) 90%, white);
      --red-2: color-mix(in srgb, var(--md-sys-color-primary-light) 75%, white);
      --red-3: color-mix(in srgb, var(--md-sys-color-primary-light) 55%, white);
      --red-4: color-mix(in srgb, var(--md-sys-color-primary-light) 40%, white);
      --red-5: color-mix(in srgb, var(--md-sys-color-primary-light) 15%, white);
      --red-5-5: color-mix(in srgb, var(--md-sys-color-primary-light) 10%, white);
      --red-6: color-mix(in srgb, var(--md-sys-color-primary-light) 5%, white);
    
      --color-border: var(--red-3);
      --color-link: var(--red-1);
      --color-meta-shadow: var(--red-6);
      --color-h2-after: var(--red-1);
      --color-red-6-shadow: var(--red-2);
      --color-red-3-shadow: var(--red-3);
    }
    
    [data-theme="dark"]:root {
      --red-0: var(--red-1);
      --red-1: color-mix(in srgb, var(--md-sys-color-primary-dark) 90%, white);
      --red-2: color-mix(in srgb, var(--md-sys-color-primary-dark) 80%, white);
      --red-3: color-mix(in srgb, var(--md-sys-color-primary-dark) 75%, white);
      --red-4: color-mix(in srgb, var(--md-sys-color-primary-dark) 30%, transparent);
      --red-5: color-mix(in srgb, var(--md-sys-color-primary-dark) 20%, transparent);
      --red-5-5: color-mix(in srgb, var(--md-sys-color-primary-dark) 10%, transparent);
      --red-6: color-mix(in srgb, var(--md-sys-color-primary-dark) 5%, transparent);
      
      --color-border: var(--red-5);
    }
    `,d=document.createElement("style");d.id="reimu-generated-theme-style",d.textContent=o,document.body.appendChild(d)};var a=r;let e=new materialTheme.ColorThemeExtractor({needTransition:!1});async function n(t){let o=await e.generateThemeSchemeFromImage(t);document.documentElement.style.setProperty("--md-sys-color-primary-light",e.hexFromArgb(o.schemes.light.props.primary)),document.documentElement.style.setProperty("--md-sys-color-primary-dark",e.hexFromArgb(o.schemes.dark.props.primary)),r()}window.generateSchemeHandler=()=>{if(window.bannerElement?.src)window.bannerElement.complete?n(bannerElement):window.bannerElement.addEventListener("load",()=>{n(bannerElement)},{once:!0});else if(window.bannerElement?.style.background){let t=window.bannerElement.style.background.match(/\d+/g),o=e.generateThemeScheme({r:parseInt(t[0]),g:parseInt(t[1]),b:parseInt(t[2])});document.documentElement.style.setProperty("--md-sys-color-primary-light",e.hexFromArgb(o.schemes.light.props.primary)),document.documentElement.style.setProperty("--md-sys-color-primary-dark",e.hexFromArgb(o.schemes.dark.props.primary)),r()}}}})();window.safeImport=async(i,s)=>{if(!s)return import(i);let a=await(await fetch(i)).text(),e=await crypto.subtle.digest("SHA-384",new TextEncoder().encode(a));if("sha384-"+btoa(String.fromCharCode(...new Uint8Array(e)))!==s)throw new Error(`Integrity check failed for ${i}`);let n=new Blob([a],{type:"application/javascript"}),t=URL.createObjectURL(n),o=await import(t);return URL.revokeObjectURL(t),o}});h();})();
