import{_ as G,o as a,c as n,a as e,t as c,e as L,n as j,r as d,u as ue,k as de,l as ce,d as f,F as V,m as E,f as F,S as J,p as y,q as b,P as ve,s as me}from"./index-BTg0P_Sh.js";const he={class:"card h-100 shadow-sm"},be={class:"card-body"},ge={class:"card-title"},fe={class:"card-text"},_e={class:"card-text"},ke={class:"card-text"},pe={__name:"UserCard",props:{user:{type:Object,required:!0}},setup(g){return(v,i)=>(a(),n("div",he,[e("div",be,[e("h5",ge,c(g.user.firstName)+" "+c(g.user.lastName),1),e("p",fe,[i[0]||(i[0]=e("strong",null,"User-ID: ",-1)),L(c(g.user.id),1)]),e("p",_e,[i[1]||(i[1]=e("strong",null,"Email:",-1)),L(" "+c(g.user.emailAddress),1)]),e("p",ke,[i[2]||(i[2]=e("strong",null,"Rolle:",-1)),L(" "+c(g.user.isAdmin?"Admin":"Benutzer"),1)])])]))}},ye=G(pe,[["__scopeId","data-v-e67e7c85"]]),we={props:{order:{type:Object,required:!0}},methods:{formatCurrency(g){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(g)},formatDate(g){return new Date(g).toLocaleDateString("de-DE",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}}},xe={class:"order-card"},Ce={class:"order-header"},Be={class:"order-details"},Ae={class:"detail-item"},Fe={class:"detail-value"},Ue={class:"detail-item"},Se={class:"detail-value"},Ne={class:"detail-item"},Oe={class:"detail-value"},De={class:"detail-item"},$e={class:"detail-value"};function Me(g,v,i,x,T,U){return a(),n("div",xe,[e("div",Ce,[e("h5",null,"Bestellung ID: "+c(i.order.id),1),e("span",{class:j(["status",i.order.orderStatus])},c(i.order.orderStatus),3)]),e("div",Be,[e("p",Ae,[v[0]||(v[0]=e("span",{class:"detail-label"},"Vorname:",-1)),e("span",Fe,c(i.order.user.firstName),1)]),e("p",Ue,[v[1]||(v[1]=e("span",{class:"detail-label"},"Nachname:",-1)),e("span",Se,c(i.order.user.lastName),1)]),e("p",Ne,[v[2]||(v[2]=e("span",{class:"detail-label"},"Gesamtbetrag:",-1)),e("span",Oe,c(U.formatCurrency(i.order.totalAmount)),1)]),e("p",De,[v[3]||(v[3]=e("span",{class:"detail-label"},"Bestellt am:",-1)),e("span",$e,c(U.formatDate(i.order.createdAt)),1)])])])}const Pe=G(we,[["render",Me],["__scopeId","data-v-d32d16e4"]]),Ve={class:"admin-dashboard"},Ee={class:"header"},Le={key:0,class:"welcome-message"},Te={class:"stats-row"},Ke={class:"stat-card"},ze={class:"stat-card"},Ie={class:"stat-card orders-card"},Je={class:"orders-stats"},Re={class:"orders-stat"},je={class:"stat-value"},Ge={class:"orders-stat"},Qe={class:"stat-value"},We={class:"orders-stat"},qe={class:"stat-value"},He={class:"navigation mb-4"},Xe=["onClick"],Ye={key:0},Ze={class:"search-section mb-4"},et={key:0,class:"text-center"},tt={key:1,class:"text-center"},st={key:2},rt={class:"row row-cols-lg-4"},at={class:"text-center mb-5 cardset-admin-button"},nt=["onClick"],lt=["onClick"],ot={key:0,class:"text-center mt-4"},it={key:1,class:"text-center mt-4"},ut={key:1},dt={class:"search-section mb-4"},ct={key:0,class:"text-center"},vt={key:1,class:"text-center"},mt={key:2},ht={class:"row row-cols-lg-4"},bt={class:"text-center mb-5 cardset-admin-button"},gt=["onClick"],ft=["onClick"],_t={key:0,class:"text-center mt-4"},kt={key:1,class:"text-center mt-4"},pt={key:2},yt={class:"search-section mb-4"},wt={key:0,class:"text-center"},xt={key:1,class:"text-center"},Ct={key:2},Bt={class:"row row-cols-lg-4"},At={class:"text-center mb-5 cardset-admin-button"},Ft=["onClick"],Ut={key:0,class:"text-center mt-4"},St={key:1,class:"text-center mt-4"},Nt={key:3,class:"text-center"},R=8,Ot={__name:"AdminDashboard",setup(g){const v=d("articles"),i=me(),x=ue(),T=d([{key:"articles",name:"Artikel verwalten"},{key:"users",name:"User verwalten"},{key:"orders",name:"Bestellungen verwalten"},{key:"messages",name:"Nachrichten verwalten"}]),U=de(()=>!x.user||!x.user.firstName||!x.user.lastName?null:`${x.user.firstName} ${x.user.lastName}`),m=d({articles:!1,users:!1,orders:!1}),p=d([]),Q=d([]),C=d(""),D=d({categories:[],price:0,rating:0,page:1,size:8}),S=d(1),h=d({articles:!0,users:!0,orders:!0}),K=async({query:r=C.value,filters:t=D.value}={})=>{var l,k;r!==C.value&&(C.value=r.trim(),S.value=1,p.value=[],h.value.articles=!0),t&&JSON.stringify(t)!==JSON.stringify(D.value)&&(D.value={...t},S.value=1),m.value.articles=!0;const s=t.categories&&t.categories.length>0?t.categories.join(","):void 0,u=(o=>o&&o!==0?o:void 0)(parseFloat(t.price));try{const o=await y.get("/api/product",{params:{search:r||void 0,categories:s,price:u,rating:t.rating||void 0,page:S.value,size:R}});S.value===1?p.value=o.data.products:p.value.push(...o.data.products),h.value.articles=o.data.hasMore}catch(o){console.error("Fehler beim Laden der Artikel:",o),await b.fire({title:"Fehler beim Laden der Artikel!",text:((k=(l=o.response)==null?void 0:l.data)==null?void 0:k.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}finally{m.value.articles=!1}},H=async()=>{h.value.articles&&(S.value++,await K({query:C.value,filters:D.value}))},X=()=>{i.push({name:"CreateArticle"})},Y=()=>{i.push({name:"CreateCategory"})},Z=()=>{i.push({name:"EditCategory"})},ee=r=>{i.push({name:"EditArticle",params:{id:r.id}})},te=async r=>{var s,u;if((await b.fire({title:"Produkt entfernen?",text:"Möchten Sie dieses Produkt wirklich entfernen? Dieser Vorgang kann im nachhinein über die Produkte Bearbeitungsseite rückgängig gemacht werden.",icon:"warning",showCancelButton:!0,confirmButtonText:"Ja, entfernen",cancelButtonText:"Abbrechen"})).isConfirmed)try{await y.patch(`/api/product/${r}`,{isDeleted:!0});const l=p.value.find(k=>k.id===r);l&&(l.isDeleted=!0),await b.fire({title:"Gelöscht",text:"Das Produkt wurde erfolgreich entfernt.",icon:"success",confirmButtonText:"OK"})}catch(l){console.error("Fehler beim Löschen des Produkts:",l),await b.fire({title:"Fehler beim Löschen des Produkts!",text:((u=(s=l.response)==null?void 0:s.data)==null?void 0:u.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}},_=d([]),W=d([]),B=d(""),$=d({role:"",page:1,size:8}),N=d(1),z=async({query:r=B.value,filters:t=$.value}={})=>{var s,u;r!==B.value&&(B.value=r.trim(),N.value=1,_.value=[],h.value.users=!0),t&&JSON.stringify(t)!==JSON.stringify($.value)&&($.value={...t},N.value=1),m.value.users=!0;try{const l=await y.get("/api/user",{params:{search:r||void 0,role:t.role||void 0,page:N.value,size:R}});N.value===1?_.value=l.data.users:_.value.push(...l.data.users),h.value.users=l.data.hasMore}catch(l){console.error("Fehler beim Laden der User:",l),await b.fire({title:"Fehler beim Laden der User!",text:((u=(s=l.response)==null?void 0:s.data)==null?void 0:u.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}finally{m.value.users=!1}},se=async()=>{h.value.users&&(N.value++,await z({query:B.value,filters:$.value}))},re=r=>{i.push({name:"AdminEditUser",params:{id:r.id}})},ae=async r=>{var s,u;if((await b.fire({title:"User löschen?",text:"Möchten Sie diesen User wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.",icon:"warning",showCancelButton:!0,confirmButtonText:"Ja, löschen",cancelButtonText:"Abbrechen"})).isConfirmed)try{await y.delete(`/api/user/${r}`);const l=_.value.findIndex(k=>k.id===r);l!==-1&&(_.value.splice(l,1),await b.fire({title:"User erfolgreich gelöscht!",icon:"success",showConfirmButton:!1,timer:2e3,timerProgressBar:!0}))}catch(l){console.error("Fehler beim Löschen des Users:",l),await b.fire({title:"Fehler beim Löschen des Users!",text:((u=(s=l.response)==null?void 0:s.data)==null?void 0:u.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}},w=d([]),M=d([]),A=d(""),P=d({status:"",page:1,size:8}),O=d(1),I=async({query:r=A.value,filters:t=P.value}={})=>{var s,u;r!==A.value&&(A.value=r.trim(),O.value=1,w.value=[],h.value.orders=!0),t&&JSON.stringify(t)!==JSON.stringify(P.value)&&(P.value={...t},O.value=1),m.value.orders=!0;try{const l=await y.get("/api/order",{params:{search:r||void 0,status:t.status||void 0,page:O.value,size:R}});O.value===1?w.value=l.data.orders:w.value.push(...l.data.orders),h.value.orders=l.data.hasMore}catch(l){console.error("Fehler beim Laden der Bestellungen:",l),await b.fire({title:"Fehler beim Laden der Bestellungen!",text:((u=(s=l.response)==null?void 0:s.data)==null?void 0:u.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}finally{m.value.orders=!1}},ne=async()=>{h.value.orders&&(O.value++,await I({query:A.value,filters:P.value}))},le=r=>{i.push({name:"ViewOrder",params:{id:r}})},oe=async()=>{var r,t,s,u,l,k;try{const o=await y.get("/api/product/count");Q.value=o.data}catch(o){console.error("Fehler beim Abrufen der Artikel Metadaten:",o.message),await b.fire({title:"Fehler beim Abrufen der Artikel Metadaten!",text:((t=(r=o.response)==null?void 0:r.data)==null?void 0:t.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}try{const o=await y.get("/api/user/count");W.value=o.data}catch(o){console.error("Fehler beim Abrufen der User Metadaten:",o.message),await b.fire({title:"Fehler beim Abrufen der User Metadaten!",text:((u=(s=o.response)==null?void 0:s.data)==null?void 0:u.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}try{const o=await y.get("/api/order/count");M.value=o.data}catch(o){console.error("Fehler beim Abrufen der Bestellungs Metadaten:",o.message),await b.fire({title:"Fehler beim Abrufen der Bestellungs Metadaten!",text:((k=(l=o.response)==null?void 0:l.data)==null?void 0:k.error)||"Ein unbekannter Fehler ist aufgetreten.",icon:"error",confirmButtonText:"OK"})}},q=r=>{switch(r){case"articles":K();break;case"users":z();break;case"orders":I();break;case"messages":i.push({name:"Message"});break}},ie=r=>{v.value=r,r!=="messages"&&localStorage.setItem("adminDashboardPanel",r),q(r)};return ce(()=>{const r=localStorage.getItem("adminDashboardPanel");r&&T.value.some(t=>t.key===r)&&(v.value=r),q(v.value),oe()}),(r,t)=>(a(),n("div",Ve,[e("div",Ee,[t[9]||(t[9]=e("h1",{class:"text-center admin-title"},"Admin Dashboard",-1)),U.value?(a(),n("h2",Le," Willkommen zurück, "+c(U.value)+"! ",1)):f("",!0),e("div",Te,[e("div",Ke,[t[3]||(t[3]=e("h3",null,"Artikel",-1)),e("h3",null,c(Q.value||0),1)]),e("div",ze,[t[4]||(t[4]=e("h3",null,"User",-1)),e("h3",null,c(W.value||0),1)]),e("div",Ie,[t[8]||(t[8]=e("h3",null,"Bestellungen",-1)),e("div",Je,[e("div",Re,[t[5]||(t[5]=e("span",{class:"stat-label"},"Gesamt:",-1)),e("span",je,c(M.value.total||0),1)]),e("div",Ge,[t[6]||(t[6]=e("span",{class:"stat-label"},"Abgeschlossen:",-1)),e("span",Qe,c(M.value.finished||0),1)]),e("div",We,[t[7]||(t[7]=e("span",{class:"stat-label"},"Offen:",-1)),e("span",qe,c(M.value.active||0),1)])])])])]),e("div",He,[(a(!0),n(V,null,E(T.value,s=>(a(),n("button",{key:s.key,onClick:u=>ie(s.key),class:j(["btn navigation-btn",v.value===s.key?"btn-active":"btn-outline"])},[e("i",{class:j([{"bi bi-box-seam":s.key==="articles","bi bi-people":s.key==="users","bi bi-cart":s.key==="orders","bi bi-chat-left-text":s.key==="messages"},"me-2"])},null,2),L(" "+c(s.name),1)],10,Xe))),128))]),v.value==="articles"?(a(),n("div",Ye,[e("div",Ze,[F(J,{modelValue:C.value,"onUpdate:modelValue":t[0]||(t[0]=s=>C.value=s),onSearch:K,placeholder:"Artikel suchen...",showFilter:!0},null,8,["modelValue"])]),e("div",{class:"text-center mt-4 mb-4",style:{display:"flex","justify-content":"center",gap:"10px"}},[e("button",{onClick:X,class:"btn btn-primary",style:{width:"100%"}}," Neuen Artikel erstellen "),e("button",{onClick:Y,class:"btn btn-primary",style:{width:"100%"}}," Neue Kategorien erstellen "),e("button",{onClick:Z,class:"btn btn-primary",style:{width:"100%"}}," Kategorien bearbeiten ")]),m.value.articles&&p.value.length===0?(a(),n("div",et,t[10]||(t[10]=[e("p",null,"Lade Artikel...",-1)]))):f("",!0),!m.value.articles&&p.value.length===0?(a(),n("div",tt,t[11]||(t[11]=[e("p",null,"Keine Produkte gefunden.",-1)]))):(a(),n("div",st,[e("div",rt,[(a(!0),n(V,null,E(p.value,s=>(a(),n("div",{key:s.id,class:"col mb-4"},[e("div",null,[F(ve,{product:s},null,8,["product"])]),e("div",at,[e("button",{onClick:u=>ee(s),class:"btn btn-warning"},"Bearbeiten",8,nt),s.isDeleted?f("",!0):(a(),n("button",{key:0,onClick:u=>te(s.id),class:"btn btn-danger"}," Löschen ",8,lt))])]))),128))]),h.value.articles&&!m.value.articles?(a(),n("div",ot,[e("button",{onClick:H,class:"btn btn-secondary"},"Mehr Tees")])):f("",!0),!h.value.articles&&p.value.length>0?(a(),n("div",it,t[12]||(t[12]=[e("p",null,"Keine weiteren Tees verfügbar.",-1)]))):f("",!0)]))])):v.value==="users"?(a(),n("div",ut,[e("div",dt,[F(J,{modelValue:B.value,"onUpdate:modelValue":t[1]||(t[1]=s=>B.value=s),onSearch:z,placeholder:"User suchen...",showFilter:!1},null,8,["modelValue"])]),m.value.users&&_.value.length===0?(a(),n("div",ct,t[13]||(t[13]=[e("p",null,"Lade User...",-1)]))):f("",!0),!m.value.users&&_.value.length===0?(a(),n("div",vt,t[14]||(t[14]=[e("p",null,"Keine User gefunden.",-1)]))):(a(),n("div",mt,[e("div",ht,[(a(!0),n(V,null,E(_.value,s=>(a(),n("div",{key:s.id,class:"col mb-4"},[e("div",null,[F(ye,{user:s},null,8,["user"])]),e("div",bt,[e("button",{onClick:u=>re(s),class:"btn btn-warning"},"Bearbeiten",8,gt),e("button",{onClick:u=>ae(s.id),class:"btn btn-danger"},"Entfernen",8,ft)])]))),128))]),h.value.users&&!m.value.users?(a(),n("div",_t,[e("button",{onClick:se,class:"btn btn-secondary"},"Mehr User")])):f("",!0),!h.value.users&&_.value.length>0?(a(),n("div",kt,t[15]||(t[15]=[e("p",null,"Keine weiteren User verfügbar.",-1)]))):f("",!0)]))])):v.value==="orders"?(a(),n("div",pt,[e("div",yt,[F(J,{modelValue:A.value,"onUpdate:modelValue":t[2]||(t[2]=s=>A.value=s),onSearch:I,placeholder:"Suche nach ID, Status oder Name",showFilter:!1},null,8,["modelValue"])]),m.value.orders&&w.value.length===0?(a(),n("div",wt,t[16]||(t[16]=[e("p",null,"Lade Bestellungen...",-1)]))):f("",!0),!m.value.orders&&w.value.length===0?(a(),n("div",xt,t[17]||(t[17]=[e("p",null,"Keine Bestellungen gefunden.",-1)]))):(a(),n("div",Ct,[e("div",Bt,[(a(!0),n(V,null,E(w.value,s=>(a(),n("div",{key:s.id,class:"col mb-4"},[e("div",null,[F(Pe,{order:s},null,8,["order"])]),e("div",At,[e("button",{onClick:u=>le(s.id),class:"btn btn-warning"},"Details",8,Ft)])]))),128))]),h.value.orders&&!m.value.orders?(a(),n("div",Ut,[e("button",{onClick:ne,class:"btn btn-secondary"},"Mehr Bestellungen")])):f("",!0),!h.value.orders&&w.value.length>0?(a(),n("div",St,t[18]||(t[18]=[e("p",null,"Keine weiteren Bestellungen verfügbar.",-1)]))):f("",!0)]))])):(a(),n("div",Nt,t[19]||(t[19]=[e("p",null,"Bitte wählen Sie einen Verwaltungsbereich aus.",-1)])))]))}},$t=G(Ot,[["__scopeId","data-v-b86bb6b1"]]);export{$t as default};
