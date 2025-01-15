import{_ as y,r as c,c as i,a as t,b as o,v,n as u,t as m,d as n,s as S,e as p,f as k,g as _,w as x,h as N,o as r,p as j}from"./index-BQPN_HOS.js";const B={class:"contact-form"},I={class:"form-group"},V={key:0,class:"error-message"},M={class:"form-group"},w={key:0,class:"error-message"},C={class:"form-group"},z={key:0,class:"error-message"},D={class:"form-group"},F={key:0,class:"error-message"},U={class:"form-group checkbox-group"},E={for:"privacy"},A={key:0,class:"error-message"},T=["disabled"],W={key:0,class:"success-message"},K={__name:"ContactForm",setup(O){const a=c({name:"",email:"",subject:"",message:"",privacy:!1}),s=c({}),g=c(""),b=()=>(s.value={},a.value.name||(s.value.name="Bitte geben Sie Ihren Namen ein."),a.value.email?/\S+@\S+\.\S+/.test(a.value.email)||(s.value.email="Bitte geben Sie eine gültige E-Mail-Adresse ein."):s.value.email="Bitte geben Sie Ihre E-Mail-Adresse ein.",a.value.subject||(s.value.subject="Bitte geben Sie einen Betreff ein."),a.value.message||(s.value.message="Bitte geben Sie eine Nachricht ein."),a.value.privacy||(s.value.privacy="Sie müssen den Datenschutzbestimmungen zustimmen."),Object.keys(s.value).length===0),h=async()=>{var d;if(b())try{await j.post("/api/message",a.value),g.value="Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.",a.value={name:"",email:"",subject:"",message:"",privacy:!1},s.value={}}catch(e){console.error("Fehler beim Senden der Nachricht:",((d=e.response)==null?void 0:d.data)||e.message),s.value.server="Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut."}};return(d,e)=>{const f=N("router-link");return r(),i("div",B,[e[12]||(e[12]=t("h1",null,"Kontaktformular",-1)),e[13]||(e[13]=t("p",null,"Wenn Sie Fragen haben oder Unterstützung benötigen, senden Sie uns bitte eine Nachricht.",-1)),t("form",{onSubmit:x(h,["prevent"]),class:"form"},[t("div",I,[e[5]||(e[5]=t("label",{for:"name"},"Ihr Name",-1)),o(t("input",{id:"name",type:"text","onUpdate:modelValue":e[0]||(e[0]=l=>a.value.name=l),class:u({"is-invalid":s.value.name}),placeholder:"Max Mustermann"},null,2),[[v,a.value.name]]),s.value.name?(r(),i("span",V,m(s.value.name),1)):n("",!0)]),t("div",M,[e[6]||(e[6]=t("label",{for:"email"},"Ihre E-Mail-Adresse",-1)),o(t("input",{id:"email",type:"email","onUpdate:modelValue":e[1]||(e[1]=l=>a.value.email=l),class:u({"is-invalid":s.value.email}),placeholder:"max@beispiel.de"},null,2),[[v,a.value.email]]),s.value.email?(r(),i("span",w,m(s.value.email),1)):n("",!0)]),t("div",C,[e[7]||(e[7]=t("label",{for:"subject"},"Betreff",-1)),o(t("input",{id:"subject",type:"text","onUpdate:modelValue":e[2]||(e[2]=l=>a.value.subject=l),class:u({"is-invalid":s.value.subject}),placeholder:"Worum geht es?"},null,2),[[v,a.value.subject]]),s.value.subject?(r(),i("span",z,m(s.value.subject),1)):n("",!0)]),t("div",D,[e[8]||(e[8]=t("label",{for:"message"},"Ihre Nachricht",-1)),o(t("textarea",{id:"message","onUpdate:modelValue":e[3]||(e[3]=l=>a.value.message=l),class:u({"is-invalid":s.value.message}),rows:"5",placeholder:"Schreiben Sie hier Ihre Nachricht..."},null,2),[[v,a.value.message]]),s.value.message?(r(),i("span",F,m(s.value.message),1)):n("",!0)]),t("div",U,[o(t("input",{id:"privacy",type:"checkbox","onUpdate:modelValue":e[4]||(e[4]=l=>a.value.privacy=l),class:u({"is-invalid":s.value.privacy})},null,2),[[S,a.value.privacy]]),t("label",E,[e[10]||(e[10]=p(" Ich stimme den ")),k(f,{to:"/privacy"},{default:_(()=>e[9]||(e[9]=[p("Datenschutzbestimmungen")])),_:1}),e[11]||(e[11]=p(" zu. "))]),s.value.privacy?(r(),i("span",A,m(s.value.privacy),1)):n("",!0)]),t("button",{type:"submit",class:"btn-submit",disabled:!a.value.privacy},"Nachricht senden",8,T)],32),g.value?(r(),i("p",W," Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. ")):n("",!0)])}}},q=y(K,[["__scopeId","data-v-6079192d"]]);export{q as default};
