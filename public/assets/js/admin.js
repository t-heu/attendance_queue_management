const database = firebase.database();

function createAccCompany() {
  database
    .ref()
    .child('user_aqm')
    .push({
      company: 'meu e teu',
      calls: {
        db: true
      },
      queueCalls: {
        nm: 0,
        pd: 0,
        queue_nm: ['NM00'],
        queue_pd: ['PD00'],
        db: true
      }
    });
}