const promptInput = document.getElementById("builderPrompt");
const outputBox = document.getElementById("outputBox");
const generateBtn = document.getElementById("generateBtn");
const projectType = document.getElementById("projectType");

function fallbackBlueprint(type, prompt) {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return "Please describe what you want to build so Lexgotti.dev can generate a proper blueprint.";
  }

  return `PROJECT BLUEPRINT

Project Type:
${type}

Idea:
${cleanPrompt}

Recommended Structure:
- Hero section with strong value proposition
- Feature section explaining what the product does
- Trust section with proof/testimonials
- CTA section focused on conversion
- Mobile responsive layout
- Premium branded styling

Suggested Modules:
- Homepage / landing page
- About / story section
- Contact or booking form
- Dashboard or admin section (if needed)
- API or data layer (future stage)

Suggested Next Steps:
1. Refine the prompt into a product brief
2. Turn the brief into page sections/components
3. Generate front-end code
4. Connect forms, auth, database, and API
5. Deploy to production

Lexgotti.dev Note:
The AI API route is included in this V2 pack.
If the live endpoint is not available yet, this fallback preview still works on the front end.`;
}

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value;
  const type = projectType.value;

  outputBox.textContent = "Building blueprint...";

  try {
    const res = await fetch("/api/build", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, projectType: type })
    });

    if (!res.ok) {
      throw new Error("API route not available on this host.");
    }

    const data = await res.json();
    outputBox.textContent = data.result || fallbackBlueprint(type, prompt);
  } catch (error) {
    outputBox.textContent = fallbackBlueprint(type, prompt);
  }
});
