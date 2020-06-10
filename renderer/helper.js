exports.$ = (id) => {
  return document.getElementById(id);
};

exports.convertDuration = (time) => {
  //计算分总,小于10返回01，大于返回010
  const minutes = "0" + Math.floor(time / 60);

  //计算秒钟
  const second = "0" + Math.floor(time - minutes * 60);

  return minutes.substr(-2) + ":" + second.substr(-2);
};
