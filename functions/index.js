export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const promptText = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} tahun, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GEMINI_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // Tembakan dengan struktur payload Google AI Studio Paling Lengkap
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    // Deteksi eror internal dari Google
    if (data.error) {
      return Response.json({ cerita: `Eror dari Google Gemini: ${data.error.message} (Code: ${data.error.code})` });
    }

    // Ambil teks cerita secara presisi
    const cerita = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!cerita) {
      return Response.json({ cerita: `Google merespons, tapi struktur teks kosong. Respons: ${JSON.stringify(data)}` });
    }

    return Response.json({ cerita });
  } catch (err) {
    return Response.json({ cerita: `Terjadi kesalahan pada sistem server Cloudflare: ${err.message}` }, { status: 500 });
  }
}
