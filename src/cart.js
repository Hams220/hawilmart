// const API_URL = "https://hawilpay.my.id/API";
// const IMG_URL = "https://hawilpay.my.id/assets/";
// const idKeranjang = "KRN123";

function getKeranjang() {
  fetch(API_URL + "/get_keranjang.php?id_keranjang=" + idKeranjang, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((keranjang) => {
      console.log(keranjang);
      renderKeranjang(keranjang);
    })
    .catch((error) => console.error(error));
}
getKeranjang();

// UPDATE QTY (Plus / Minus)
function updateQty(id_produk, aksi) {
  loadingShow();
  const formData = new FormData();
  formData.append("id_keranjang", idKeranjang);
  formData.append("id_produk", id_produk);
  formData.append("aksi", aksi); // "plus" atau "minus"

  fetch(API_URL + "/update_qty.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        getKeranjang(); // refresh tampilan
      } else {
        alert(data.message || "Gagal update quantity");
      }
    })
    .catch((error) => console.error(error));
}


function updateTotal (subtotal, ongkir, fee, promo) {
  console.log(promo)
  const total = document.getElementById("totalhargaProduk");
  total.innerHTML = `
    Rp ${Number(subtotal + ongkir + fee - promo).toLocaleString("id-ID")}
  `;
}

function totalBayar (subtotal, ongkir, fee, promo) {
  const total = document.getElementById("totalPembayaran");
  total.innerHTML = `
    Rp ${Number(subtotal + ongkir + fee - promo).toLocaleString("id-ID")}
  `;
}