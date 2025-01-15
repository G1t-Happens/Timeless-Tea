import{_ as K,r as k,k as d,c as o,f as q,a as e,d as u,b as I,v as M,t as n,F as v,m as S,p as L,o as i,e as a}from "./index-S2dVXRzt.js";import{B as T}from "./BackButton-CpLP0EiE.js";const z={class:"order-page"},G={key:0,class:"loading"},H={key:1},Q={class:"search-container"},U={class:"orders-container"},j={class:"active-orders"},J={class:"pagination pagination-left"},R=["disabled"],W=["disabled"],X={key:0,class:"empty"},Y={key:1,class:"order-list"},Z={class:"order-header"},tt={class:"order-id"},et={class:"order-status"},st={class:"order-total"},nt={class:"order-date"},lt={class:"order-details-text"},ot={key:0},it={key:2},at={class:"order-details-text"},rt={key:0,class:"order-products"},dt={class:"product-list-container"},ut={class:"product-list"},pt=["href"],ct=["src","alt"],gt={class:"product-info"},vt={class:"product-name"},mt={class:"product-quantity"},yt={class:"order-actions"},ht=["onClick"],ft={class:"order-history"},_t={class:"pagination pagination-right"},kt=["disabled"],bt=["disabled"],Bt={key:0,class:"empty"},Ot={key:1,class:"order-list"},xt={class:"order-header"},St={class:"order-id"},Dt={class:"order-status"},Pt={class:"order-total"},At={class:"order-date"},Ct={class:"order-details-text"},Lt={key:0},Nt={key:2},wt={class:"order-details-text"},Vt={key:0,class:"order-products"},Ft={class:"product-list-container"},$t={class:"product-list"},Et=["href"],Kt=["src","alt"],qt={class:"product-info"},It={class:"product-name"},Mt={class:"product-quantity"},m=5,Tt={__name:"OrderDetail",setup(zt){const D=k([]),b=k(!1),p=k(""),c=k(1),g=k(1),N=async()=>{b.value=!0;try{const{data:l}=await L.get("/api/order/detail");D.value=l}catch(l){console.error("Error loading orders:",l),alert("Failed to load orders.")}finally{b.value=!1}},C=d(()=>[...D.value].sort((l, t)=>t.updatedAt-l.updatedAt)),w=d(()=>C.value.filter(l=>["open","processing"].includes(l.orderStatus))),V=d(()=>C.value.filter(l=>["failed","successful","refunded","canceled"].includes(l.orderStatus))),P=d(()=>w.value.filter(l=>l.id.toString().includes(p.value)||l.orderProducts.some(t=>t.product.name.toLowerCase().includes(p.value.toLowerCase())))),A=d(()=>V.value.filter(l=>l.id.toString().includes(p.value)||l.orderProducts.some(t=>t.product.name.toLowerCase().includes(p.value.toLowerCase())))),F=d(()=>{const l=(c.value-1)*m,t=l+m;return P.value.slice(l,t)}),$=d(()=>{const l=(g.value-1)*m,t=l+m;return A.value.slice(l,t)}),B=d(()=>Math.ceil(P.value.length/m)),O=d(()=>Math.ceil(A.value.length/m)),x= l=>new Date(l).toLocaleDateString("de-DE"),E=async l=>{try{const t=D.value.find(s=>s.id===l);if(!t){alert("Bestellung nicht gefunden.");return}if(!["open","processing"].includes(t.orderStatus)){alert("Nur offene oder in Bearbeitung befindliche Bestellungen können storniert werden.");return}await L.patch(`/api/order/${l}/cancel`),t.orderStatus="canceled",alert("Die Bestellung wurde erfolgreich storniert.")}catch(t){console.error("Fehler beim Stornieren der Bestellung:",t),alert("Die Bestellung konnte nicht storniert werden.")}};return N(),(l, t)=>(i(),o("div",z,[q(T),t[36]||(t[36]=e("h2",{class:"page-title form-label"},"Meine Bestellungen",-1)),b.value?(i(),o("div",G,t[5]||(t[5]=[e("p",null,"Loading orders...",-1)]))):u("",!0),b.value?u("",!0):(i(),o("div",H,[e("div",Q,[I(e("input",{"onUpdate:modelValue":t[0]||(t[0]= s=>p.value=s),type:"text",placeholder:"Suche nach Bestellungen...",class:"search-input"},null,512),[[M,p.value]])]),e("div",U,[e("section",j,[t[20]||(t[20]=e("h3",{class:"section-title"},"Aktive Bestellungen",-1)),e("div",J,[e("button",{disabled:c.value===1||B.value===0,onClick:t[1]||(t[1]= s=>c.value--)}," Vorherige ",8,R),e("span",null,"Seite "+n(c.value)+" von "+n(B.value),1),e("button",{disabled:c.value===B.value||B.value===0,onClick:t[2]||(t[2]= s=>c.value++)}," Nächste ",8,W)]),P.value.length===0?(i(),o("div",X,t[6]||(t[6]=[e("p",null,"Keine aktiven Bestellungen vorhanden.",-1)]))):(i(),o("div",Y,[(i(!0),o(v,null,S(F.value, s=>{var y,h,f,_;return i(),o("div",{key:s.id,class:"order-item"},[e("div",Z,[e("p",tt,[t[7]||(t[7]=e("strong",null,"Order ID:",-1)),a(" "+n(s.id),1)]),e("p",et,[t[8]||(t[8]=e("strong",null,"Status:",-1)),a(" "+n(s.orderStatus),1)]),e("p",st,[t[9]||(t[9]=e("strong",null,"Gesamt:",-1)),a(" €"+n(s.totalAmount.toFixed(2)),1)]),e("p",nt,[t[10]||(t[10]=e("strong",null,"Bestellt am:",-1)),a(" "+n(x(s.createdAt)),1)])]),e("div",lt,[e("p",null,[t[11]||(t[11]=e("strong",null,"Bezahlmethode:",-1)),a(" "+n(((y=s.payment)==null?void 0:y.paymentOption)||"Keine Angaben"),1)]),((h=s.payment)==null?void 0:h.paymentOption)==="bank transfer"?(i(),o("p",ot,[t[12]||(t[12]=e("strong",null,"IBAN:",-1)),a(" "+n(s.payment.iban),1)])):((f=s.payment)==null?void 0:f.paymentOption)==="credit card"?(i(),o(v,{key:1},[e("p",null,[t[13]||(t[13]=e("strong",null,"Kreditkartennummer:",-1)),a(" "+n(s.payment.creditCardNumber),1)]),e("p",null,[t[14]||(t[14]=e("strong",null,"Ablaufdatum:",-1)),a(" "+n(s.payment.expiryDate),1)])],64)):((_=s.payment)==null?void 0:_.paymentOption)==="paypal"?(i(),o("p",it,[t[15]||(t[15]=e("strong",null,"PayPal Email:",-1)),a(" "+n(s.payment.paypalEmail),1)])):u("",!0)]),e("div",at,[e("p",null,[t[16]||(t[16]=e("strong",null,"Lieferstatus:",-1)),a(" "+n(s.shipping.deliveryStatus),1)]),e("p",null,[t[17]||(t[17]=e("strong",null,"Lieferadresse:",-1)),a(" "+n(s.shipping.address.street)+" "+n(s.shipping.address.houseNumber)+", "+n(s.shipping.address.city)+", "+n(s.shipping.address.postalCode),1)]),e("p",null,[t[18]||(t[18]=e("strong",null,"Voraussichtliche Lieferung:",-1)),a(" "+n(x(s.shipping.estimatedDeliveryDate)),1)])]),s.orderProducts.length>0?(i(),o("div",rt,[t[19]||(t[19]=e("p",{class:"products-header"},[e("strong",null,"Produkte:")],-1)),e("div",dt,[e("ul",ut,[(i(!0),o(v,null,S(s.orderProducts, r=>(i(),o("li",{key:r.id,class:"product-item"},[e("a",{href:`/product/${r.product.id}`,class:"product-link"},[e("img",{src:r.product.image,alt:r.product.name,class:"product-image"},null,8,ct),e("div",gt,[e("p",vt,n(r.product.name),1),e("p",mt,n(r.quantity)+"x (€"+n(r.product.price.toFixed(2))+") ",1)])],8,pt)]))),128))])])])):u("",!0),e("div",yt,[s.orderStatus!=="cancel"?(i(),o("button",{key:0,class:"cancel-button",onClick: r=>E(s.id)}," Bestellung stornieren ",8,ht)):u("",!0)])])}),128))]))]),e("section",ft,[t[35]||(t[35]=e("h3",{class:"section-title"},"Bestellhistorie",-1)),e("div",_t,[e("button",{disabled:g.value===1||O.value===0,onClick:t[3]||(t[3]= s=>g.value--)}," Vorherige ",8,kt),e("span",null,"Seite "+n(g.value)+" von "+n(O.value),1),e("button",{disabled:g.value===O.value||O.value===0,onClick:t[4]||(t[4]= s=>g.value++)}," Nächste ",8,bt)]),A.value.length===0?(i(),o("div",Bt,t[21]||(t[21]=[e("p",null,"Keine abgeschlossenen Bestellungen vorhanden.",-1)]))):(i(),o("div",Ot,[(i(!0),o(v,null,S($.value, s=>{var y,h,f,_;return i(),o("div",{key:s.id,class:"order-item"},[e("div",xt,[e("p",St,[t[22]||(t[22]=e("strong",null,"Order ID:",-1)),a(" "+n(s.id),1)]),e("p",Dt,[t[23]||(t[23]=e("strong",null,"Status:",-1)),a(" "+n(s.orderStatus),1)]),e("p",Pt,[t[24]||(t[24]=e("strong",null,"Gesamt:",-1)),a(" €"+n(s.totalAmount.toFixed(2)),1)]),e("p",At,[t[25]||(t[25]=e("strong",null,"Bestellt am:",-1)),a(" "+n(x(s.createdAt)),1)])]),e("div",Ct,[e("p",null,[t[26]||(t[26]=e("strong",null,"Bezahlmethode:",-1)),a(" "+n(((y=s.payment)==null?void 0:y.paymentOption)||"Keine Angaben"),1)]),((h=s.payment)==null?void 0:h.paymentOption)==="bank transfer"?(i(),o("p",Lt,[t[27]||(t[27]=e("strong",null,"IBAN:",-1)),a(" "+n(s.payment.iban),1)])):((f=s.payment)==null?void 0:f.paymentOption)==="credit card"?(i(),o(v,{key:1},[e("p",null,[t[28]||(t[28]=e("strong",null,"Kreditkartennummer:",-1)),a(" "+n(s.payment.creditCardNumber),1)]),e("p",null,[t[29]||(t[29]=e("strong",null,"Ablaufdatum:",-1)),a(" "+n(s.payment.expiryDate),1)])],64)):((_=s.payment)==null?void 0:_.paymentOption)==="paypal"?(i(),o("p",Nt,[t[30]||(t[30]=e("strong",null,"PayPal Email:",-1)),a(" "+n(s.payment.paypalEmail),1)])):u("",!0)]),e("div",wt,[e("p",null,[t[31]||(t[31]=e("strong",null,"Lieferstatus:",-1)),a(" "+n(s.shipping.deliveryStatus),1)]),e("p",null,[t[32]||(t[32]=e("strong",null,"Lieferadresse:",-1)),a(" "+n(s.shipping.address.street)+" "+n(s.shipping.address.houseNumber)+", "+n(s.shipping.address.city)+", "+n(s.shipping.address.postalCode),1)]),e("p",null,[t[33]||(t[33]=e("strong",null,"Voraussichtliche Lieferung:",-1)),a(" "+n(x(s.shipping.estimatedDeliveryDate)),1)])]),s.orderProducts.length>0?(i(),o("div",Vt,[t[34]||(t[34]=e("p",{class:"products-header"},[e("strong",null,"Produkte:")],-1)),e("div",Ft,[e("ul",$t,[(i(!0),o(v,null,S(s.orderProducts, r=>(i(),o("li",{key:r.id,class:"product-item"},[e("a",{href:`/product/${r.product.id}`,class:"product-link"},[e("img",{src:r.product.image,alt:r.product.name,class:"product-image"},null,8,Kt),e("div",qt,[e("p",It,n(r.product.name),1),e("p",Mt,n(r.quantity)+"x (€"+n(r.product.price.toFixed(2))+") ",1)])],8,Et)]))),128))])])])):u("",!0)])}),128))]))])])]))]))}},Qt=K(Tt,[["__scopeId","data-v-778d3f57"]]);export{Qt as default};
