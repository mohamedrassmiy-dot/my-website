(function(){
  'use strict';
  const form=document.querySelector('form[data-rassmiy-lead-form="1"]');
  if(!form)return;
  const ar=(document.documentElement.lang||'ar').toLowerCase().startsWith('ar');
  const labels={
    'marketing-company':['شركة تسويق في الرياض','Marketing company in Riyadh'],
    'marketing-services':['خدمات التسويق الإلكتروني','Digital marketing services'],
    'marketing-agency':['وكالة تسويق رقمي','Digital marketing agency'],
    'b2b-leads':['توليد العملاء المحتملين للشركات','B2B lead generation'],
    'seo-aeo':['استشارات SEO','SEO consulting'],
    'paid-media':['إدارة الحملات الإعلانية','Paid advertising'],
    'content-copywriting':['التسويق بالمحتوى','Content marketing'],
    'events-activation':['تسويق الفعاليات','Events marketing'],
    'agency':['وكالة تسويق','Marketing agency'],
    'marketing':['التسويق الإلكتروني','Digital marketing'],
    'b2b':['جذب عملاء للشركات','B2B lead generation']
  };
  const params=new URLSearchParams(location.search);
  const requested=params.get('service')||'';
  const service=Object.prototype.hasOwnProperty.call(labels,requested)?requested:'';
  const label=service?labels[service][ar?0:1]:'';
  const banner=document.getElementById('rassmiy-service-choice');
  if(service&&banner){
    banner.hidden=false;
    banner.textContent=(ar?'الخدمة التي اخترتها: ':'Requested service: ')+label;
  }
  const source=form.querySelector('input[name="source"]');
  if(source&&service)source.value='website:'+service;
  const urlField=form.querySelector('input[name="page_url"]');
  if(urlField){
    const attribution=new URLSearchParams();
    for(const key of ['utm_source','utm_medium','utm_campaign']){
      const v=params.get(key);
      if(v)attribution.set(key,v.slice(0,100));
    }
    urlField.value=location.pathname+(attribution.toString()?'?'+attribution.toString():'');
  }
  const message=form.querySelector('textarea[name="message"]');
  if(message&&service&&!message.value.trim()){
    message.value=(ar?'أرغب في الاستفسار عن خدمة: ':'I would like to enquire about: ')+label+'\n\n';
  }
  function emit(eventName,detail){
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(Object.assign({event:eventName},detail));
  }
  try{
    if(params.get('sent')==='1'){
      const raw=sessionStorage.getItem('rassmiy_pending_lead_v90');
      sessionStorage.removeItem('rassmiy_pending_lead_v90');
      if(raw){
        const saved=JSON.parse(raw);
        if(saved&&typeof saved.at==='number'&&Date.now()-saved.at<900000&&Date.now()-saved.at>=0){
          emit('generate_lead',{lead_source:'website_form',service_area:saved.service||'unspecified',page_path:location.pathname});
        }
      }
    }
  }catch(_){}
  // A contact request must contain at least one way to reply.
  const email=form.querySelector('input[name="email"]');
  const phone=form.querySelector('input[name="phone"]');
  const feedback=document.getElementById('rassmiy-contact-error');
  form.addEventListener('submit',function(event){
    const replyEmail=email&&email.value?email.value.trim():'';
    const replyPhone=phone&&phone.value?phone.value.trim():'';
    if(!replyEmail&&!replyPhone){
      event.preventDefault();
      if(feedback){
        feedback.hidden=false;
        feedback.textContent=ar?'يرجى إدخال البريد الإلكتروني أو رقم الهاتف حتى أتمكن من الرد على طلبك.':'Please enter an email address or phone number so I can respond to your enquiry.';
      }
      if(email&&typeof email.focus==='function')email.focus();
      return;
    }
    if(feedback){feedback.hidden=true;feedback.textContent='';}
    emit('rassmiy_lead_form_submit_attempt',{service_area:service||'unspecified',page_path:location.pathname});
    try{sessionStorage.setItem('rassmiy_pending_lead_v90',JSON.stringify({service:service||'unspecified',at:Date.now()}));}catch(_){}
  });
})();
