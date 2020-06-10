const Store = require("electron-store");
const uuid = require("uuid/dist/v4");
const path = require("path");

class DataStore extends Store {
  constructor(settings) {
    super(settings);
    this.tracks = [];
  }

  saveTracks() {
    this.set("tracks", this.tracks);
    return this;
  }

  getTracks() {
    return this.get("tracks") || [];
  }
  delTrack(id) {
    this.tracks = this.tracks.filter((item) => item.id !== id);
    return this.saveTracks();
  }
  addTracks(tracks) {
    const trackWithProps = tracks
      .map((track) => {
        return {
          id: uuid.default(),
          path: track,
          fileName: path.basename(track),
        };
      })
      .filter((track) => {
        const currentTrackPath = this.getTracks().map((track) => track.path);
        return currentTrackPath.indexOf(track.path) < 0;
      });
    this.tracks = [...this.tracks, ...trackWithProps];
    return this.saveTracks();
  }
}

module.exports = DataStore;
