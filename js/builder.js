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

    output.textContent =
      "STATUS: " + response.status + "\\n\\n" +
      JSON.stringify(data, null, 2);

  } catch (error) {
    output.textContent = "FETCH ERROR: " + error.message;
  }
};
