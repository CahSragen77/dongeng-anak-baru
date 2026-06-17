export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const prompt = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} tahun, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    // Ambil API Key dari Cloudflare
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GEMINI_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // DISINI PERUBAHANNYA: Menggunakan gemini-1.5-flash-latest
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    // Jika Google mengirimkan eror aktif
    if (data.error) {
      return Response.json({ cerita: `Eror dari Google Gemini: ${data.error.message}` });
    }

    // Membaca jalur teks secara aman
    const cerita = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!cerita) {
      return Response.json({ cerita: `Google terhubung, tapi gagal membedah teks. Respons mentah: ${JSON.stringify(data)}` });
    }

    return Response.json({ cerita });
  } catch (err) {
    return Response.json({ cerita: `Terjadi kesalahan pada sistem server: ${err.message}` }, { status: 500 });
  }
}
