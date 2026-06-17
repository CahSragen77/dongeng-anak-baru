export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const prompt = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} tahun, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${context.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const cerita = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal mendapatkan cerita.";

    return Response.json({ cerita });
  } catch (err) {
    return Response.json({ cerita: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
