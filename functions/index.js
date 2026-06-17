export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const promptText = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} years old, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GEMINI_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // Menggunakan jalur v1beta yang jauh lebih ramah untuk pemanggilan langsung
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
              parts: [{ text: promptText }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Jika Google mendeteksi eror
    if (data.error) {
      return Response.json({ cerita: `Eror dari Google Gemini: ${data.error.message} (Code: ${data.error.code})` });
    }

    // Ambil hasil teks dongengnya
    const cerita = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!cerita) {
      return Response.json({ cerita: "Google merespons, tetapi struktur teks cerita kosong." });
    }

    return Response.json({ cerita });

  } catch (err) {
    return Response.json({ cerita: `Terjadi kesalahan pada sistem server Cloudflare: ${err.message}` }, { status: 500 });
  }
}
