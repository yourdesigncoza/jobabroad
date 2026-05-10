import { initBotId } from 'botid/client/core';

initBotId({
  protect: [
    { path: '/api/search', method: 'POST' },
    { path: '/api/search/answer', method: 'POST' },
    { path: '/api/wiki/*', method: 'GET' },
  ],
});
