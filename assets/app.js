(function(){
  var root=document.body.getAttribute('data-root')||'';
  var de=document.documentElement;
  // ---- theme switch (Light / Dark) ----
  var tb=document.getElementById('themebtn');
  function isDark(){var t=de.getAttribute('data-theme');return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
  function sync(){tb.setAttribute('aria-checked',isDark())}
  tb.addEventListener('click',function(){var n=isDark()?'light':'dark';de.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}sync()});
  sync();
  // ---- mobile menu ----
  var mb=document.getElementById('menubtn'),sb=document.getElementById('sidebar');
  mb.addEventListener('click',function(){var o=sb.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
  var op=document.querySelector('details.grp[open]');
  if(op&&sb.scrollHeight>sb.clientHeight){sb.scrollTop=Math.max(0,op.offsetTop-90)}
  // ---- table of contents from h2/h3 ----
  var hs=document.querySelectorAll('.content h2[id],.content h3[id]');
  if(hs.length){
    var toc=document.getElementById('toc'),ul=toc.querySelector('ul');
    hs.forEach(function(h){var li=document.createElement('li'),a=document.createElement('a');
      a.href='#'+h.id;a.textContent=h.textContent;if(h.tagName==='H3')a.style.paddingLeft='24px';li.appendChild(a);ul.appendChild(li)});
    toc.hidden=false;
    var links=ul.querySelectorAll('a');
    var spy=function(){var cur=0;hs.forEach(function(h,i){if(h.getBoundingClientRect().top<120)cur=i});
      links.forEach(function(a,i){a.classList.toggle('on',i===cur)})};
    addEventListener('scroll',spy,{passive:true});spy();
  }
  // ---- filter: each .tools block filters the table/cards that follows it ----
  document.querySelectorAll('.tools').forEach(function(t){
    var f=t.querySelector('.gfilter'),cnt=t.querySelector('.count'),nx=t.nextElementSibling;
    var items=[].slice.call(nx.querySelectorAll('tbody tr, .card')),grids=[];
    if(nx.classList.contains('cards')){items=[].slice.call(nx.children);grids=[nx];}
    else if(nx.tagName==='H3'){items=[];for(var e=nx;e;e=e.nextElementSibling){if(e.classList&&e.classList.contains('cards')){grids.push(e);items=items.concat([].slice.call(e.children))}else if(e.tagName==='H2')break}}
    f.addEventListener('input',function(){var q=f.value.toLowerCase(),n=0;
      items.forEach(function(r){var m=!q||r.textContent.toLowerCase().indexOf(q)>-1;r.hidden=!m;if(m)n++});
      cnt.textContent=n+' of '+items.length;
      grids.forEach(function(g){var h=g.previousElementSibling;if(h&&h.tagName==='H3')h.hidden=!g.querySelector('.card:not([hidden])')})});
  });
  // ---- sortable tables: numbers numerically, text naturally, blanks last ----
  var coll=new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});
  document.querySelectorAll('table.sortable').forEach(function(tbl){
    var tb2=tbl.tBodies[0],ths=[].slice.call(tbl.tHead.rows[0].cells);
    ths.forEach(function(th,ci){th.querySelector('button').addEventListener('click',function(){
      var dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending',s=dir==='ascending'?1:-1;
      ths.forEach(function(t){t.setAttribute('aria-sort','none')});th.setAttribute('aria-sort',dir);
      var rows=[].slice.call(tb2.rows).map(function(r,i){var v=r.cells[ci].textContent.trim();
        return{r:r,i:i,v:v,n:v!==''&&isFinite(Number(v))?Number(v):null}});
      rows.sort(function(a,b){
        if(a.v===''||b.v==='')return a.v===b.v?a.i-b.i:(a.v===''?1:-1);
        var c=(a.n!==null&&b.n!==null)?a.n-b.n:coll.compare(a.v,b.v);
        return c?c*s:a.i-b.i});
      var fr=document.createDocumentFragment();rows.forEach(function(x){fr.appendChild(x.r)});tb2.appendChild(fr);
    })});
  });
  // ---- highlight hash target ----
  function hl(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var el=document.getElementById(id);
    if(el&&el.tagName==='TR'){el.classList.add('hit');el.scrollIntoView({block:'center'})}}
  hl();addEventListener('hashchange',hl);
  // ---- top navigation dropdowns ----
  var dds=[].slice.call(document.querySelectorAll('.dd'));
  function closeDD(except){dds.forEach(function(d){if(d===except)return;
    d.querySelector('.ddmenu').hidden=true;d.querySelector('.ddbtn').setAttribute('aria-expanded','false')})}
  dds.forEach(function(d){var b=d.querySelector('.ddbtn'),m=d.querySelector('.ddmenu');
    b.addEventListener('click',function(e){e.stopPropagation();var o=m.hidden;closeDD(d);m.hidden=!o;b.setAttribute('aria-expanded',o)})});
  document.addEventListener('click',function(e){if(!e.target.closest('.dd'))closeDD(null)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDD(null)});
  // ---- header search ----
  var q=document.getElementById('q'),res=document.getElementById('results'),idx=window.SEARCH_INDEX||[],sel=-1;
  function render(){var v=q.value.trim().toLowerCase();if(!v){res.hidden=true;return}
    var m=idx.filter(function(i){return i.t.toLowerCase().indexOf(v)>-1}).slice(0,15);
    res.innerHTML='';
    if(!m.length){res.innerHTML='<div class="none">No results</div>'}
    m.forEach(function(i){var a=document.createElement('a');a.href=root+i.u;
      var s=document.createElement('span');s.textContent=i.t;var k=document.createElement('small');k.textContent=i.k;
      a.appendChild(s);a.appendChild(k);res.appendChild(a)});
    res.hidden=false;sel=-1}
  q.addEventListener('input',render);q.addEventListener('focus',render);
  q.addEventListener('keydown',function(e){var as=res.querySelectorAll('a');
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!as.length)return;sel=(sel+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach(function(a,i){a.classList.toggle('sel',i===sel)})}
    else if(e.key==='Enter'&&as.length){location.href=as[sel>-1?sel:0].href}
    else if(e.key==='Escape'){res.hidden=true}});
  document.addEventListener('click',function(e){if(!e.target.closest('.navsearch'))res.hidden=true});
})();
