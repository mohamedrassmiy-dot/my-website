(function(){
  'use strict';
  function send(eventName,data){
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(Object.assign({event:eventName,page_path:location.pathname},data||{}));
  }
  function classify(href){
    if(/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href))return 'whatsapp';
    if(/^mailto:/i.test(href))return 'email';
    if(/^tel:/i.test(href))return 'phone';
    return '';
  }
  document.addEventListener('click',function(evt){
    const target=evt.target&&evt.target.closest?evt.target.closest('a[href]'):null;
    if(!target)return;
    const raw=target.getAttribute('href')||'';
    const method=classify(raw);
    if(method){send('rassmiy_contact_method_click',{contact_method:method});return;}
    let dest;
    try{dest=new URL(raw,location.origin);}catch(_){return;}
    if(dest.origin!==location.origin)return;
    if(!/^\/(ar|en)\/contact\.html$/.test(dest.pathname))return;
    if(!dest.searchParams.has('from'))dest.searchParams.set('from',location.pathname.slice(0,160));
    const source=new URLSearchParams(location.search);
    for(const key of ['utm_source','utm_medium','utm_campaign']){
      const v=source.get(key);
      if(v&&!dest.searchParams.has(key))dest.searchParams.set(key,v.slice(0,70));
    }
    target.href=dest.pathname+dest.search+dest.hash;
  },true);
  const form=document.querySelector('form[data-rassmiy-lead-form="1"]');
  if(!form)return;
  const email=form.querySelector('input[name="email"]');
  const phone=form.querySelector('input[name="phone"]');
  const alert=document.getElementById('rassmiy-contact-check');
  const urlField=form.querySelector('input[name="page_url"]');
  const query=new URLSearchParams(location.search);
  const from=query.get('from')||'';
  if(urlField&&from.startsWith('/')&&from.length<=160&&/^\/(ar|en)\//.test(from)&&!from.includes('?')&&!from.includes('#')){
    const current=urlField.value||location.pathname;
    const separator=current.includes('?')?'&':'?';
    urlField.value=(current+separator+'from='+encodeURIComponent(from)).slice(0,450);
  }
  function clearError(){
    if(alert){alert.hidden=true;alert.textContent='';}
    if(email&&email.setCustomValidity)email.setCustomValidity('');
    if(phone&&phone.setCustomValidity)phone.setCustomValidity('');
  }
  if(email)email.addEventListener('input',clearError);
  if(phone)phone.addEventListener('input',clearError);
  form.addEventListener('submit',function(event){
    const emailText=email?email.value.trim():'';
    const digits=phone?(phone.value||'').replace(/\D/g,''):'';
    if(emailText||digits.length>=8){clearError();return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    const ar=(document.documentElement.lang||'ar').toLowerCase().startsWith('ar');
    if(alert){
      alert.hidden=false;
      alert.textContent=ar?'أدخل بريدًا إلكترونيًا أو رقم هاتف صالحًا حتى نتمكن من الرد على طلبك.':'Enter an email address or a valid phone number so we can respond.';
    }
    send('rassmiy_lead_validation_error',{reason:'missing_contact_method'});
    if(email&&email.focus)email.focus();
  },true);
})();