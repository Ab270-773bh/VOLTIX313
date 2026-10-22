
const SUPABASE_URL = "https://yjvlbfkdqgnlwkrzhvha.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZGVbf9ndW1s1rXClQod8cA__T6FGu7N";

const products = [
  { id:"ff", name:"جواهر Free Fire", sub:"Free Fire Diamonds", cat:"ألعاب", icon:"💎", accent:"#a65dba", desc:"خدمة تجريبية، الشحن الحقيقي غير مفعّل." },
  { id:"pubg", name:"شدات PUBG Mobile", sub:"PUBG Mobile UC", cat:"ألعاب", icon:"🎯", accent:"#bc843b", desc:"الشحن الحقيقي غير مفعّل حالياً." },
  { id:"ml", name:"ماسات Mobile Legends", sub:"Mobile Legends", cat:"ألعاب", icon:"⚔️", accent:"#4b8bc6", desc:"الباقات والأسعار تحتاج إلى تأكيد." },
  { id:"roblox", name:"Roblox", sub:"بطاقات وروبلوكس", cat:"بطاقات", icon:"🧊", accent:"#c14c4c", desc:"التوفر والأسعار غير مفعّلة حالياً." },
  { id:"syriatel", name:"رصيد سيريتل", sub:"Syriatel", cat:"اتصالات", icon:"📱", accent:"#3b9d80", desc:"يتطلب مورّد شحن معتمداً." },
  { id:"mtn", name:"رصيد MTN", sub:"MTN", cat:"اتصالات", icon:"📶", accent:"#d0a23f", desc:"السعر والتوفر يحتاجان إلى تأكيد." },
  { id:"gift", name:"بطاقات رقمية", sub:"Digital Gift Cards", cat:"بطاقات", icon:"🎁", accent:"#c56d88", desc:"الخدمة غير مفعّلة حالياً." },
  { id:"apps", name:"شحن التطبيقات", sub:"Apps & Services", cat:"تطبيقات", icon:"✦", accent:"#6e7ac5", desc:"واجهة تجريبية فقط." }
];

const $ = s => document.querySelector(s);
let category = "الكل";
let searchTerm = "";
let supabase = null;
let currentUser = null;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toast(message) {
  const el = $("#toast");
  if (!el) {
    console.log(message);
    return;
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3500);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

async function initializeSupabase() {
  try {
    if (!window.supabase?.createClient) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("تعذر تحميل مكتبة Supabase. تحقق من الإنترنت أو جرّب لاحقاً."));
        document.head.appendChild(script);
      });
    }

    if (!window.supabase?.createClient) {
      throw new Error("مكتبة Supabase لم توفر createClient.");
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

    toast("تم الاتصال بـ Supabase");
    return true;
  } catch (error) {
    supabase = null;
    console.error("Supabase initialization error:", error);
    toast("خطأ الاتصال: " + (error?.message || String(error)));
    return false;
  }
}

function requireClient() {
  if (!supabase) {
    toast("الاتصال غير جاهز. حدّث الصفحة وحاول مجدداً.");
    return false;
  }
  return true;
}

function render() {
  const grid = $("#productsGrid");
  if (!grid) {
    console.error("العنصر #productsGrid غير موجود في index.html");
    return;
  }

  const found = products.filter(p =>
    (category === "الكل" || p.cat === category) &&
    (p.name + " " + p.sub + " " + p.cat)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  grid.innerHTML = found.length
    ? found.map(p => `
        <article class="product">
          <div class="product-art" style="--accent:${p.accent}">${p.icon}</div>
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.sub)}</p>
          <div class="product-bottom">
            <span class="price">السعر عند الربط</span>
            <button data-product="${p.id}">التفاصيل</button>
          </div>
        </article>
      `).join("")
    : `<div class="empty">ما لقينا نتائج. جرّب كلمة ثانية.</div>`;

  grid.querySelectorAll("[data-product]").forEach(button => {
    button.addEventListener("click", () =>
      openProduct(button.dataset.product)
    );
  });
}

function openModal(html) {
  const content = $("#modalContent");
  const backdrop = $("#backdrop");
  if (!content || !backdrop) {
    toast("تعذر فتح النافذة؛ تحقق من index.html");
    return;
  }

  content.innerHTML = html;
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const modal = backdrop.querySelector(".modal");
  if (modal) modal.scrollTop = 0;
}

function closeModal() {
  const backdrop = $("#backdrop");
  if (!backdrop) return;

  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  openModal(`
    <span class="eyebrow">${escapeHTML(product.cat)}</span>
    <h2 id="modalTitle">${escapeHTML(product.name)}</h2>
    <p>${escapeHTML(product.desc)}</p>
    <div class="warning">
      الشحن الحقيقي غير مفعّل. لن يتم خصم أموال أو إرسال شحنة.
    </div>

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
      product: product.name,
      player: $("#playerId").value.trim(),
      note: $("#note").value.trim(),
      status: "تجريبي — غير منفذ",
      date: new Date().toLocaleString("ar")
    });

    save("voltix24_orders", orders);
    closeModal();
    toast("حُفظ الطلب التجريبي على هذا الجهاز فقط");
  };
}

async function openWallet() {
  if (!requireClient()) return;

  if (!currentUser) {
    openLogin();
    toast("سجّل الدخول أولاً لعرض محفظتك");
    return;
  }

  const user = currentUser;

  openModal(`
    <span class="eyebrow">مساحتك الشخصية</span>
    <h2 id="modalTitle">محفظتي</h2>
    <p>${escapeHTML(user.email || "حسابك")}</p>
    <div id="walletDetails">جارٍ تحميل المحفظة...</div>

    <button class="btn gold submit" id="depositBtn">طلب إيداع</button>
    <button class="btn secondary submit" id="ordersBtn">طلباتي</button>
    <button class="btn secondary submit" id="logoutBtn">تسجيل الخروج</button>
    <div id="subContent"></div>
  `);

  $("#depositBtn").onclick = depositForm;
  $("#ordersBtn").onclick = showOrders;

  $("#logoutBtn").onclick = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      currentUser = null;
      closeModal();
      toast("تم تسجيل الخروج");
    } catch (error) {
      toast("تعذر تسجيل الخروج: " + error.message);
    }
  };

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance,currency")
      .eq("user_id", user.id)
      .maybeSingle();

    const details = $("#walletDetails");
    if (!details || !$("#backdrop").classList.contains("open")) return;

    if (error) throw error;

    if (data) {
      details.innerHTML = `
        <div class="wallet-card">
          <small>الرصيد</small>
          <strong>${escapeHTML(data.balance)} ${escapeHTML(data.currency)}</strong>
        </div>
        <div class="warning">
          الرصيد للعرض فقط؛ لا يتم شحنه تلقائياً.
        </div>`;
    } else {
      details.innerHTML = `
        <div class="warning">
          لا توجد محفظة لهذا الحساب. قد تحتاج إلى إعداد إنشاء المحفظة عند التسجيل.
        </div>`;
    }
  } catch (error) {
    const details = $("#walletDetails");
    if (details) {
      details.innerHTML = `
        <div class="warning">
          تعذرت قراءة المحفظة: ${escapeHTML(error.message)}
        </div>`;
    }
  }
}

function depositForm() {
  if (!currentUser || !requireClient()) return;

  $("#subContent").innerHTML = `
    <h3>طلب إيداع</h3>
    <p>سيُسجل الطلب للمراجعة فقط. لا تحوّل المال عبر هذا النموذج.</p>

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

    try {
      const { error } = await supabase
        .from("deposit_requests")
        .insert({
          user_id: currentUser.id,
          amount,
          currency,
          payment_method: method,
          reference_number: reference || null
        });

      if (error) throw error;

      $("#subContent").innerHTML = `
        <div class="warning">
          تم تسجيل طلبك للمراجعة فقط. لم يتم دفع أي مبلغ أو إضافة رصيد.
        </div>`;

      toast("تم إرسال طلب الإيداع للمراجعة");
    } catch (error) {
      console.error("Deposit request error:", error);
      toast("تعذر حفظ الطلب: " + error.message);
    } finally {
      if (button.isConnected) {
        button.disabled = false;
        button.textContent = "إرسال طلب الإيداع";
      }
    }
  };
}

async function showOrders() {
  if (!currentUser || !requireClient()) return;

  const localOrders = read("voltix24_orders");
  const subContent = $("#subContent");
  if (!subContent) return;

  subContent.innerHTML = `
    <h3>الطلبات التجريبية</h3>
    <p>هذه الطلبات محفوظة على هذا الجهاز فقط، وليست طلبات شحن فعلية.</p>
    ${
      localOrders.length
        ? localOrders.map(order => `
            <div class="record">
              <b>${escapeHTML(order.product)}</b>
              <small>
                ${escapeHTML(order.player || "بدون معرّف")} ·
                ${escapeHTML(order.status)} ·
                ${escapeHTML(order.date)}
              </small>
            </div>
          `).join("")
        : '<div class="record">لا توجد طلبات تجريبية على هذا الجهاز.</div>'
    }
  `;

  try {
    const { data, error } = await supabase
      .from("charge_orders")
      .select("product_name,account_identifier,status,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!$("#subContent")) return;

    subContent.innerHTML += `
      <h3>طلبات قاعدة البيانات</h3>
      ${
        data?.length
          ? data.map(order => `
              <div class="record">
                <b>${escapeHTML(order.product_name)}</b>
                <small>
                  ${escapeHTML(order.account_identifier)} ·
                  ${escapeHTML(order.status)} ·
                  ${escapeHTML(new Date(order.created_at).toLocaleString("ar"))}
                </small>
              </div>
            `).join("")
          : '<div class="record">لا توجد طلبات محفوظة في قاعدة البيانات.</div>'
      }
    `;
  } catch (error) {
    console.error("Orders loading error:", error);
    subContent.innerHTML += `
      <div class="warning">
        تعذر تحميل طلبات قاعدة البيانات: ${escapeHTML(error.message)}
      </div>`;
  }
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
  buttons.forEach(button => button.disabled = true);

  try {
    const result = signUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) throw result.error;

    currentUser = result.data.user || result.data.session?.user || null;

    if (signUp && !result.data.session) {
      $("#authMessage").innerHTML = `
        <div class="warning">
          تم إرسال طلب إنشاء الحساب. افحص بريدك لتأكيد الحساب إذا طُلب منك ذلك.
        </div>`;
      return;
    }

    closeModal();
    toast(signUp ? "تم إنشاء الحساب" : "تم تسجيل الدخول");
  } catch (error) {
    const message = $("#authMessage");
    if (message) {
      message.innerHTML = `
        <div class="warning">${escapeHTML(error.message)}</div>`;
    } else {
      toast("تعذر تسجيل الدخول: " + error.message);
    }
  } finally {
    buttons.forEach(button => {
      if (button) button.disabled = false;
    });
  }
}

function openSupport() {
  openModal(`
    <span class="eyebrow">VOLTIX CARE</span>
    <h2 id="modalTitle">الدعم التجريبي</h2>
    <p>الرسالة تُحفظ على هذا الجهاز فقط ولا تصل إلى فريق دعم حقيقي.</p>

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
    const message = $("#supportMessage").value.trim();
    if (!message) {
      toast("اكتب رسالتك أولاً");
      return;
    }

    const messages = read("voltix24_support");
    messages.unshift({
      name: $("#supportName").value.trim(),
      message,
      date: new Date().toLocaleString("ar")
    });

    save("voltix24_support", messages);
    closeModal();
    toast("حُفظت الرسالة على هذا الجهاز فقط");
  };
}

function openAdmin() {
  openModal(`
    <span class="eyebrow">VOLTIX24</span>
    <h2 id="modalTitle">الإدارة</h2>
    <div class="warning">
      لوحة الإدارة غير مفعّلة. لا تعتمد الإيداعات ولا تعدّل الأرصدة قبل
      إعداد صلاحيات إدارية آمنة على الخادم.
    </div>
  `);
}

function initializePage() {
  $("#filters")?.addEventListener("click", event => {
    const button = event.target.closest("[data-cat]");
    if (!button) return;

    category = button.dataset.cat;

    document.querySelectorAll(".filter").forEach(item =>
      item.classList.toggle("active", item === button)
    );

    render();
  });

  $("#search")?.addEventListener("input", event => {
    searchTerm = event.target.value;
    render();
  });

  $("#walletBtn") && ($("#walletBtn").onclick = openWallet);
  $("#heroWallet") && ($("#heroWallet").onclick = openWallet);
  $("#loginBtn") && ($("#loginBtn").onclick = openLogin);
  $("#supportBtn") && ($("#supportBtn").onclick = openSupport);
  $("#adminBtn") && ($("#adminBtn").onclick = openAdmin);

  $("#menuBtn") && ($("#menuBtn").onclick = () => openModal(`
    <h2 id="modalTitle">القائمة</h2>
    <div class="record"><a href="#products" data-nav>المنتجات والخدمات</a></div>
    <div class="record"><a href="#how" data-nav>كيف تطلب؟</a></div>
    <div class="record"><a href="#support" data-nav>الدعم</a></div>
  `));

  $("#modalContent")?.addEventListener("click", event => {
    if (event.target.closest("[data-nav]")) closeModal();
  });

  $("#closeBtn") && ($("#closeBtn").onclick = closeModal);

  $("#backdrop")?.addEventListener("click", event => {
    if (event.target === $("#backdrop")) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  render();
  initializeSupabase();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
