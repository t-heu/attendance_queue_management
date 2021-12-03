/* eslint-env browser */
/* eslint no-undef: off */
/* eslint no-alert: off */
/* eslint no-implied-eval: off */

const id = localStorage.getItem('id_aqm');
let tempo = 0;
const queue_ids_calls = [];
const audio = new Audio(
  'assets/sounds/salamisound-2028068-ding-dong-bell-doorbell.mp3',
);
const container = document.querySelector('#screen');
const visor_time = document.querySelector('#visor_time');
const database = firebase.database();

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (!firebaseUser) {
    firebase
      .auth()
      .signInWithEmailAndPassword('teste@teste.com', '123456')
      .catch(err => alert(err));
  }
});

function createModelQueueCalls() {
  const data = {
    n: 0,
    p: 0,
    queue_nm: [
      {
        client: {
          local: 'GUICHÊ 00',
          pass: 'NM00',
        },
      },
    ],
    queue_pd: [
      {
        client: {
          local: 'GUICHÊ 00',
          pass: 'PD00',
        },
      },
    ],
  };
  const getId = database.ref().child('queueCalls').push(data).key;
  localStorage.setItem('id_aqm', getId);
}

function startCountdown() {
  // Se o tempo não for zerado
  if (tempo - 0 >= 0) {
    let min = Number(tempo / 60);

    let seg = tempo % 60;
    // Formata o número menor que dez, ex: 08, 07, ...
    if (min < 10) {
      min = `0${min}`;
      min = min.substr(0, 2);
    }

    if (seg <= 9) {
      seg = `0${seg}`;
    }

    horaImprimivel = `${min}:${seg}`;

    visor_time.innerText = horaImprimivel;

    // 1000ms = 1 segundo
    setTimeout(`startCountdown()`, 1000);

    tempo += 1;
  }
}

function clearDB(e) {
  const dbDel = database.ref().child('calls');

  dbDel
    .remove()
    .then(() => (!e ? null : alert('Remove succeeded.')))
    .catch(error => alert(`Remove failed: ${error.message}`));
}

function generateRecord(e) {
  firebase
    .database()
    .ref(`queueCalls/${id}`)
    .once('value', item => {
      const data_updated = item.val();
      const data_default = {
        client: {
          local: 'GUICHÊ 00',
          pass:
            e.target.id === 'generate_record_nm'
              ? `NM${
                  data_updated.n >= 10
                    ? (data_updated.n += 1)
                    : `0${(data_updated.n += 1)}`
                }`
              : `PD${
                  data_updated.p >= 10
                    ? (data_updated.p += 1)
                    : `0${(data_updated.p += 1)}`
                }`,
        },
      };

      if (e.target.id === 'generate_record_nm') {
        data_updated.queue_nm.push(data_default);
      } else {
        data_updated.queue_pd.push(data_default);
      }

      if (id) {
        const updates = {};
        updates[`/queueCalls/${id}`] = data_updated;
        database
          .ref()
          .update(updates)
          .catch(() => {
            alert('not updated');
          });
      }
    });
}

function nextCall(e) {
  database.ref(`queueCalls/${id}`).once('value', item => {
    const data_updated = item.val();
    let element;
    let data;

    if (e.target.id === 'next_nm') {
      element = data_updated.queue_nm;
      if (!(element.length >= 2)) {
        return alert('Sem fila');
      }
      data = element.splice(1, 1);
      data_updated.queue_nm = element;
    } else {
      element = data_updated.queue_pd;
      if (!(element.length >= 2)) {
        return alert('Sem fila');
      }
      data = element.splice(1, 1);
      data_updated.queue_pd = element;
    }

    data[0].client.local = `${window.location.search
      .split('?')[1]
      .split('l=')[1]
      .replace('guiche', 'GUICHÊ')
      .toLocaleUpperCase()} ${
      window.location.search.split('?')[2].split('n=')[1]
    }`;

    if (id) {
      const updates = {};
      updates[`/queueCalls/${id}`] = data_updated;
      database
        .ref()
        .update(updates)
        .catch(() => {
          alert('not updated');
        });
    }

    return database.ref().child('calls').push(data[0]);
  });
}

async function updateQueue(data) {
  const visor_nm = document.querySelector('#visor_nm');
  const visor_pd = document.querySelector('#visor_pd');
  tempo = 0;

  if (data.val().length === 0) return;

  const { client } = data.val();
  const { local, pass } = client;
  queue_ids_calls.push(data.key);

  if (visor_nm && visor_pd) {
    if (pass.split('PD')[1]) {
      visor_pd.innerText = `${local} - ${pass}`;
    }
    visor_nm.innerText = `${local} - ${pass}`;
  }

  const create = document.createElement('div');
  create.setAttribute('class', 'visor');

  const input1 = document.createElement('input');
  input1.setAttribute('type', 'text');
  input1.setAttribute('disabled', 'disabled');
  input1.setAttribute('value', local);

  const input2 = document.createElement('input');
  input2.setAttribute('type', 'text');
  input2.setAttribute('disabled', 'disabled');
  input2.setAttribute('value', pass);

  create.appendChild(input1);
  create.appendChild(input2);
  container.appendChild(create);

  document.getElementsByClassName('visor')[0].remove();
}

const clear_queue = document.querySelector('#clearQueue');
if (clear_queue) clear_queue.addEventListener('click', clearDB);

const next_nm = document.querySelector('#next_nm');
if (next_nm) next_nm.addEventListener('click', nextCall);

const next_pd = document.querySelector('#next_pd');
if (next_pd) next_pd.addEventListener('click', nextCall);

const generate_record_nm = document.querySelector('#generate_record_nm');
if (generate_record_nm)
  generate_record_nm.addEventListener('click', generateRecord);

const generate_record_pd = document.querySelector('#generate_record_pd');
if (generate_record_pd)
  generate_record_pd.addEventListener('click', generateRecord);

const createModel_QueueCalls = document.querySelector(
  '#createModel_QueueCalls',
);
if (createModel_QueueCalls)
  createModel_QueueCalls.addEventListener('click', createModelQueueCalls);

if (container) {
  database.ref('calls').on('value', snapshot => {
    snapshot.forEach(item => {
      updateQueue(item).then(() => {
        audio.play();
        if (queue_ids_calls.length >= 7) {
          const dbDel = firebase
            .database()
            .ref()
            .child(`/calls/${queue_ids_calls[0]}`);

          dbDel.remove().catch(error => {
            alert(`Remove failed: ${error.message}`);
          });
        }
      });
    });
  });
  startCountdown();
}
