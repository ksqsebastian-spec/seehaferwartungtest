// Old review links carried anchors into the middle of the page. Treat them as new arrivals.
(() => {
 const url=new URL(location.href),reviewLink=url.searchParams.has('v');
 if(reviewLink){url.searchParams.delete('v');url.hash='';history.replaceState(null,'',url.pathname+url.search);}
 if(!location.hash){
  history.scrollRestoration='manual';
  const top=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
  top();addEventListener('pageshow',event=>{if(!event.persisted)top();},{once:true});
 }
})();
