import{_ as u,r as l,c as d,f as c,a as t,b as n,v as i,w as f,o as g,q as b,p as v}from "./index-S2dVXRzt.js";import{B as y}from "./BackButton-CpLP0EiE.js";const x={class:"create-article"},B={class:"form-group"},_={class:"form-group"},w={__name:"CreateCategory",setup(h){const o=l(""),a=l(""),m=b(),p=async()=>{const s={name:o.value,type:a.value};try{await v.post("/api/category",s,{}),await m.push({name:"AdminDasboard"})}catch(e){console.error("Fehler beim Erstellen der Kategorie:",e)}};return(s, e)=>(g(),d("div",x,[c(y),e[5]||(e[5]=t("h2",{class:"page-title"},"Neuen Kategorie erstellen",-1)),t("form",{onSubmit:f(p,["prevent"]),class:"form-container",method:"post"},[t("div",B,[e[2]||(e[2]=t("label",{for:"description",class:"form-label"},"Kategorietype (z.B. Geschmack, Effekt)",-1)),n(t("input",{type:"text","onUpdate:modelValue":e[0]||(e[0]= r=>a.value=r),id:"description",class:"form-control",minlength:"1",maxlength:"20",required:""},null,512),[[i,a.value]])]),t("div",_,[e[3]||(e[3]=t("label",{for:"name",class:"form-label"},"Kategoriename (z.B. Fruchtig, Wuerzig)",-1)),n(t("input",{type:"text","onUpdate:modelValue":e[1]||(e[1]= r=>o.value=r),id:"name",class:"form-control",minlength:"1",maxlength:"20",required:""},null,512),[[i,o.value]])]),e[4]||(e[4]=t("button",{type:"submit",class:"btn btn-primary w-100"},"Kategorie erstellen",-1))],32)]))}},K=u(w,[["__scopeId","data-v-96515bb5"]]);export{K as default};
