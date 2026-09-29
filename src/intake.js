import {allFields,validateIntake} from '../public/intake-schema.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const enc=new TextEncoder();
const encode=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function key(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function createIntakeToken(secret,id,now=Date.now()){
 if(!secret||!uuid.test(id))throw Error('Invalid invitation');
 const payload=encode(enc.encode(JSON.stringify({v:1,id,exp:Math.floor(now/1000)+30*86400})));
 return payload+'.'+encode(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(payload))));
}
export async function verifyIntakeToken(secret,token,now=Date.now()){
 try{if(!secret||typeof token!=='string'||token.length>600)return null;const [payload,sig,...extra]=token.split('.');if(extra.length||!await crypto.subtle.verify('HMAC',await key(secret),decode(sig),enc.encode(payload)))return null;const data=JSON.parse(new TextDecoder().decode(decode(payload)));return data.v===1&&uuid.test(data.id)&&Number.isInteger(data.exp)&&data.exp>now/1000?data:null;}catch{return null;}
}
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
async function body(request){let size=0;const chunks=[];for await(const part of request.body){size+=part.length;if(size>8*1024*1024)throw Error();chunks.push(part);}const bytes=new Uint8Array(size);let i=0;for(const part of chunks){bytes.set(part,i);i+=part.length;}return JSON.parse(new TextDecoder().decode(bytes));}
export function validateAttachments(files=[]){
 if(!Array.isArray(files)||files.length>3)throw Error('Maximal drei Dateien sind möglich.');let total=0;
 return files.map((file,i)=>{
  if(typeof file?.content!=='string'||file.content.length>7200000||!/^[A-Za-z0-9+/]*={0,2}$/.test(file.content))throw Error('Datei konnte nicht gelesen werden.');
  const raw=atob(file.content);total+=raw.length;if(total>5*1024*1024)throw Error('Bitte insgesamt höchstens 5 MB hochladen.');
  const ext=raw.startsWith('%PDF-')?'pdf':raw.startsWith('\x89PNG\r\n\x1a\n')?'png':raw.startsWith('\xff\xd8\xff')?'jpg':null;
  if(!ext)throw Error('Bitte nur PDF-, JPG- oder PNG-Dateien verwenden.');
  return {filename:`unterlage-${i+1}.${ext}`,content:file.content};
 });
}
export async function handleIntake(request,env,send=fetch){
 if(request.method!=='POST')return json(405,{error:'Bitte den Aufnahmebogen nutzen.'});
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json(403,{error:'Anfrage nicht erlaubt.'});
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json(415,{error:'Ungültiges Format.'});
 let input;try{input=await body(request);}catch{return json(400,{error:'Daten konnten nicht gelesen werden.'});}
 if(!input||typeof input!=='object')return json(400,{error:'Ungültige Anfrage.'});
 const invitation=await verifyIntakeToken(env.INTAKE_SECRET,input.token);if(!invitation)return json(403,{error:'Der persönliche Link ist ungültig oder abgelaufen. Bitte fragen Sie einen neuen Link an.'});
 if(new URL(request.url).pathname==='/api/intake/verify')return json(200,{ok:true});
 if(input.website||input.consent!==true||!uuid.test(input.requestId||'')||!input.data||typeof input.data!=='object'||Array.isArray(input.data))return json(400,{error:'Bitte prüfen Sie die Angaben und bestätigen Sie die Datenschutzhinweise.'});
 let result;try{result=validateIntake(input.data);}catch{return json(400,{error:'Bitte prüfen Sie die Datumsangaben.'});}
 if(Object.keys(result.errors).length)return json(400,{error:'Bitte prüfen Sie Ihre Angaben.',fields:result.errors});
 let attachments;try{attachments=validateAttachments(input.attachments);}catch(error){return json(400,{error:error.message});}
 if(!env.RESEND_API_KEY||!env.INQUIRY_TO||!env.INQUIRY_LIMITER)return json(503,{error:'Der Versand ist gerade nicht verfügbar. Bitte kontaktieren Sie Tobias direkt.'});
 if(!(await env.INQUIRY_LIMITER.limit({key:'intake:'+invitation.id})).success)return json(429,{error:'Bitte warten Sie eine Minute und versuchen Sie es erneut.'});
 const packet={schemaVersion:1,kind:'maintenance-intake',invitationId:invitation.id,submissionId:input.requestId,contactPermission:true,data:result.clean,documentCount:attachments.length};
 const text=['Wartungsaufnahme · '+result.clean.address,'Vorgang: '+invitation.id,'Übermittlung: '+input.requestId,'','Angaben der anfragenden Person – keine geprüften technischen Feststellungen.','Rückrufwünsche sind noch keine bestätigten Termine.','',...allFields.map(([k,label])=>`${label}: ${Array.isArray(result.clean[k])?result.clean[k].join(', ')||'Unbekannt':result.clean[k]||'Unbekannt'}`)].join('\n');
 const bytes=enc.encode(JSON.stringify(packet,null,2));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 attachments.unshift({filename:'wartungsaufnahme.json',content:btoa(binary)});
 try{const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'seehafer-intake/'+input.requestId},body:JSON.stringify({from:env.RESEND_FROM||'Seehafer Wartung <onboarding@resend.dev>',to:[env.INQUIRY_TO],reply_to:result.clean.email,subject:'Wartungsaufnahme · '+result.clean.address.replace(/[\r\n]/g,' ').slice(0,120),text,attachments}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();const sent=await response.json();if(!sent.id)throw Error();return json(200,{ok:true,reference:invitation.id});}catch{return json(502,{error:'Die Übermittlung konnte nicht bestätigt werden. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.'});}
}
