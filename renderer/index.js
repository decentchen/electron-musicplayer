const { ipcRenderer } = require("electron");
const { $, convertDuration } = require("./helper");
let musicAudio = new Audio();
let allTracks = [];
let currentTrack = {};
$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
});

//正在播放的音乐
const rendererPlayerHtml = (name, duration) => {
  const player = $("player-status");
  const html = `<div class="col font-weight-bold">
    正在播放:${name}
    </div>
    <div class="col">
        <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
    </div>`;
  player.innerHTML = html;
};

const updateProcessHtml = (currentTime, duration) => {
  //计算进度条
  const progress = Math.floor((currentTime / duration) * 100);
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
};
musicAudio.addEventListener("loadedmetadata", () => {
  //开始渲染播放器状态
  rendererPlayerHtml(currentTrack.fileName, musicAudio.duration);
});

musicAudio.addEventListener("timeupdate", () => {
  //更新播放器状态
  updateProcessHtml(musicAudio.currentTime, musicAudio.duration);
});
//得到通知后渲染视图
ipcRenderer.on("getTracks", (event, tracks) => {
  allTracks = tracks;
  rendererListHtml(tracks);
});

const rendererListHtml = (tracks) => {
  const trackList = $("trackList");
  const trackListHtml = tracks.reduce((html, track, index) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
        <div class="col-10">
        <i class="fas fa-music mr-2 text-secondary"></i>
        <b>${track.fileName}</b>
        </div>
        <div class="col-2">
        <i class="fas fa-play mr-3" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
        </div>
        </li>`;
    return html;
  }, "");
  const emptyTrack = `<div class="alert alert-primary">还没有添加任何音乐</div>`;
  trackList.innerHTML = tracks.length
    ? `<ul class="list-group">${trackListHtml}</ul>`
    : emptyTrack;
};

$("trackList").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;
  if (id && classList.contains("fa-play")) {
    //开始播放音乐
    if (currentTrack && currentTrack.id === id) {
      //继续播放音乐
      musicAudio.play();
    } else {
      //播放新的音乐
      currentTrack = allTracks.find((track) => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();
      const resetIcon = document.querySelector(".fa-pause");
      if (resetIcon) {
        resetIcon.classList.replace("fa-pause", "fa-play");
      }
    }
    classList.replace("fa-play", "fa-pause");
  } else if (id && classList.contains("fa-pause")) {
    //这里处理暂停逻辑
    musicAudio.pause();
    classList.replace("fa-pause", "fa-play");
  } else if (id && classList.contains("fa-trash-alt")) {
    //这里处理删除逻辑
    ipcRenderer.send("delete-track", id);
  }
});
