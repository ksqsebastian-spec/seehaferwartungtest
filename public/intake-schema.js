export const sections = [
 {title:'Sie & Ihr Objekt',intro:'Damit wir Ihre Angaben dem richtigen Objekt zuordnen können.',fields:[
 ['name','Ihr Name','text',true],['company','Firma / Hausverwaltung','text',true],['email','Ihre E-Mail-Adresse','email',true],['phone','Telefon für Rückfragen','tel',false],['role','Sie handeln als','select',true,['Hausverwaltung','Eigentümer/in','Facility Management','Sonstiges']],['address','Objektadresse mit PLZ und Ort','textarea',true],['building','Gebäudeart','select',false,['Wohngebäude','Büro / Gewerbe','Kita / Schule','Hotel','Pflege / Klinik','Gemischte Nutzung','Sonstiges']],['parts','Gebäudeteile / Hauseingänge / Etagen','text',false]]},
 {title:'Was soll gewartet werden?',intro:'Eine grobe Einschätzung reicht. Was Sie nicht wissen, klären wir gemeinsam oder am Objekt.',fields:[
 ['systems','Welche Anlagen gibt es?','checks',true,['Brand- / Rauchschutztüren','Automatische Türen / Türantriebe','Feststellanlagen','Flucht- / Paniktüren','Weitere Türen','Fenster','Weiß ich nicht']],['count','Ungefähre Anzahl der Elemente','text',false],['manufacturers','Hersteller / Typen, soweit bekannt','text',false],['lastMaintenance','Letzte Wartung, soweit bekannt','date',false],['deadline','Gewünschter Termin / bekannte Frist','date',false],['deadlineReason','Grund der Frist','text',false],['issues','Bekannte Mängel oder Besonderheiten','textarea',false],['existingContract','Besteht ein Wartungsvertrag?','select',false,['Weiß ich nicht','Nein','Ja – läuft noch','Ja – endet demnächst']],['contractEnd','Vertragsende / Kündigungsfrist, soweit bekannt','text',false]]},
 {title:'Zugang & Abstimmung',intro:'Wer öffnet uns die Türen? Bitte keine Schlüsselcodes, Passwörter oder Bewohnerlisten eintragen.',fields:[
 ['siteContact','Ansprechpartner vor Ort','select',true,['Ich selbst','Hausmeister / andere Person','Noch nicht bekannt']],['siteName','Name vor Ort','text',false],['sitePhone','Telefon vor Ort','tel',false],['siteEmail','E-Mail vor Ort','email',false],['coordination','Dürfen wir den Termin direkt abstimmen?','select',true,['Ja, mit dem Kontakt vor Ort','Bitte zuerst mit mir abstimmen']],['access','Zugang / Schlüsselübergabe / Anmeldung','textarea',false],['workHours','Geeignete Zeiten für Arbeiten','text',false],['notice','Wie sollen Nutzer informiert werden?','select',false,['Aushang durch Hausmeister','Information durch Verwaltung','Bitte mit uns abstimmen','Nicht erforderlich']],['constraints','Betrieb, Schutzbereiche, Parken oder weitere Hinweise','textarea',false]]},
 {title:'Angebot & Abrechnung',intro:'Damit unser Angebot gleich an die richtige Stelle geht. Mit diesem Bogen beauftragen Sie noch keine kostenpflichtigen Arbeiten.',fields:[
 ['recipient','Angebotsempfänger / Auftraggeber','text',true],['billingAddress','Rechnungsanschrift (falls abweichend)','textarea',false],['billingEmail','E-Mail für Rechnungen','email',false],['reference','Objektnummer / Bestellnummer / Kostenstelle','text',false],['approval','Wer gibt Angebot und Zusatzarbeiten frei?','text',false],['cycle','Gewünschte Betreuung','select',false,['Bitte empfehlen Sie einen passenden Umfang','Regelmäßige Wartung','Einmalige Wartung / Bestandsaufnahme']],['documents','Welche Unterlagen sind vorhanden?','checks',false,['Tür- / Anlagenliste','Letztes Wartungsprotokoll','Grundrisse','Fotos / Typenschilder','Keine / unbekannt']]]},
 {title:'Wie geht es weiter?',intro:'Wählen Sie den Weg, der Ihnen am besten passt.',fields:[
 ['nextStep','Ihr nächster Schritt','select',true,['Bitte per E-Mail weiter abstimmen','Bitte schnellstmöglich anrufen','Bitte zu meiner Wunschzeit anrufen']],['callDate','Wunschtag für den Rückruf','date',false],['callWindow','Wunschzeit (Mo–Fr, 9–17 Uhr)','select',false,['09–12 Uhr','12–14 Uhr','14–17 Uhr']],['notes','Noch etwas, das wir wissen sollten?','textarea',false]]}
];
export const allFields=sections.flatMap(s=>s.fields);
export function validateIntake(data,now=new Date()){
 const errors={};const clean={};
 for(const [key,label,type,required,choices] of allFields){
  const value=data[key]??(type==='checks'?[]:'');
  if(type==='checks'){
   if(!Array.isArray(value)||value.length>choices.length||value.some(v=>!choices.includes(v))){errors[key]='Bitte prüfen Sie Ihre Auswahl.';continue;}
   clean[key]=[...new Set(value)];if(required&&!value.length)errors[key]='Bitte mindestens eine Option wählen.';
  }else{
   if(typeof value!=='string'||value.length>(type==='textarea'?1800:250)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)){errors[key]='Bitte kürzen oder prüfen Sie diese Angabe.';continue;}
   clean[key]=value.trim();if(required&&!clean[key])errors[key]='Bitte ausfüllen.';
   if(value&&type==='select'&&!choices.includes(value))errors[key]='Bitte eine Option wählen.';
   if(value&&type==='email'&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))errors[key]='Bitte E-Mail-Adresse prüfen.';
   if(value&&type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))errors[key]='Bitte Datum prüfen.';
  }
 }
 if(clean.siteContact==='Hausmeister / andere Person'&&!clean.siteName)errors.siteName='Bitte den Namen ergänzen.';
 if(clean.siteContact==='Hausmeister / andere Person'&&!clean.sitePhone&&!clean.siteEmail)errors.sitePhone='Telefon oder E-Mail genügt.';
 if(clean.nextStep?.includes('anrufen')&&(!clean.phone||clean.phone.replace(/\D/g,'').length<6))errors.phone='Für einen Rückruf benötigen wir Ihre Telefonnummer.';
 if(clean.nextStep==='Bitte zu meiner Wunschzeit anrufen'&&(!clean.callDate||!clean.callWindow))errors.callDate='Bitte Wunschtag und Zeitfenster ergänzen.';
 if(clean.nextStep==='Bitte zu meiner Wunschzeit anrufen'&&clean.callDate&&!errors.callDate){
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(now);
  const date=new Date(clean.callDate+'T12:00:00Z');
  if(clean.callDate<=today||[0,6].includes(date.getUTCDay())||date-now>61*86400000)errors.callDate='Bitte einen Werktag ab morgen innerhalb von 60 Tagen wählen. Für heute wählen Sie „schnellstmöglich“. ';
 }
 if(clean.siteContact!=='Hausmeister / andere Person')for(const key of ['siteName','sitePhone','siteEmail']){clean[key]='';delete errors[key];}
 if(clean.nextStep!=='Bitte zu meiner Wunschzeit anrufen')for(const key of ['callDate','callWindow']){clean[key]='';delete errors[key];}
 return {clean,errors};
}
