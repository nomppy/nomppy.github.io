import{_ as g}from"./SiteLink.vue.43mPBfq9.js";import v from"./Icon.s3szhvya.js";import{l as b,K as w,a5 as C,c as s,ah as M,o as _,f as x,w as r,x as $,b as t,s as p,a as l,v as m,d as u}from"./entry.379RuqcD.js";import{_ as d}from"./_plugin-vue_export-helper.x3n3nnut.js";import"./nuxt-link.xHxhb-MQ.js";import"./index.0wqzsba0.js";const S=b({name:"ClientOnly",inheritAttrs:!1,props:["fallback","placeholder","placeholderTag","fallbackTag"],setup(n,{slots:e,attrs:o}){const c=w(!1);return C(()=>{c.value=!0}),a=>{var h;if(c.value)return(h=e.default)==null?void 0:h.call(e);const i=e.fallback||e.placeholder;if(i)return i();const f=a.fallback||a.placeholder||"",k=a.fallbackTag||a.placeholderTag||"span";return s(k,o,f)}}}),T={name:M,props:{placeholder:String,tag:{type:String,default:"span"}}};function y(n,e,o,c,a,i){const f=S;return _(),x(f,{placeholder:o.placeholder,"placeholder-tag":o.tag},{default:r(()=>[$(n.$slots,"default")]),_:3},8,["placeholder","placeholder-tag"])}const B=d(T,[["render",y]]),N={},I={class:"color-mode-switch"};function V(n,e){const o=v,c=B;return _(),s("div",I,[t(c,{placeholder:"...",tag:"span"},{default:r(()=>[p(l("button",{onClick:e[0]||(e[0]=a=>n.$colorMode.preference="system")},[t(o,{class:"icon",name:"ph:moon-fill"})],512),[[m,n.$colorMode.preference==="dark"]]),p(l("button",{onClick:e[1]||(e[1]=a=>n.$colorMode.preference="dark")},[t(o,{class:"icon",name:"ph:sun-fill"})],512),[[m,n.$colorMode.preference==="light"]]),p(l("button",{onClick:e[2]||(e[2]=a=>n.$colorMode.preference="light")},[t(o,{class:"icon",name:"ri:computer-line"})],512),[[m,n.$colorMode.preference==="system"]])]),_:1})])}const O=d(N,[["render",V],["__scopeId","data-v-e5a03eae"]]),A={},D={class:"site-nav"};function E(n,e){const o=g,c=O;return _(),s("ul",D,[l("li",null,[t(o,{to:"/"},{default:r(()=>[u("welcome")]),_:1})]),l("li",null,[t(o,{to:"/posts/"},{default:r(()=>[u("posts")]),_:1})]),l("li",null,[t(o,{to:"/news/"},{default:r(()=>[u("news")]),_:1})]),t(c,{class:"color-mode-switch"})])}const K=d(A,[["render",E],["__scopeId","data-v-8f08129e"]]),j={};function q(n,e){const o=K;return _(),s("div",null,[t(o),$(n.$slots,"default")])}const P=d(j,[["render",q]]);export{P as default};
