const { Router } = require('express');

const { firebaseConfig } = require('./database');

const adminController = require('./app/controller/adminController');

const authenticationBasic = require('./app/middlewares/auth');

const router = Router();

router.get('/', (request, response) =>
  response.render('home', { footer: 0, firebaseConfig }),
);
router.get('/call', (request, response) =>
  response.render('call', { footer: 1, firebaseConfig }),
);
router.get('/generate', (request, response) =>
  response.render('generate_record', { footer: 0, firebaseConfig }),
);
router.get('/local', (request, response) => {
  const { l } = request.query;

  if (l) {
    const local = l.split('?')[0];
    const number = l.split('?')[1].split('n=')[1];
    const name_local = `${local.toLocaleUpperCase()} ${number}`;
    return response.render('locals', { footer: 2, firebaseConfig, name_local });
  }

  return response.render('local', { footer: 0, firebaseConfig });
});
router.get('/admin', authenticationBasic, adminController.index);
router.post('/admin', authenticationBasic, adminController.store);
router.use('*', (req, res, next) => res.redirect('/'));

module.exports = router;
