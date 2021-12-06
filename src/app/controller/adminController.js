const { ref, push } = require('firebase/database');

const { database } = require('../../database');

module.exports = {
  async index(request, response) {
    return response.render('admin', { footer: 0 });
  },
  async store(request, response) {
    const data = {
      company: request.body.company,
      calls: {
        db: true,
      },
      queueCalls: {
        nm: 0,
        pd: 0,
        queue_nm: ['NM00'],
        queue_pd: ['PD00'],
        db: true,
      },
    };
    push(ref(database, 'user_aqm/'), data);

    return response.redirect('/admin');
  },
};
