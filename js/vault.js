window.projectVault = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(window.lexgottiConfig.storageKey) || "[]");
    } catch {
      return [];
    }
  },

  write(projects) {
    localStorage.setItem(window.lexgottiConfig.storageKey, JSON.stringify(projects));
  },

  save(project) {
    const projects = this.read();
    const idx = projects.findIndex((item) => item.id === project.id);

    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project);
    }

    this.write(projects);
    return projects;
  },

  get(id) {
    return this.read().find((item) => item.id === id);
  }
};
