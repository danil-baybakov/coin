"use strict";(self.webpackChunkapp_coin=self.webpackChunkapp_coin||[]).push([[178],{3914:(e,t,n)=>{n.r(t),n.d(t,{render:()=>i});var r=n(5877),a=n(8575);const l=n.p+"7ebf1bf7204f4721c44c.png",o=n.p+"c17b3dafa8bcbe410a9d.png";function i(e,t){const n=(0,r.el)("div.header__container.container.container2");e?t.classList.add("is-control"):t.classList.remove("is-control");const i=(0,r.el)("div.header__wrapper");(0,r.IX)(n,i);const s=(0,r.el)("div.header__logo"),c=(0,r.el)("picture.header__logo-picture"),d=(0,r.el)("source.header__logo-source",{srcset:o,media:"(max-width: 768px)"}),u=(0,r.el)("source.header__logo-source",{srcset:l,media:"(max-width: 1920px)"}),h=(0,r.el)("source.header__logo-source",{srcset:l,media:"(min-width: 1920px)"}),_=(0,r.el)("img.header__logo-img",{src:l});(0,r.IX)(s,c),(0,r.IX)(c,d,u,h,_);const p=(0,r.el)("nav.header__nav"),b=(0,r.el)("ul.header__nav-list.list-reset"),m=(0,r.el)("li.header__nav-item"),v=(0,r.el)("a.header__nav-btn.btn.link-reset.btn-outline",{id:"btnBanks",href:"#"},"Банкоматы");v.addEventListener("click",(e=>{e.preventDefault(),history.pushState(null,"","/banks"),(0,a.renderElement)("banks",document.querySelector("#appContainer"))})),(0,r.IX)(m,v);const k=(0,r.el)("li.header__nav-item"),f=(0,r.el)("a.header__nav-btn.btn.link-reset.btn-outline",{id:"btnAccounts",href:"#"},"Счета");f.addEventListener("click",(e=>{e.preventDefault(),history.pushState(null,"","/accounts"),(0,a.renderElement)("user",document.querySelector("#appContainer"))})),(0,r.IX)(k,f);const g=(0,r.el)("li.header__nav-item"),I=(0,r.el)("a.header__nav-btn.btn.link-reset.btn-outline",{id:"btnCurrency",href:"#"},"Валюта");I.addEventListener("click",(e=>{e.preventDefault(),history.pushState(null,"","/coin-tools"),(0,a.renderElement)("coin-tools",document.querySelector("#appContainer"))})),(0,r.IX)(g,I);const y=(0,r.el)("li.header__nav-item"),E=(0,r.el)("a.header__nav-btn.btn.link-reset.btn-outline",{id:"btnExit",href:"#"},"Выйти");return E.addEventListener("click",(e=>{e.preventDefault(),history.pushState(null,"","/login"),sessionStorage.removeItem("token"),(0,a.renderElement)("header",document.querySelector("#appHeader"),!1),(0,a.renderElement)("auth",document.querySelector("#appContainer"))})),(0,r.IX)(y,E),(0,r.IX)(b,m,k,g,y),(0,r.IX)(p,b),(0,r.IX)(i,s,p),n}}}]);