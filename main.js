const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const DataStore = require("./renderer/MusicDataStore");
const myStore = new DataStore({ name: "Music Data" });

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    };
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow({}, "./renderer/index.html");
  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.send("getTracks", myStore.getTracks());
  });

  //打开添加音乐窗口
  ipcMain.on("add-music-window", (event, arg) => {
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
    // addWindow.webContents.openDevTools();
  });

  //导入音乐
  ipcMain.on("add-tracks", (event, tracks) => {
    const updateTracks = myStore.addTracks(tracks).getTracks();
    mainWindow.send("getTracks", updateTracks);
  });

  //删除音乐
  ipcMain.on("delete-track", (event, id) => {
    const updateTracks = myStore.delTrack(id).getTracks();
    mainWindow.send("getTracks", updateTracks);
  });

  //打开选择音乐的对话框
  ipcMain.on("open-music-file", (event) => {
    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3"] }],
      })
      .then((files) => {
        if (files) {
          event.sender.send("selected-file", files);
        }
      });
  });
});
