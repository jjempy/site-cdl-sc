// CDL Directory — minimal JS only: calculator + table sort. No tracking, no PII in events.
// Calculator formula (shown live on the page):
// Out-of-pocket (est.) = Gross tuition + Fees + Tools/kit + DOT/DMV fees - Grant applied
// All inputs are user-entered or from the data sheet; no hidden constants.
(function(){
  function money(n){return "$"+Math.round(n).toLocaleString("en-US");}
  var form=document.getElementById("calc-form");
  if(form){
    var out=document.getElementById("calc-result");
    var detail=document.getElementById("calc-detail");
    function recalc(){
      var g=parseFloat(form.gross.value||0), f=parseFloat(form.fees.value||0),
          t=parseFloat(form.tools.value||0), d=parseFloat(form.dot.value||0),
          grantIn=parseFloat(form.grant.value||0);
      var costs=g+f+t+d;
      // A grant covers remaining tuition/fees; it does not pay more than the costs entered.
      var grant=Math.min(grantIn, costs);
      var total=costs-grant;
      if(out) out.textContent=money(total)+" est.";
      if(detail) detail.textContent="Gross "+money(g)+" + Fees "+money(f)+" + Tools "+money(t)+" + DOT/DMV "+money(d)+" - Grant "+money(grant)+(grant<grantIn?" (grant capped at entered costs; a grant does not pay more than the costs it covers)":"")+" = "+money(total)+" est. Enter only figures from a school page or the grants page. Figures not from a published source are estimates, not quotes.";
    }
    form.addEventListener("input",recalc); recalc();
  }
  document.querySelectorAll("table.sortable").forEach(function(tbl){
    tbl.querySelectorAll("th[data-sort]").forEach(function(th){
      th.style.cursor="pointer"; th.title="Sort this column";
      th.addEventListener("click",function(){
        var idx=Array.prototype.indexOf.call(th.parentNode.children,th);
        var rows=Array.prototype.slice.call(tbl.tBodies[0].rows);
        var asc=th.getAttribute("data-dir")!=="asc"; th.setAttribute("data-dir",asc?"asc":"desc");
        rows.sort(function(a,b){
          var av=a.cells[idx].textContent.trim(), bv=b.cells[idx].textContent.trim();
          var an=parseFloat(av.replace(/[^0-9.\-]/g,"")), bn=parseFloat(bv.replace(/[^0-9.\-]/g,""));
          if(!isNaN(an)&&!isNaN(bn)) return asc?an-bn:bn-an;
          return asc?av.localeCompare(bv):bv.localeCompare(av);
        });
        rows.forEach(function(r){tbl.tBodies[0].appendChild(r);});
      });
    });
  });
  var inquiry=document.getElementById("inquiry-form");
  if(inquiry){
    var siteField=document.getElementById("form-site");
    if(siteField) siteField.value=window.location.hostname||"";
    inquiry.addEventListener("submit",function(e){
      e.preventDefault();
      var msg=document.getElementById("inquiry-note");
      var school=inquiry.school?inquiry.school.value:"";
      if(msg) msg.textContent="Sending inquiry for "+(school||"the selected school")+"…";
      var data=new FormData(inquiry);
      fetch(inquiry.action,{method:"POST",body:data,headers:{"Accept":"application/json"}})
        .then(function(r){
          if(r.ok){ if(msg) msg.textContent="Inquiry sent for "+(school||"the selected school")+". One inquiry, one school, with your consent for that school only."; inquiry.reset(); if(siteField) siteField.value=window.location.hostname||""; }
          else { if(msg) msg.textContent="That did not send — please try again, or use the school's published contact page."; }
        })
        .catch(function(){ if(msg) msg.textContent="That did not send — please try again, or use the school's published contact page."; });
    });
  }
})();
