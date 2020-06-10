const { ipcRenderer } = require("electron");
const { $ } = require("./helper");
const path = require("path");
let musicFilePath = [];
$("selsect-music").addEventListener("click", () => {
  ipcRenderer.send("open-music-file");
});
$("add-music").addEventListener("click", () => {
  ipcRenderer.send("add-tracks", musicFilePath);
});

const renderListHtml = (paths) => {
  const musicList = $("musicList");
  const musicItemHtml = paths.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, "");
  musicList.innerHTML = `<ul class="list-group">${musicItemHtml}</ul>`;
};

ipcRenderer.on("selected-file", (event, path) => {
  if (Array.isArray(path.filePaths)) {
    musicFilePath = path.filePaths;
    renderListHtml(path.filePaths);
  }
});
