export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, projectType } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemPrompt = `
You are the AI builder for Lexgotti.dev.
Turn user requests into clean, structured project blueprints.

Rules:
- Return a practical blueprint
- Include pages, components, features, recommended stack, and next steps
- Tailor the output to the project type
- Keep it organized and execution-ready
`.trim();

    const userPrompt = `
Project type: ${projectType || "website"}

User request:
${String(prompt).trim()}
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    const result = data?.choices?.[0]?.message?.content || "No response generated.";

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
