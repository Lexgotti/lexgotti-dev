const authGate = document.getElementById("authGate");
const consoleApp = document.getElementById("consoleApp");
const accessCodeInput = document.getElementById("accessCode");
const unlockBtn = document.getElementById("unlockBtn");
const logoutBtn = document.getElementById("logoutBtn");

const projectNameInput = document.getElementById("projectName");
const projectTypeSelect = document.getElementById("projectType");
const projectPromptInput = document.getElementById("projectPrompt");
const generateBlueprintBtn = document.getElementById("generateBlueprintBtn");
const generateCodeBtn = document.getElementById("generateCodeBtn");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const newProjectBtn = document.getElementById("newProjectBtn");
const downloadProjectBtn = document.getElementById("downloadProjectBtn");

const projectList = document.getElementById("projectList");
const savedCount = document.getElementById("savedCount");
const lastProjectName = document.getElementById("lastProjectName");

function unlockConsole() {
  authGate.classList.add("hidden");
  consoleApp.classList.remove("hidden");
  renderProjectList();
  setStatus("Console unlocked.");
}

function lockConsole() {
  sessionStorage.removeItem("lexgotti_console_unlocked");
  location.reload();
}

function checkAccess() {
  if (sessionStorage.getItem("lexgotti_console_unlocked") === "yes") {
    unlockConsole();
  }
}

unlockBtn.addEventListener("click", () => {
  const value = accessCodeInput.value.trim();
  if (value === window.lexgottiConfig.accessCode) {
    sessionStorage.setItem("lexgotti_console_unlocked", "yes");
    unlockConsole();
  } else {
    setStatus("Wrong access code.");
  }
});

logoutBtn.addEventListener("click", lockConsole);

function makeProjectRecord() {
  return {
    id: window.lexgottiState.currentProjectId || `proj_${Date.now()}`,
    name: projectNameInput.value.trim() || "Untitled Project",
    type: projectTypeSelect.value,
    prompt: projectPromptInput.value.trim(),
    blueprint: window.lexgottiState.blueprint,
    files: window.lexgottiState.files,
    updatedAt: new Date().toISOString()
  };
}

function fillProject(project) {
  window.lexgottiState.currentProjectId = project.id;
  projectNameInput.value = project.name || "";
  projectTypeSelect.value = project.type || "website";
  projectPromptInput.value = project.prompt || "";
  if (project.blueprint) {
    window.renderBlueprint(project.blueprint);
    generateCodeBtn.disabled = false;
  }
  if (project.files && Object.keys(project.files).length) {
    window.renderFiles(project.files);
  } else {
    fileTabs.innerHTML = "";
    fileView.textContent = "Generated files will appear here...";
    fileView.classList.add("muted");
  }
  setStatus(`Loaded project: ${project.name}`);
}

function renderProjectList() {
  const projects = window.projectVault.read();
  savedCount.textContent = String(projects.length);
  lastProjectName.textContent = projects[0]?.name || "None";

  if (!projects.length) {
    projectList.textContent = "No saved projects yet.";
    projectList.classList.add("muted");
    return;
  }

  projectList.classList.remove("muted");
  projectList.innerHTML = "";
  projects.forEach((project) => {
    const item = document.createElement("div");
    item.className = "project-item";
    item.innerHTML = `
      <strong>${project.name}</strong>
      <div class="project-meta">${project.type} • ${new Date(project.updatedAt).toLocaleString()}</div>
    `;
    item.addEventListener("click", () => fillProject(project));
    projectList.appendChild(item);
  });
}

generateBlueprintBtn.addEventListener("click", async () => {
  const prompt = projectPromptInput.value.trim();
  const projectName = projectNameInput.value.trim() || "Untitled Project";
  const projectType = projectTypeSelect.value;

  if (!prompt) {
    setStatus("Please enter a project prompt.");
    return;
  }

  generateBlueprintBtn.disabled = true;
  setStatus("Generating blueprint...");

  try {
    const response = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `${projectName} (${projectType}) - ${prompt}` })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(`Blueprint error: ${data.error || "Unknown error"}`, JSON.stringify(data.details || data, null, 2));
      return;
    }

    window.renderBlueprint(data.blueprint || data);
    generateCodeBtn.disabled = false;
    setStatus("Blueprint generated. Ready for code generation.");
  } catch (error) {
    setStatus(`Blueprint request failed: ${error.message}`);
  } finally {
    generateBlueprintBtn.disabled = false;
  }
});

generateCodeBtn.addEventListener("click", async () => {
  if (!window.lexgottiState.blueprint) {
    setStatus("Generate a blueprint first.");
    return;
  }

  generateCodeBtn.disabled = true;
  setStatus("Generating code files...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blueprint: window.lexgottiState.blueprint })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(`Code generation error: ${data.error || "Unknown error"}`, JSON.stringify(data.details || data, null, 2));
      return;
    }

    window.renderFiles(data.files || {});
    setStatus("Code files generated. Save the project or export it.");
  } catch (error) {
    setStatus(`Code generation request failed: ${error.message}`);
  } finally {
    generateCodeBtn.disabled = false;
  }
});

saveProjectBtn.addEventListener("click", () => {
  const project = makeProjectRecord();
  window.lexgottiState.currentProjectId = project.id;
  window.projectVault.save(project);
  renderProjectList();
  setStatus(`Saved project: ${project.name}`);
});

newProjectBtn.addEventListener("click", () => {
  window.lexgottiState.currentProjectId = null;
  window.lexgottiState.blueprint = null;
  window.lexgottiState.files = {};
  window.lexgottiState.activeFile = null;
  projectNameInput.value = "";
  projectTypeSelect.value = "website";
  projectPromptInput.value = "";
  blueprintView.textContent = "Blueprint will appear here...";
  blueprintView.classList.add("muted");
  fileTabs.innerHTML = "";
  fileView.textContent = "Generated files will appear here...";
  fileView.classList.add("muted");
  generateCodeBtn.disabled = true;
  setStatus("New project started.");
});

downloadProjectBtn.addEventListener("click", () => {
  const project = makeProjectRecord();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name.replace(/\s+/g, "-").toLowerCase() || "project"}-vault.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded project JSON.");
});

checkAccess();
