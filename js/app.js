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
const buildFullProjectBtn = document.getElementById("buildFullProjectBtn");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const newProjectBtn = document.getElementById("newProjectBtn");
const exportProjectBtn = document.getElementById("exportProjectBtn");
const prepareDeployBtn = document.getElementById("prepareDeployBtn");

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
  sessionStorage.removeItem("lexgotti_console_unlocked_v4");
  location.reload();
}

function checkAccess() {
  if (sessionStorage.getItem("lexgotti_console_unlocked_v4") === "yes") {
    unlockConsole();
  }
}

unlockBtn.addEventListener("click", () => {
  const value = accessCodeInput.value.trim();
  if (value === window.lexgottiConfig.accessCode) {
    sessionStorage.setItem("lexgotti_console_unlocked_v4", "yes");
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
    status: window.lexgottiState.currentStatus,
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
  } else {
    blueprintView.textContent = "Blueprint will appear here...";
    blueprintView.classList.add("muted");
  }
  if (project.files && Object.keys(project.files).length) {
    window.renderFiles(project.files);
  } else {
    fileTabs.innerHTML = "";
    fileView.textContent = "Generated files will appear here...";
    fileView.classList.add("muted");
  }
  window.setProjectStatus(project.status || "Draft");
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
      <div class="project-meta">${project.type} • ${project.status || "Draft"} • ${new Date(project.updatedAt).toLocaleString()}</div>
    `;
    item.addEventListener("click", () => fillProject(project));
    projectList.appendChild(item);
  });
}

async function requestBlueprint() {
  const prompt = projectPromptInput.value.trim();
  const projectName = projectNameInput.value.trim() || "Untitled Project";
  const projectType = projectTypeSelect.value;

  if (!prompt) {
    setStatus("Please enter a project prompt.");
    return null;
  }

  generateBlueprintBtn.disabled = true;
  setStatus("Generating blueprint...");
  window.setProjectStatus("Generating Blueprint");

  try {
    const response = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `${projectName} (${projectType}) - ${prompt}` })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(`Blueprint error: ${data.error || "Unknown error"}`, JSON.stringify(data.details || data, null, 2));
      window.setProjectStatus("Draft");
      return null;
    }

    window.renderBlueprint(data.blueprint || data);
    window.setProjectStatus("Blueprint Ready");
    generateCodeBtn.disabled = false;
    setStatus("Blueprint generated successfully.");
    return data.blueprint || data;
  } catch (error) {
    setStatus(`Blueprint request failed: ${error.message}`);
    window.setProjectStatus("Draft");
    return null;
  } finally {
    generateBlueprintBtn.disabled = false;
  }
}

async function requestCode() {
  if (!window.lexgottiState.blueprint) {
    setStatus("Generate a blueprint first.");
    return null;
  }

  generateCodeBtn.disabled = true;
  setStatus("Generating code files...");
  window.setProjectStatus("Generating Code");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blueprint: window.lexgottiState.blueprint })
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(`Code generation error: ${data.error || "Unknown error"}`, JSON.stringify(data.details || data, null, 2));
      window.setProjectStatus("Blueprint Ready");
      return null;
    }

    window.renderFiles(data.files || {});
    window.setProjectStatus("Code Ready");
    setStatus("Code files generated successfully.");
    return data.files || {};
  } catch (error) {
    setStatus(`Code generation request failed: ${error.message}`);
    window.setProjectStatus("Blueprint Ready");
    return null;
  } finally {
    generateCodeBtn.disabled = false;
  }
}

function saveCurrentProject(message = null) {
  const project = makeProjectRecord();
  window.lexgottiState.currentProjectId = project.id;
  window.projectVault.save(project);
  renderProjectList();
  if (message) setStatus(message);
}

generateBlueprintBtn.addEventListener("click", async () => {
  await requestBlueprint();
});

generateCodeBtn.addEventListener("click", async () => {
  await requestCode();
});

buildFullProjectBtn.addEventListener("click", async () => {
  const prompt = projectPromptInput.value.trim();
  if (!prompt) {
    setStatus("Please enter a project prompt.");
    return;
  }

  buildFullProjectBtn.disabled = true;
  setStatus("Running full project build...");
  window.setProjectStatus("Full Build Running");

  const blueprint = await requestBlueprint();
  if (!blueprint) {
    buildFullProjectBtn.disabled = false;
    return;
  }

  const files = await requestCode();
  if (!files) {
    buildFullProjectBtn.disabled = false;
    return;
  }

  window.setProjectStatus("Code Ready");
  saveCurrentProject("Full project build complete. Project saved to vault.");
  buildFullProjectBtn.disabled = false;
});

saveProjectBtn.addEventListener("click", () => {
  saveCurrentProject(`Saved project: ${projectNameInput.value.trim() || "Untitled Project"}`);
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
  window.setProjectStatus("Draft");
  setStatus("New project started.");
});

exportProjectBtn.addEventListener("click", () => {
  const project = makeProjectRecord();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(project.name || "project").replace(/\s+/g, "-").toLowerCase()}-vault.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded project JSON.");
});

prepareDeployBtn.addEventListener("click", () => {
  window.setProjectStatus("Deploy Ready");
  setStatus("Project marked as Deploy Ready. Next step: connect this workflow to a real deployment action.");
});

checkAccess();
