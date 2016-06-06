'use strict';

const debug = require('debug')('manageServer');

module.exports = returnManageServer;

/**
 * returnManageServer - Module to provide methods for before and after to start and close the server
 *  
 * @param  {type} server the server that is listening  
 * @param  {type} port   the port that the server should be listening on 
 * @return {object}      the module object that contains the before and after methods
 */ 
function returnManageServer(server, port) {
  return {
    checkIfServerRunningBeforeTests(done) {
      debug('checkIfServerRunningBeforeTests');
      if (!server.isRunning) {
        debug('server was not running');
        return server.listen(port, () => {
          debug(`Server listening on ${port}`);
          server.isRunning = true;
          return done();
        });
      } 
      debug('server was running, calling done');
      return done();
    },
    closeServerAfterTests(done) {
      debug('closeServerAfterTests');
      if (server.isRunning) {
        return server.close(() => {
          debug('Server closed');
          server.isRunning = false;
          return done();
        });
      }
      return done();
    }
  };
}
