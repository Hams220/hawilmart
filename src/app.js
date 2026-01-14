/* =========================================================
   CONFIG & STATE
========================================================= */
const CONFIG = {
  SALDO: 81_000,
  ADMIN_FEE: 1_000,
  ID_USER: 3
};

const state = {
  koordinat: null,
  subtotal: 0,
  ongkir: 0,            // ⬅️ dari backend
  jarak_km: 0,          // ⬅️ optional (buat info)
  diskon: 0,
  produk: [],
  metodePengiriman: "antar",
  metodePembayaran: null
};

/* =========================================================
   DOM HELPER
========================================================= */
const $    = id => document.getElementById(id);
const $all = name => document.querySelectorAll(`input[name="${name}"]`);
const rupiah = n => `Rp ${Number(n).toLocaleString("id-ID")}`;

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  $("saldo_user").textContent = rupiah(CONFIG.SALDO);
  attachListeners();
});

/* =========================================================
   KERANJANG
========================================================= */
function renderKeranjang(keranjang) {
  const container = $("keranjang");
  container.innerHTML = "";

  state.subtotal = keranjang.subtotal;
  state.produk   = keranjang.data.map(i => i.id_produk);

  keranjang.data.forEach(item => {
    container.insertAdjacentHTML("beforeend", `
      <div class="bg-white rounded-2xl p-3 shadow-sm mb-3">
        <div class="flex gap-3">
          <img src="${IMG_URL + item.url_produk}"
               class="w-20 h-20 rounded-xl object-cover">
          <div class="flex-1">
            <p class="text-xs text-gray-700">${item.nama_produk}</p>
            <p class="font-bold text-blue-600">
              ${rupiah(item.harga_produk)}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="updateQty('${item.id_produk}','minus')">−</button>
            <span class="font-semibold">${item.qty}</span>
            <button onclick="updateQty('${item.id_produk}','plus')">+</button>
          </div>
        </div>
      </div>
    `);
  });

  loadAlamat();
  recalculateTotal();
}

/* =========================================================
   ALAMAT
========================================================= */
$("alamatUser").onclick   = () => $("modalUser").classList.remove("hidden");
$("closeModal").onclick   = () => $("modalUser").classList.add("hidden");
$("batalSimpan").onclick  = () => $("modalUser").classList.add("hidden");
$("simpanAlamatBtn").onclick = simpanAlamat;

async function loadAlamat() {
  try {
    loadingShow();
    const res = await fetch(
      `${API_URL}/alamat.php?action=get&id_user=${CONFIG.ID_USER}`
    ).then(r => r.json());

    if (!res.success) return;

    fillAlamat(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    loadingHide();
  }
}

function fillAlamat(data) {
  state.koordinat = data.koordinat || null;

  // ⬅️ ONGKIR FULL DARI BACKEND
  state.ongkir   = data.delivery?.ongkir || 0;
  state.jarak_km = data.delivery?.jarak_km || 0;

  $("alamatUser").innerHTML = `
    <div>
      <div class="text-sm font-semibold text-blue-600 mb-1">
        <i class="fa-solid fa-house"></i> Alamat
      </div>
      <p class="text-sm font-semibold">
        ${data.nama_lengkap} · ${data.nomor_telepon}
      </p>
      <p class="text-sm">
        ${data.detail_alamat} ${data.alamat_lengkap}
      </p>
      <p class="text-xs text-gray-500 mt-1">
        Jarak: ${state.jarak_km} km
      </p>
    </div>
  `;

  $("namaUser").value      = data.nama_lengkap;
  $("nomorTelepon").value  = data.nomor_telepon;
  $("alamatLengkap").value = data.alamat_lengkap;
  $("detailAlamat").value  = data.detail_alamat;

  $("ongkir").textContent   = rupiah(state.ongkir);
  $("ongkirPA").textContent = rupiah(state.ongkir);

  recalculateTotal();
}

async function simpanAlamat() {
  const payload = {
    id_user: CONFIG.ID_USER,
    nama_lengkap: $("namaUser").value.trim(),
    nomor_telepon: $("nomorTelepon").value.trim(),
    alamat_lengkap: $("alamatLengkap").value.trim(),
    detail_alamat: $("detailAlamat").value.trim(),
    koordinat: state.koordinat
  };

  if (Object.values(payload).some(v => !v))
    return alert("Lengkapi semua field");

  const res = await fetch(
    `${API_URL}/alamat.php?action=create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  ).then(r => r.json());

  if (!res.success)
    return alert(res.message || "Gagal menyimpan alamat");

  $("modalUser").classList.add("hidden");
  loadAlamat();
}

/* =========================================================
   RADIO LISTENER
========================================================= */
function attachListeners() {
  $all("metode-pengiriman").forEach(r => {
    r.addEventListener("change", e => {
      state.metodePengiriman = e.target.value;
      recalculateTotal();
    });
  });

  $all("metode-pembayaran").forEach(r => {
    r.addEventListener("change", e => {
      state.metodePembayaran = e.target.value;
    });
  });
}

/* =========================================================
   TOTAL & HITUNGAN
========================================================= */
function recalculateTotal() {
  const ongkir = state.metodePengiriman === "ambil" ? 0 : state.ongkir;
  const admin  = state.metodePengiriman === "ambil" ? 0 : CONFIG.ADMIN_FEE;

  const total = state.subtotal + ongkir + admin - state.diskon;

  $("totalhargaProduk").textContent = rupiah(state.subtotal);
  $("ongkir").textContent           = rupiah(ongkir);
  $("biayaAdmin").textContent       = rupiah(admin);
  $("totalPembayaran").textContent  = rupiah(total);
}

/* =========================================================
   CHECKOUT
========================================================= */
$("btnCheckout").onclick = () => {
  if (!state.metodePembayaran)
    return alert("Pilih metode pembayaran");

  if (state.metodePengiriman === "antar" && !state.ongkir)
    return alert("Alamat belum valid");

  const ongkir = state.metodePengiriman === "ambil" ? 0 : state.ongkir;
  const admin  = state.metodePengiriman === "ambil" ? 0 : CONFIG.ADMIN_FEE;
  const total  = state.subtotal + ongkir + admin - state.diskon;

  if (total > CONFIG.SALDO)
    return alert("Saldo tidak mencukupi");

  const payload = {
    id_user: CONFIG.ID_USER,
    id_produk: state.produk,
    subtotal: state.subtotal,
    ongkir,
    admin_fee: admin,
    diskon: state.diskon,
    total_bayar: total,
    metode_pengiriman: state.metodePengiriman,
    metode_pembayaran: state.metodePembayaran
  };

  console.log("CHECKOUT PAYLOAD:", payload);
  alert("Checkout berhasil (simulasi)");
};

/* =========================================================
   VOUCHER
========================================================= */
$("claimVoucher").onclick = async () => {
  const kode = $("voucher").value.trim();
  if (!kode) return alert("Masukkan kode voucher");

  loadingShow();

  try {
    const res  = await fetch(`${API_URL}/PROMO/promo.php?action=get`);
    const json = await res.json();

    const promo = json.data?.find(
      p => p.kode_voucher.toUpperCase() === kode.toUpperCase()
    );

    if (!promo) return alert("Voucher tidak ditemukan");

    state.diskon = promo.total_diskon;

    $("diskon").textContent = rupiah(state.diskon);
    $("textPromo").innerHTML =
      `<i class="fa-regular fa-circle-check text-green-600"></i>
       Voucher ${promo.kode_voucher} digunakan`;

    recalculateTotal();
  } catch (err) {
    console.error(err);
    alert("Gagal klaim voucher");
  } finally {
    loadingHide();
  }
};

/* =========================================================
   LOADING
========================================================= */
function loadingShow() {
  $("loading")?.classList.remove("hidden");
}
function loadingHide() {
  $("loading")?.classList.add("hidden");
}
