const SUPABASE_URL = "https://yjvlbfkdqgnlwkrzhvha.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZGVbf9ndW1s1rXClQod8cA__T6FGu7N";

const products = [
  {id:"ff",name:"جواهر Free Fire",sub:"Free Fire Diamonds",cat:"ألعاب",icon:"💎",accent:"#a65dba",desc:"خدمة شحن تجريبية. لا يتوفر تنفيذ حقيقي قبل ربط مورّد معتمد."},
  {id:"pubg",name:"شدات PUBG Mobile",sub:"PUBG Mobile UC",cat:"ألعاب",icon:"🎯",accent:"#bc843b",desc:"أدخل معرّف اللاعب الصحيح عند تفعيل خدمة الشحن."},
  {id:"ml",name:"ماسات Mobile Legends",sub:"Mobile Legends",cat:"ألعاب",icon:"⚔️",accent:"#4b8bc6",desc:"بانتظار إضافة باقات وأسعار مؤكدة."},
  {id:"roblox",name:"Roblox",sub:"بطاقات وروبلوكس",cat:"بطاقات",icon:"🧊",accent:"#c14c4c",desc:"التوفر والأسعار الفعلية غير مفعّلة حالياً."},
  {id:"syriatel",name:"رصيد سيريتل",sub:"Syriatel",cat:"اتصالات",icon:"📱",accent:"#3b9d80",desc:"يتطلب تنفيذ الشحن قناة توريد معتمدة."},
  {id:"mtn",name:"رصيد MTN",sub:"MTN",cat:"اتصالات",icon:"📶",accent:"#d0a23f",desc:"السعر والتوفر يحتاجان إلى تأكيد."},
  {id:"gift",name:"بطاقات رقمية",sub:"Digital Gift Cards",cat:"بطاقات",icon:"🎁",accent:"#c56d88",desc:"يمكن إضافة البطاقات بعد تجهيز التوريد."},
  {id:"apps",name:"شحن التطبيقات",sub:"Apps & Services",cat:"تطبيقات",icon:"✦",accent:"#6e7ac5",desc:"واجهة المنتج فقط؛ التنفيذ غير مفعّل."}
];

const $ = s => document.querySelector(s);
let category = "الكل", searchTerm = "", supabase = null, currentUser = null;

const read = key => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

const save = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const money = n =>
  new Intl.NumberFormat("ar-SY").format(n) + " ل.س";

function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}

async function initializeSupabase() {
  try {
    if (!window.supabase) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => reject(new Error("تعذر تحميل مكتبة الاتصال"));
        document.head.appendChild(script);
      });
    }

    supabase = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    currentUser = data.session?.user || null;

    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
    });

    return true;
  } catch (e) {toast("خطأ الاتصال: " + (e?.message || String(e)));
    return false;
  }
}

function requireClient() {
  if (!supabase) {
    toast("الاتصال بقاعدة البيانات لم يجهز بعد");
    return false;
  }
  return true;
}

function render() {
  const found = products.filter(p =>
    (category === "الكل" || p.cat === category) &&
    (p.name + " " + p.sub + " " + p.cat)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  $("#productsGrid").innerHTML = found.length
    ? found.map(p => `
      <article class="product">
        <div class="product-art" style="--accent:${p.accent}">${p.icon}</div>
        <h3>${p.name}</h3>
        <p>${p.sub}</p>
        <div class="product-bottom">
          <span class="price">السعر عند الربط</span>
          <button data-product="${p.id}">التفاصيل</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty">ما لقينا نتائج. جرّب كلمة ثانية.</div>`;

  document.querySelectorAll("[data-product]").forEach(b =>
    b.addEventListener("click", () => openProduct(b.dataset.product))
  );
}

function openModal(html) {
  $("#modalContent").innerHTML = html;

  const backdrop = $("#backdrop");
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const modal = backdrop.querySelector(".modal");
  if (modal) modal.scrollTop = 0;

  $("#closeBtn").focus({ preventScroll: true });
}

function closeModal() {
  $("#backdrop").classList.remove("open");
  $("#backdrop").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
      }
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  openModal(`
    <span class="eyebrow">${p.cat}</span>
    <h2 id="modalTitle">${p.name}</h2>
    <p>${p.desc}</p>
    <div class="warning">الشحن الفعلي غير مفعّل. لن يتم خصم أموال أو إرسال شحنة.</div>

    <label class="field">
      <span>معرّف اللاعب أو رقم الهاتف</span>
      <input id="playerId" placeholder="أدخل البيانات عند الحاجة">
    </label>

    <label class="field">
      <span>ملاحظات اختيارية</span>
      <input id="note" placeholder="الباقة أو المنطقة">
    </label>

    <button class="btn gold submit" id="createOrder">
      حفظ طلب تجريبي
    </button>
  `);

  $("#createOrder").onclick = () => {
    const orders = read("voltix24_orders");

    orders.unshift({
      product: p.name,
      player: $("#playerId").value.trim(),
      note: $("#note").value.trim(),
      status: "تجريبي — غير منفذ",
      date: new Date().toLocaleString("ar")
    });

    save("voltix24_orders", orders);
    closeModal();
    toast("انحفظ طلب تجريبي على هذا الجهاز فقط");
  };
}

async function openWallet() {
  if (!requireClient()) return;

  if (!currentUser) {
    openLogin();
    toast("سجّل الدخول أولاً لعرض محفظتك");
    return;
  }

  openModal(`
    <span class="eyebrow">مساحتك الشخصية</span>
    <h2 id="modalTitle">محفظتي</h2>
    <p>${escapeHTML(currentUser.email || "حسابك")}</p>

    <div id="walletDetails">جارٍ تحميل بيانات المحفظة...</div>

    <button class="btn gold submit" id="depositBtn">طلب إيداع</button>
    <button class="btn secondary submit" id="ordersBtn">طلباتي</button>
    <button class="btn secondary submit" id="logoutBtn">تسجيل الخروج</button>

    <div id="subContent"></div>
  `);

  $("#depositBtn").onclick = depositForm;
  $("#ordersBtn").onclick = showOrders;

  $("#logoutBtn").onclick = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast("تعذر تسجيل الخروج");
      return;
    }

    currentUser = null;
    closeModal();
    toast("تم تسجيل الخروج");
  };

  const { data, error } = await supabase
    .from("wallets")
    .select("balance,currency")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    $("#walletDetails").innerHTML = `
      <div class="warning">
        تعذر قراءة المحفظة: ${escapeHTML(error.message)}
      </div>`;
  } else if (data) {
    $("#walletDetails").innerHTML = `
      <div class="wallet-card">
        <small>الرصيد</small>
        <strong>${new Intl.NumberFormat("ar").format(data.balance)}
        ${escapeHTML(data.currency)}</strong>
      </div>
      <div class="warning">
        الرصيد للعرض فقط. تعديل الرصيد يحتاج إجراءً إدارياً آمناً.
      </div>`;
  } else {
    $("#walletDetails").innerHTML = `
      <div class="warning">
        لم تُنشأ محفظة لهذا الحساب. تحقق من إعداد حساب المستخدم.
      </div>`;
  }
}

function depositForm() {
  if (!currentUser) {
    toast("سجّل الدخول أولاً");
    return;
  }

  $("#subContent").innerHTML = `
    <h3>طلب إيداع</h3>
    <p>سيُسجل الطلب للمراجعة فقط. لا تحوّل المال قبل تجهيز آلية الدفع.</p>

    <label class="field">
      <span>المبلغ المطلوب</span>
      <input id="depositAmount" type="number" min="0.01"
        step="0.01" inputmode="decimal" placeholder="أدخل المبلغ">
    </label>

    <label class="field">
      <span>العملة</span>
      <select id="depositCurrency">
        <option value="USD">USD</option>
        <option value="SYP">SYP</option>
      </select>
    </label>

    <label class="field">
      <span>طريقة الدفع</span>
      <select id="depositMethod">
        <option value="Sham Cash">شام كاش</option>
        <option value="Bank transfer">تحويل</option>
        <option value="Other">أخرى</option>
      </select>
    </label>

    <label class="field">
      <span>رقم مرجعي اختياري</span>
      <input id="depositReference" placeholder="لا تدخل معلومات سرية">
    </label>

    <button class="btn gold submit" id="saveDeposit">
      إرسال طلب الإيداع
    </button>
  `;

  $("#saveDeposit").onclick = async () => {
    const amount = Number($("#depositAmount").value);
    const currency = $("#depositCurrency").value;
    const method = $("#depositMethod").value;
    const reference = $("#depositReference").value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      toast("أدخل مبلغاً صحيحاً");
      return;
    }

    const button = $("#saveDeposit");
    button.disabled = true;
    button.textContent = "جارٍ الإرسال...";

    const { error } = await supabase
      .from("deposit_requests")
      .insert({
        user_id: currentUser.id,
        amount,
        currency,
        payment_method: method,
        reference_number: reference || null
      });

    button.disabled = false;
    button.textContent = "إرسال طلب الإيداع";

    if (error) {
      console.error(error);
      toast("تعذر حفظ الطلب: " + error.message);
      return;
    }

    $("#subContent").innerHTML = `
      <div class="warning">
        تم تسجيل طلبك للمراجعة فقط. لم يتم دفع أي مبلغ أو إضافة رصيد.
      </div>`;

    toast("تم إرسال طلب الإيداع للمراجعة");
  };
    }
async function showOrders() {
  if (!currentUser) {
    toast("سجّل الدخول أولاً");
    return;
  }

  $("#subContent").innerHTML = "<p>جارٍ تحميل الطلبات...</p>";

  const { data, error } = await supabase
    .from("charge_orders")
    .select("product_name,account_identifier,status,created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    $("#subContent").innerHTML = `
      <div class="warning">
        تعذر تحميل الطلبات: ${escapeHTML(error.message)}
      </div>`;
    return;
  }

  $("#subContent").innerHTML = `
    <h3>طلباتي</h3>
    ${
      data.length
        ? data.map(o => `
          <div class="record">
            <b>${escapeHTML(o.product_name)}</b>
            <small>
              ${escapeHTML(o.account_identifier)} ·
              ${escapeHTML(o.status)} ·
              ${escapeHTML(new Date(o.created_at).toLocaleString("ar"))}
            </small>
          </div>
        `).join("")
        : '<div class="record">لا توجد طلبات محفوظة في حسابك.</div>'
    }
  `;
}

function openLogin() {
  openModal(`
    <span class="eyebrow">VOLTIX24</span>
    <h2 id="modalTitle">حسابي</h2>
    <p>أنشئ حساباً أو سجّل الدخول بالبريد الإلكتروني.</p>

    <label class="field">
      <span>الاسم (للتسجيل الجديد)</span>
      <input id="authName" autocomplete="name" placeholder="اسمك">
    </label>

    <label class="field">
      <span>البريد الإلكتروني</span>
      <input id="authEmail" type="email"
        autocomplete="email" placeholder="name@example.com">
    </label>

    <label class="field">
      <span>كلمة المرور</span>
      <input id="authPassword" type="password"
        autocomplete="current-password" placeholder="8 أحرف أو أكثر">
    </label>

    <button class="btn gold submit" id="signInBtn">تسجيل الدخول</button>
    <button class="btn secondary submit" id="signUpBtn">إنشاء حساب جديد</button>

    <div id="authMessage"></div>
  `);

  $("#signInBtn").onclick = () => authenticate(false);
  $("#signUpBtn").onclick = () => authenticate(true);
}

async function authenticate(signUp) {
  if (!requireClient()) return;

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const name = $("#authName").value.trim();

  if (!email || !password) {
    toast("أدخل البريد الإلكتروني وكلمة المرور");
    return;
  }

  if (password.length < 8) {
    toast("استخدم كلمة مرور من 8 أحرف على الأقل");
    return;
  }

  const buttons = [$("#signInBtn"), $("#signUpBtn")];
  buttons.forEach(b => b.disabled = true);

  let result;

  if (signUp) {
    result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
  } else {
    result = await supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  buttons.forEach(b => b.disabled = false);

  if (result.error) {
    $("#authMessage").innerHTML = `
      <div class="warning">
        ${escapeHTML(result.error.message)}
      </div>`;
    return;
  }

  currentUser = result.data.user || result.data.session?.user || null;

  if (signUp && !result.data.session) {
    $("#authMessage").innerHTML = `
      <div class="warning">
        تم إرسال طلب إنشاء الحساب. افحص بريدك لتأكيد الحساب إذا كان
        تأكيد البريد مفعّلاً، ثم سجّل الدخول.
      </div>`;
    toast("تحقق من بريدك الإلكتروني");
    return;
  }

  closeModal();
  toast(signUp ? "تم إنشاء الحساب" : "تم تسجيل الدخول");
}

function openSupport() {
  openModal(`
    <span class="eyebrow">VOLTIX CARE</span>
    <h2 id="modalTitle">الدعم</h2>
    <p>هذه الرسالة تُحفظ على هذا الجهاز فقط ولا تصل إلى فريق دعم حقيقي.</p>

    <label class="field">
      <span>اسمك</span>
      <input id="supportName" placeholder="اسمك">
    </label>

    <label class="field">
      <span>رسالتك</span>
      <textarea id="supportMessage" placeholder="كيف نقدر نساعدك؟"></textarea>
    </label>

    <button class="btn gold submit" id="saveSupport">
      حفظ رسالة تجريبية
    </button>
  `);

  $("#saveSupport").onclick = () => {
    const msg = $("#supportMessage").value.trim();

    if (!msg) {
      toast("اكتب رسالتك أولاً");
      return;
    }

    const arr = read("voltix24_support");

    arr.unshift({
      name: $("#supportName").value.trim(),
      message: msg,
      date: new Date().toLocaleString("ar")
    });

    save("voltix24_support", arr);
    closeModal();
    toast("انحفظت الرسالة على هذا الجهاز فقط");
  };
}

function openAdmin() {
  openModal(`
    <span class="eyebrow">VOLTIX24</span>
    <h2 id="modalTitle">الإدارة</h2>

    <div class="warning">
      لوحة الإدارة غير مفعّلة بعد. لا يمكن اعتماد الإيداعات أو تعديل
      الأرصدة بأمان قبل إعداد صلاحيات إدارية على الخادم.
    </div>
  `);
}

function escapeHTML(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;

  category = b.dataset.cat;

  document.querySelectorAll(".filter").forEach(x =>
    x.classList.toggle("active", x === b)
  );

  render();
});

$("#search").addEventListener("input", e => {
  searchTerm = e.target.value;
  render();
});

$("#walletBtn").onclick = openWallet;
$("#heroWallet").onclick = openWallet;
$("#loginBtn").onclick = openLogin;
$("#supportBtn").onclick = openSupport;
$("#adminBtn").onclick = openAdmin;

$("#menuBtn").onclick = () => openModal(`
  <h2 id="modalTitle">القائمة</h2>
  <div class="record"><a href="#products" data-nav>المنتجات والخدمات</a></div>
  <div class="record"><a href="#how" data-nav>كيف تطلب؟</a></div>
  <div class="record"><a href="#support" data-nav>الدعم</a></div>
`);

$("#modalContent").addEventListener("click", e => {
  if (e.target.closest("[data-nav]")) closeModal();
});

$("#closeBtn").onclick = closeModal;

$("#backdrop").addEventListener("click", e => {
  if (e.target === $("#backdrop")) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

render();
initializeSupabase();
