window.lexgottiState = {
  blueprint: null,
  files: {},
  activeFile: null,
  currentProjectId: null
};

const blueprintView = document.getElementById("blueprintView");
const fileTabs = document.getElementById("fileTabs");
const fileView = document.getElementById("fileView");
const statusView = document.getElementById("statusView");

window.setStatus = function setStatus(message, details = "") {
  statusView.classList.remove("muted");
  statusView.textContent = details ? `${message}\n\n${details}` : message;
};

window.renderBlueprint = function renderBlueprint(blueprint) {
  window.lexgottiState.blueprint = blueprint;
  blueprintView.classList.remove("muted");

  const pages = (blueprint.pages || [])
    .map((page) => `<li><strong>${page.name}</strong>: ${(page.sections || []).join(", ")}</li>`)
    .join("");

  const features = (blueprint.features || [])
    .map((feature) => `<li>${feature}</li>`)
    .join("");

  const stack = (blueprint.recommendedStack || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  blueprintView.innerHTML = `
    <h3>${blueprint.projectName || "Untitled Project"}</h3>
    <p><strong>Type:</strong> ${blueprint.projectType || "website"}</p>
    <p><strong>Design Theme:</strong> ${blueprint.designTheme || "Not specified"}</p>
    <h4>Pages</h4>
    <ul>${pages || "<li>No pages returned.</li>"}</ul>
    <h4>Features</h4>
    <ul>${features || "<li>No features returned.</li>"}</ul>
    <h4>Recommended Stack</h4>
    <ul>${stack || "<li>No stack returned.</li>"}</ul>
  `;
};

window.renderFiles = function renderFiles(files) {
  window.lexgottiState.files = files || {};
  const names = Object.keys(files || {});
  fileTabs.innerHTML = "";
  fileView.classList.remove("muted");

  if (!names.length) {
    fileView.textContent = "No files returned.";
    return;
  }

  window.lexgottiState.activeFile = names[0];

  names.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      window.lexgottiState.activeFile = name;
      window.updateActiveFile();
    });
    fileTabs.appendChild(btn);
  });

  window.updateActiveFile();
};

window.updateActiveFile = function updateActiveFile() {
  const tabs = [...fileTabs.querySelectorAll(".tab")];
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.textContent === window.lexgottiState.activeFile);
  });

  fileView.textContent = window.lexgottiState.files[window.lexgottiState.activeFile] || "No file selected.";
};
