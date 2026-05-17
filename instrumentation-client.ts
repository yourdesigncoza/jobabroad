import { initBotId } from 'botid/client/core';

initBotId({
  protect: [
    { path: '/api/search', method: 'POST' },
    { path: '/api/search/answer', method: 'POST' },
    { path: '/api/wiki/*', method: 'GET' },
    { path: '/register', method: 'POST' },
    { path: '/api/payments/checkout', method: 'POST' },
    { path: '/api/booking/consent', method: 'POST' },
    { path: '/api/follow-up/send', method: 'POST' },
  ],
});
