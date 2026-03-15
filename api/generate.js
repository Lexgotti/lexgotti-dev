export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const blueprint = body?.blueprint;

    if (!blueprint) {
      return res.status(400).json({ error: "Blueprint is required." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "Return valid JSON only with a single top-level key called files. files must contain index.html, styles.css, and script.js as strings. Build a polished static website from the provided blueprint."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(blueprint)
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    const text = data.output_text || data.output?.[0]?.content?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "AI returned no code text.",
        details: data
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Generated code was not valid JSON.",
        details: text
      });
    }

    return res.status(200).json({ files: parsed.files || {} });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
