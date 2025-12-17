// ==============================
// CONFIG
// ==============================
// const API_URL = "https://hawilpay.my.id/API"
// const IMG_URL = "https://hawilpay.my.id/assets/"
// const createCartUrl = API_URL + "/create_keranjang.php"
// const addToCartUrl = API_URL + "/add_keranjang.php"
// const idKeranjang = "KRN123" // nanti ganti dari session / user login

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  initCart()
  getProducts()
})

// ==============================
// CREATE CART (ONCE)
// ==============================
async function initCart() {
  try {
    const formData = new FormData()
    formData.append("id_keranjang", idKeranjang)

    const res = await fetch(createCartUrl, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("Init Cart:", data)
  } catch (err) {
    console.error("Gagal membuat keranjang:", err)
  }
}

// ==============================
// GET PRODUCTS
// ==============================
async function getProducts() {
  try {
    const res = await fetch(API_URL + "/read.php")
    const products = await res.json()

    console.log("Products:", products)
    renderProducts(products)
  } catch (err) {
    console.error("Gagal mengambil produk:", err)
    alert("Produk gagal dimuat")
  }
}

// ==============================
// RENDER PRODUCTS
// ==============================
function renderProducts(products) {
  const productContainer = document.getElementById("product")
  productContainer.innerHTML = "" // reset

  if (!products?.data?.length) {
    productContainer.innerHTML = "<p>Produk kosong</p>"
    return
  }

  products.data.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.innerHTML = `
      <div class="rounded-2xl p-4 bg-white shadow-lg hover:shadow-2xl transition">
        <div class="overflow-hidden rounded-xl">
          <img 
            src="${IMG_URL + product.url_produk}" 
            alt="${product.nama_produk}"
            class="w-full h-32 object-cover hover:scale-110 transition"
          />
        </div>

        <p class="text-sm font-semibold mt-3">
          ${product.nama_produk}
        </p>

        <p class="text-sm font-bold text-blue-600">
          Rp ${product.harga_produk}
        </p>

        <button 
          class="w-full mt-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          onclick="addToCart('${product.id_produk}')"
        >
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    `
    productContainer.appendChild(productCard)
  })
}

// ==============================
// ADD TO CART
// ==============================
async function addToCart(productId) {
  try {
    const formData = new FormData()
    formData.append("id_keranjang", idKeranjang)
    formData.append("id_produk", productId)
    formData.append("qty", 1)

    const res = await fetch(addToCartUrl, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("Add To Cart:", data)

    if (data.success) {
      alert("Produk berhasil ditambahkan ke keranjang")
    } else {
      alert(data.msg || "Gagal menambahkan produk")
    }
  } catch (err) {
    console.error("Add cart error:", err)
    alert("Koneksi ke server bermasalah")
  }
}

// ==============================
// ADD ALAMAT
// ==============================
function addAlamat(
  id_alamat,
  id_user,
  nama_lengkap,
  nomor_telepon,
  alamat_lengkap,
  detail_alamat
) {
  const formData = new FormData()
  formData.append("id_alamat", id_alamat)
  formData.append("id_user", id_user)
  formData.append("nama_lengkap", nama_lengkap)
  formData.append("nomor_telepon", nomor_telepon)
  formData.append("alamat_lengkap", alamat_lengkap)
  formData.append("detail_alamat", detail_alamat)

  return fetch(API_URL + "/alamat.php", {
    method: "POST",
    body: formData,
  }).then((res) => res.json())
}
