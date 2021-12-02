const { Router } = require('express');

const router = Router();

router.get('/', (request, response) =>
  response.render('home', { pathanme: '/' }),
);
router.get('/call', (request, response) =>
  response.render('call', { pathanme: '/call' }),
);
router.get('/generate', (request, response) =>
  response.render('generate_record', { pathanme: '/generate' }),
);
router.get('/local', (request, response) =>
  request.query.l
    ? response.render('locals', { pathanme: '/local' })
    : response.render('local', { pathanme: '/local' }),
);
router.use('*', (req, res, next) => res.redirect('/'));

module.exports = router;
