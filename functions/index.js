import { GoogleGenAI } from '@google/generative-ai';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { nama, usia, tema } = body;

    const promptText = `Anda adalah pendongeng anak. Buatkan dongeng untuk anak bernama ${nama}, usia ${usia} tahun, tema ${tema}. Buat dongeng yang ceria, penuh pesan moral, dan tidak menakutkan. Berikan judul yang menarik.`;

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ cerita: "Eror: GEMINI_API_KEY belum terpasang di Cloudflare Settings!" });
    }

    // Menggunakan SDK Resmi Google Gen AI jalur VIP
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: promptText,
    });

    // Mengambil teks secara otomatis dan aman via SDK
    const cerita = response.text;
    
    if (!cerita) {
      return Response.json({ cerita: "Google merespons, tetapi teks cerita kosong." });
    }

    return Response.json({ cerita });

  } catch (err) {
    return Response.json({ cerita: `Eror dari Sistem Google/Cloudflare: ${err.message}` }, { status: 500 });
  }
}
