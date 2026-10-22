const products = [
  {id:"ff",name:"جواهر Free Fire",sub:"Free Fire Diamonds",cat:"ألعاب",icon:"💎",accent:"#a65dba",desc:"خدمة شحن تجريبية لجواهر فري فاير. السعر والتنفيذ يحتاجان مورّداً معتمداً."},
  {id:"pubg",name:"شدات PUBG Mobile",sub:"PUBG Mobile UC",cat:"ألعاب",icon:"🎯",accent:"#bc843b",desc:"أدخل معرّف اللاعب الصحيح عند توفر خدمة الشحن الفعلية."},
  {id:"ml",name:"ماسات Mobile Legends",sub:"Mobile Legends",cat:"ألعاب",icon:"⚔️",accent:"#4b8bc6",desc:"واجهة منتج مبدئية بانتظار ربط مورّد الشحن."},
  {id:"roblox",name:"Roblox",sub:"بطاقات وروبلوكس",cat:"بطاقات",icon:"🧊",accent:"#c14c4c",desc:"التوفر والأسعار الفعلية غير مفعّلة في النسخة الحالية."},
  {id:"syriatel",name:"رصيد سيريتل",sub:"Syriatel",cat:"اتصالات",icon:"📱",accent:"#3b9d80",desc:"تنفيذ الشحن يتطلب قناة توريد معتمدة."},
  {id:"mtn",name:"رصيد MTN",sub:"MTN",cat:"اتصالات",icon:"📶",accent:"#d0a23f",desc:"السعر والتوفر يجب تأكيدهما قبل تفعيل الخدمة."},
  {id:"gift",name:"بطاقات رقمية",sub:"Digital Gift Cards",cat:"بطاقات",icon:"🎁",accent:"#c56d88",desc:"يمكن إضافة أنواع البطاقات بعد تجهيز الربط الحقيقي."},
  {id:"apps",name:"شحن التطبيقات",sub:"Apps & Services",cat:"تطبيقات",icon:"✦",accent:"#6e7ac5",desc:"الخدمة معروضة للتجربة فقط وليست قابلة للتنفيذ حالياً."}
];
const $ = s => document.querySelector(s);
let category = "الكل", searchTerm = "";
const read = key => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = n => new Intl.NumberFormat("ar-SY").format(n) + " ل.س";
function toast(message){ const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); }
function render(){
  const found=products.filter(p=>(category==="الكل"||p.cat===category)&&(p.name+" "+p.sub+" "+p.cat).toLowerCase().includes(searchTerm.toLowerCase()));
  $("#productsGrid").innerHTML=found.length?found.map(p=>`<article class="product"><div class="product-art" style="--accent:${p.accent}">${p.icon}</div><h3>${p.name}</h3><p>${p.sub}</p><div class="product-bottom"><span class="price">السعر عند الربط</span><button data-product="${p.id}">التفاصيل</button></div></article>`).join(""):`<div class="empty">ما لقينا نتائج. جرّب كلمة ثانية.</div>`;
  document.querySelectorAll("[data-product]").forEach(b=>b.addEventListener("click",()=>openProduct(b.dataset.product)));
}
function openModal(html){
  $("#modalContent").innerHTML=html;
  const backdrop=$("#backdrop");
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  const modal=backdrop.querySelector(".modal");
  if(modal) modal.scrollTop=0;
  $("#closeBtn").focus({preventScroll:true});
}
function closeModal(){
  $("#backdrop").classList.remove("open");
  $("#backdrop").setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}
function openProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  openModal(`<span class="eyebrow">${p.cat}</span><h2 id="modalTitle">${p.name}</h2><p>${p.desc}</p><div class="warning">هذه نسخة تجريبية. لن يتم تنفيذ شحن أو خصم أموال.</div><label class="field"><span>معرّف اللاعب أو رقم الهاتف</span><input id="playerId" placeholder="أدخل البيانات عند الحاجة"></label><label class="field"><span>ملاحظات اختيارية</span><input id="note" placeholder="الباقة أو المنطقة"></label><button class="btn gold submit" id="createOrder">حفظ طلب تجريبي</button>`);
  $("#createOrder").onclick=()=>{const orders=read("voltix24_orders");orders.unshift({product:p.name,player:$("#playerId").value.trim(),note:$("#note").value.trim(),status:"تجريبي — غير منفذ",date:new Date().toLocaleString("ar")});save("voltix24_orders",orders);closeModal();toast("انحفظ طلب تجريبي على هذا الجهاز فقط");};
}
function openWallet(){
  const balance=Number(localStorage.getItem("voltix24_balance")||0);
  const deposits=read("voltix24_deposits");
  const orders=read("voltix24_orders");
  openModal(`<span class="eyebrow">مساحتك الشخصية</span><h2 id="modalTitle">محفظتي</h2><p>الرصيد والطلبات في هذه النسخة تجريبية ومحلية فقط.</p><div class="wallet-card"><small>الرصيد التجريبي</small><strong>${money(balance)}</strong></div><div class="warning">لا تحوّل أموالاً. الإيداع الحقيقي غير مفعّل.</div><button class="btn gold submit" id="depositBtn">طلب إيداع تجريبي</button><button class="btn secondary submit" id="ordersBtn">طلباتي (${orders.length})</button><div id="subContent"></div>`);
  $("#depositBtn").onclick=()=>depositForm();
  $("#ordersBtn").onclick=()=>showOrders();
}
function depositForm(){
  $("#subContent").innerHTML=`<h3>طلب إيداع تجريبي</h3><p>لا ترسل أي مبلغ. هذا النموذج لا يضيف رصيداً مالياً.</p><label class="field"><span>المبلغ المطلوب (ل.س)</span><input id="depositAmount" type="number" min="1" inputmode="numeric" placeholder="مثال: 50000"></label><label class="field"><span>طريقة الدفع</span><select id="depositMethod"><option>شام كاش — غير مفعّل</option><option>تحويل يدوي — غير مفعّل</option><option>وسيلة أخرى — غير مفعّلة</option></select></label><button class="btn gold submit" id="saveDeposit">حفظ طلب تجريبي</button>`;
  $("#saveDeposit").onclick=()=>{const amount=Number($("#depositAmount").value);if(!Number.isFinite(amount)||amount<1){toast("أدخل مبلغاً صحيحاً");return;}const arr=read("voltix24_deposits");arr.unshift({amount,method:$("#depositMethod").value,status:"تجريبي — غير مدفوع",date:new Date().toLocaleString("ar")});save("voltix24_deposits",arr);$("#subContent").innerHTML='<div class="warning">تم حفظ طلب تجريبي فقط. لم يتم تحويل أموال أو إضافة رصيد.</div>';toast("تم حفظ الطلب التجريبي");};
}
function showOrders(){
  const orders=read("voltix24_orders");
  $("#subContent").innerHTML=`<h3>طلباتي</h3>${orders.length?orders.map(o=>`<div class="record"><b>${escapeHTML(o.product)}</b><small>${escapeHTML(o.date)} · ${escapeHTML(o.status)}</small></div>`).join(""):'<div class="record">ما عندك طلبات تجريبية حالياً.</div>'}`;
}
function openLogin(){openModal(`<span class="eyebrow">VOLTIX24</span><h2 id="modalTitle">حسابي</h2><p>تسجيل الحسابات غير مفعّل بعد. لا تستخدم كلمة مرور حقيقية هنا.</p><div class="warning">هذا النموذج توضيحي فقط؛ لا ينشئ حساباً فعلياً.</div><label class="field"><span>البريد الإلكتروني</span><input type="email" placeholder="name@example.com"></label><label class="field"><span>كلمة المرور التجريبية</span><input type="password" placeholder="لا تستخدم كلمة مرورك الحقيقية"></label><button class="btn gold submit" id="loginDemo">متابعة تجريبية</button>`);$("#loginDemo").onclick=()=>{closeModal();toast("تسجيل الدخول الحقيقي غير مفعّل بعد");};}
function openSupport(){openModal(`<span class="eyebrow">VOLTIX CARE</span><h2 id="modalTitle">الدعم</h2><p>هذه الرسالة تُحفظ على هذا الجهاز فقط ولا تصل إلى فريق دعم حقيقي.</p><label class="field"><span>اسمك</span><input id="supportName" placeholder="اسمك"></label><label class="field"><span>رسالتك</span><textarea id="supportMessage" placeholder="كيف نقدر نساعدك؟"></textarea></label><button class="btn gold submit" id="saveSupport">حفظ رسالة تجريبية</button>`);$("#saveSupport").onclick=()=>{const msg=$("#supportMessage").value.trim();if(!msg){toast("اكتب رسالتك أولاً");return;}const arr=read("voltix24_support");arr.unshift({name:$("#supportName").value.trim(),message:msg,date:new Date().toLocaleString("ar")});save("voltix24_support",arr);closeModal();toast("انحفظت الرسالة على هذا الجهاز فقط");};}
function openAdmin(){const deps=read("voltix24_deposits"),orders=read("voltix24_orders"),msgs=read("voltix24_support");openModal(`<span class="eyebrow">معاينة محلية</span><h2 id="modalTitle">الإدارة التجريبية</h2><div class="warning">هذه ليست لوحة إدارة محمية. السجلات موجودة على هذا المتصفح فقط، فلا تستخدمها لأموال حقيقية.</div><div class="record">طلبات الإيداع: ${deps.length}</div><div class="record">طلبات الشحن: ${orders.length}</div><div class="record">رسائل الدعم: ${msgs.length}</div>`);}
function escapeHTML(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;category=b.dataset.cat;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render();});
$("#search").addEventListener("input",e=>{searchTerm=e.target.value;render();});
$("#walletBtn").onclick=openWallet;$("#heroWallet").onclick=openWallet;$("#loginBtn").onclick=openLogin;$("#supportBtn").onclick=openSupport;$("#adminBtn").onclick=openAdmin;
$("#menuBtn").onclick=()=>openModal(`<h2 id="modalTitle">القائمة</h2><div class="record"><a href="#products" data-nav>المنتجات والخدمات</a></div><div class="record"><a href="#how" data-nav>كيف تطلب؟</a></div><div class="record"><a href="#support" data-nav>الدعم</a></div>`);
$("#modalContent").addEventListener("click",e=>{if(e.target.closest("[data-nav]"))closeModal();});
$("#closeBtn").onclick=closeModal;
$("#backdrop").addEventListener("click",e=>{if(e.target===$("#backdrop"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
render();
