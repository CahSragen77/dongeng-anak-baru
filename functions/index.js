export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const promptText = `Anda adalah pendongeng anak profesional. Buatkan dongeng yang sangat menarik, ceria, dan penuh pesan moral untuk anak bernama ${nama}, usia ${usia} tahun, dengan tema ${tema}. Pastikan ceritanya ramah anak, tidak menakutkan, dan berikan judul yang indah di bagian paling atas.`;

    // Mengambil kunci GROK_API_KEY sesuai yang Anda buat di Cloudflare Settings
    const apiKey = context.env.GROK_API_KEY || context.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GROK_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // Jalur resmi API Groq Cloud (Standar OpenAI Format)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Menggunakan Llama 3 bertenaga super
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Deteksi eror dari sistem Groq
    if (data.error) {
      return Response.json({ cerita: `Eror dari Groq API: ${data.error.message}` });
    }

    // Mengambil teks cerita secara presisi dari format Groq/OpenAI
    const cerita = data?.choices?.[0]?.message?.content;

    if (!cerita) {
      return Response.json({ cerita: "Groq merespons, tetapi struktur teks cerita kosong." });
    }

    return Response.json({ cerita });

  } catch (err) {
    return Response.json({ cerita: `Terjadi kesalahan pada sistem server Cloudflare: ${err.message}` }, { status: 500 });
  }
}
