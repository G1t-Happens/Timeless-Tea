import{_ as w,r as v,o as c,c as d,a as e,t as n,e as h,b as $,v as S,d as x,w as V,k as f,l as A,F as B,m as D,B as L,p as P}from"./index-BQPN_HOS.js";const R={class:"modal-content"},j={class:"modal-title"},E={key:0,class:"reply-section"},F=["disabled"],I={__name:"MessageModal",props:{message:{type:Object,required:!0}},emits:["close","reply"],setup(u,{emit:g}){const i=g,t=v(!1),a=v(""),m=()=>{i("close")},y=()=>{t.value=!t.value},p=()=>{i("reply",a.value),a.value="",t.value=!1,i("close")};return(_,l)=>(c(),d("div",{class:"modal-overlay",onClick:V(m,["self"])},[e("div",R,[e("h3",j,n(u.message.subject),1),e("p",null,[l[1]||(l[1]=e("strong",null,"Name:",-1)),h(" "+n(u.message.name),1)]),e("p",null,[l[2]||(l[2]=e("strong",null,"Email:",-1)),h(" "+n(u.message.email),1)]),e("p",null,[l[3]||(l[3]=e("strong",null,"Nachricht:",-1)),h(" "+n(u.message.message),1)]),e("p",null,[e("small",null,"Erstellt am: "+n(new Date(u.message.createdAt).toLocaleString()),1)]),e("div",{class:"actions"},[e("button",{class:"btn btn-exit",onClick:m},"Schließen"),e("button",{class:"btn btn-reply",onClick:y},"Antworten")]),t.value?(c(),d("div",E,[$(e("textarea",{"onUpdate:modelValue":l[0]||(l[0]=b=>a.value=b),placeholder:"Schreiben Sie Ihre Antwort hier...",rows:"4"},null,512),[[S,a.value]]),e("button",{disabled:!a.value.trim(),class:"btn btn-send",onClick:p}," Senden ",8,F)])):x("",!0)])]))}},T=w(I,[["__scopeId","data-v-1080c216"]]),q={class:"messages-container"},O={key:0,class:"loading-spinner"},U={key:1},z=["onClick"],G={class:"message-header"},H={class:"message-time"},J={class:"message-details"},K={class:"pagination"},Q=["disabled"],W=["disabled"],k=4,X={__name:"MessageView",setup(u){const g=v([]),i=v(!1),t=v(1),a=v(null),m=async()=>{i.value=!0;try{const s=await P.get("/api/message");g.value=s.data.data}catch(s){console.error("Fehler beim Laden der Nachrichten:",s)}finally{i.value=!1}},y=s=>new Date(s).toLocaleString(),p=f(()=>g.value.length),_=f(()=>p.value>0?Math.ceil(p.value/k):1),l=f(()=>{const s=(t.value-1)*k,o=s+k;return g.value.slice(s,o)}),b=s=>{s>0&&s<=_.value&&(t.value=s)},C=s=>{a.value=s},M=()=>{a.value=null},N=s=>{console.log("Antwort gesendet:",s),M()};return A(()=>{m()}),(s,o)=>(c(),d("div",q,[i.value?(c(),d("div",O,"Lädt...")):(c(),d("div",U,[(c(!0),d(B,null,D(l.value,r=>(c(),d("div",{class:"message-card",key:r.id,onClick:Y=>C(r)},[e("div",G,[e("h3",null,n(r.subject),1),e("span",H,n(y(r.createdAt)),1)]),e("div",J,[e("p",null,[o[2]||(o[2]=e("strong",null,"Name:",-1)),h(" "+n(r.name),1)])])],8,z))),128)),e("div",K,[e("button",{disabled:t.value===1,onClick:o[0]||(o[0]=r=>b(t.value-1)),class:"pagination-button"}," Vorherige ",8,Q),e("span",null,n(t.value)+" / "+n(_.value),1),e("button",{disabled:t.value===_.value,onClick:o[1]||(o[1]=r=>b(t.value+1)),class:"pagination-button"}," Nächste ",8,W)])])),a.value?(c(),L(T,{key:2,message:a.value,onClose:M,onReply:N},null,8,["message"])):x("",!0)]))}},ee=w(X,[["__scopeId","data-v-52d91310"]]);export{ee as default};
