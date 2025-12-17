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
        console.log(data)

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


