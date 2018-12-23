var chokidar = require('chokidar')
var watcher = null;
var ready = false;
var logger = require("../log");
var watchPath = require("../ModulesPath")
var ProcessLoader = require("../data/ProcessLoader")

  function addFileListener(path) {
    if (ready) {
      logger.info('File', path, 'has been added')
      if (path.indexOf(".service.js") == path.length - 11) {
        //增加服务
        ProcessLoader.reloadProcessFile(path);
      }
    }
  }
  function addDirecotryListener(path) {
    if (ready) {
      logger.info('Directory', path, 'has been added')
    }
  }

  function fileChangeListener(path) {
    logger.info('File', path, 'has been changed')
    if (path.indexOf(".service.js") == path.length - 11) {
      //修改服务
      ProcessLoader.reloadProcessFile(path);
    }
  }

  function fileRemovedListener(path) {
    logger.info('File', path, 'has been removed');
    if (path.indexOf(".service.js") == path.length - 11) {
      //删除服务
      ProcessLoader.deleteProcessFile(path);
    }
  }

  function directoryRemovedListener(path) {
    logger.info('Directory', path, 'has been removed')
  }

  if (!watcher) {
    watcher = chokidar.watch(watchPath)
  }
  watcher
    .on('add', addFileListener)
    .on('addDir', addDirecotryListener)
    .on('change', fileChangeListener)
    .on('unlink', fileRemovedListener)
    .on('unlinkDir', directoryRemovedListener)
    .on('error', function (error) {
      logger.error(error);
    })
    .on('ready', function () {
      ready = true
    })

module.exports = watcher;