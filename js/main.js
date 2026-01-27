(()=>{var h=(a,n)=>()=>(n||a((n={exports:{}}).exports,n),n.exports);var y=h(m=>{window.throttle=(a,n)=>{let c,i;return(...l)=>{let e=m;!i||Date.now()-i>=n?(a.apply(e,l),i=Date.now()):(clearTimeout(c),c=setTimeout(()=>{a.apply(e,l),i=Date.now()},n-(Date.now()-i)))}};(function(){[Element,Document,Window].forEach(e=>{e.prototype._addEventListener=e.prototype.addEventListener,e.prototype._removeEventListener=e.prototype.removeEventListener,e.prototype.addEventListener=e.prototype.on=function(r,t,o){this.__listeners__=this.__listeners__||{},this.__listeners__[r]=this.__listeners__[r]||[];for(let[s,d]of this.__listeners__[r])if(s===t&&JSON.stringify(d)===JSON.stringify(o))return this;return this.__listeners__[r].push([t,o]),this._addEventListener(r,t,o),this},e.prototype.removeEventListener=e.prototype.off=function(r,t,o){return!this.__listeners__||!this.__listeners__[r]?this:t?(this._removeEventListener(r,t,o),this.__listeners__[r]=this.__listeners__[r].filter(([s,d])=>s!==t||JSON.stringify(d)!==JSON.stringify(o)),this.__listeners__[r].length===0&&delete this.__listeners__[r],this):(this.__listeners__[r].forEach(([s,d])=>{this.removeEventListener(r,s,d)}),delete this.__listeners__[r],this)}}),window._$=e=>document.querySelector(e),window._$$=e=>document.querySelectorAll(e);let a=window.matchMedia("(prefers-color-scheme: dark)").matches;function n(e){let t=e==="true"||e==="auto"&&a;document.documentElement.setAttribute("data-theme",t?"dark":null),localStorage.setItem("dark_mode",e),document.body.dispatchEvent(new CustomEvent("reimu:theme-set",{detail:{isDark:t,mode:e}}))}n("true");let i=0;if(document.addEventListener("scroll",()=>{let e=document.documentElement.scrollTop||document.body.scrollTop,r=e-i;window.diffY=r,i=e,r<0?_$("#header-nav")?.classList.remove("header-nav-hidden"):_$("#header-nav")?.classList.add("header-nav-hidden")}),window.Pace&&Pace.on("done",()=>{Pace.sources[0].elements=[]}),window.materialTheme){let r=function(){if(_$("#reimu-generated-theme-style"))return;let s=`
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
    `,d=document.createElement("style");d.id="reimu-generated-theme-style",d.textContent=s,document.body.appendChild(d)};var l=r;let e=new materialTheme.ColorThemeExtractor({needTransition:!1});async function t(o){let s=await e.generateThemeSchemeFromImage(o);document.documentElement.style.setProperty("--md-sys-color-primary-light",e.hexFromArgb(s.schemes.light.props.primary)),document.documentElement.style.setProperty("--md-sys-color-primary-dark",e.hexFromArgb(s.schemes.dark.props.primary)),r()}window.generateSchemeHandler=()=>{if(window.bannerElement?.src)window.bannerElement.complete?t(bannerElement):window.bannerElement.addEventListener("load",()=>{t(bannerElement)},{once:!0});else if(window.bannerElement?.style.background){let o=window.bannerElement.style.background.match(/\d+/g),s=e.generateThemeScheme({r:parseInt(o[0]),g:parseInt(o[1]),b:parseInt(o[2])});document.documentElement.style.setProperty("--md-sys-color-primary-light",e.hexFromArgb(s.schemes.light.props.primary)),document.documentElement.style.setProperty("--md-sys-color-primary-dark",e.hexFromArgb(s.schemes.dark.props.primary)),r()}}}})();window.safeImport=async(a,n)=>{if(!n)return import(a);let i=await(await fetch(a)).text(),l=await crypto.subtle.digest("SHA-384",new TextEncoder().encode(i));if("sha384-"+btoa(String.fromCharCode(...new Uint8Array(l)))!==n)throw new Error(`Integrity check failed for ${a}`);let r=new Blob([i],{type:"application/javascript"}),t=URL.createObjectURL(r),o=await import(t);return URL.revokeObjectURL(t),o}});y();})();
