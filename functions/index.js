export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const prompt = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} tahun, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GEMINI_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // Menggunakan Kombinasi Resmi: v1beta + gemini-1.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return Response.json({ cerita: `Eror dari Google Gemini: ${data.error.message}` });
    }

    const cerita = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!cerita) {
      return Response.json({ cerita: `Google sukses terhubung, tapi struktur datanya kosong.` });
    }

    return Response.json({ cerita });
  } catch (err) {
    return Response.json({ cerita: `Terjadi kesalahan pada sistem server: ${err.message}` }, { status: 500 });
  }
}
