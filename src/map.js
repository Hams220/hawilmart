function detectKoordinatUser() {
  return new Promise((resolve, reject) => {

    // Minta izin manual dulu
    const izin = confirm("Izinkan HawilMart mengakses lokasi Anda?");
    if (!izin) {
      reject("User membatalkan permintaan lokasi.");
      return;
    }

    if (!navigator.geolocation) {
      reject("Browser tidak mendukung geolocation.");
      return;
    }

    // Minta lokasi dari browser
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        resolve({ lat, lon });
      },
      (err) => {
        reject("Gagal mendeteksi koordinat. Pastikan GPS aktif.");
      }
    );
  });
}


async function detectAlamatUser() {
  return new Promise((resolve, reject) => {
    const izin = confirm("Izinkan HawilMart mengakses lokasi Anda?");
    if (!izin) return reject("User membatalkan.");

    if (!navigator.geolocation)
      return reject("Geolocation tidak didukung.");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        // Panggil PHP proxy, bukan langsung Nominatim!
        const res = await fetch(`https://hawilpay.my.id/API/nominatim.php?lat=${lat}&lon=${lon}`);
        const data = await res.json();
       

        if (!data.address) {
          reject("Reverse geocode gagal.");
          return;
        }

        const alamat = {
          full: data.display_name,
          jalan: data.address.road || "",
          desa: data.address.village || data.address.hamlet || "",
          kecamatan: data.address.suburb || data.address.city_district || "",
          kabupaten: data.address.city || data.address.county || "",
          provinsi: data.address.state || "",
          kodepos: data.address.postcode || "",
          koordinat: { lat, lon }
        };

        resolve(alamat);

      } catch (err) {
        reject("Gagal reverse geocode dari PHP proxy.");
      }

    }, () => reject("Izin lokasi ditolak."));
  });
}


function hitungOngkir(lat, lon) {
  const mainStore = {
    lat: -6.770000, // koordinat toko
    lon: 106.740000
  }

  const R = 6371 // radius bumi (km)

  const dLat = toRad(mainStore.lat - lat)
  const dLon = toRad(mainStore.lon - lon)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) *
      Math.cos(toRad(mainStore.lat)) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const jarakKm = R * c

  // 🚫 Tidak dilayani
  if (jarakKm > 10) {
    return null
  }

  let totalOngkir = 0

  if (jarakKm <= 1) {
    totalOngkir = 5000
  } else {
    const sisaKm = jarakKm - 1
    totalOngkir = 5000 + Math.ceil(sisaKm * 2000)
  }

  return {
    jarak_km: Number(jarakKm.toFixed(2)),
    total_ongkir: totalOngkir
  }
}

// helper
function toRad(val) {
  return (val * Math.PI) / 180
}