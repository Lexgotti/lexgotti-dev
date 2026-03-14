export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  const key = process.env.OPENAI_API_KEY;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const prompt = body?.prompt;

  if (!key) {
    return res.status(500).json({
      error: "Missing OpenAI key"
    });
  }

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Create a website blueprint for: ${prompt}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "AI returned no text.";

    return res.status(200).json({
      result: text
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
