const promptBox = document.getElementById("prompt");
const output = document.getElementById("output");
const button = document.getElementById("generate");

button.onclick = async () => {
  const prompt = promptBox.value;

  if (!prompt) {
    output.textContent = "Please enter a prompt.";
    return;
  }

  output.textContent = "Generating...";

  try {
    const response = await fetch("/api/build", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      output.textContent = `Error: ${data.error || "Unknown error"}${
        data.details ? "\\n\\n" + JSON.stringify(data.details, null, 2) : ""
      }`;
      return;
    }

    output.textContent = data.result || "No result returned.";
  } catch (error) {
    output.textContent = "Error: " + error.message;
  }
};
