/* eslint-env browser */
/* eslint no-undef: off */
/* eslint no-alert: off */
/* eslint no-implied-eval: off */

const id_queueCalls = localStorage.getItem('id_queueCalls');
const id_calls = localStorage.getItem('id_calls');
let tempo = 0;
const queue_ids_calls = [];
const database = firebase.database();
const locals = {
  guiche: 'guichê',
  consultorio: 'consultório',
};
const data_default = {
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
const audio = new Audio(
  'assets/sounds/salamisound-2028068-ding-dong-bell-doorbell.mp3',
);
const container = document.querySelector('#screen');
const visor_time = document.querySelector('#visor_time');

function createModelQueueCalls() {
  const getId_queueCalls = database
    .ref()
    .child('queueCalls')
    .push(data_default).key;
  localStorage.setItem('id_queueCalls', getId_queueCalls);

  const getId_calls = database
    .ref()
    .child('calls')
    .push({
      client: {
        local: 'GUICHÊ 00',
        pass: 'NM00',
      },
    }).key;
  localStorage.setItem('id_calls', getId_calls);
}

function startCountdown() {
  if (tempo - 0 >= 0) {
    let min = tempo / 60;
    let seg = tempo % 60;

    if (min <= 9) {
      min = `0${min}`;
      min = min.substr(0, 2);
    } else {
      min = parseInt(min, 10);
    }

    if (seg <= 9) {
      seg = `0${seg}`;
    }

    visor_time.innerText = `${min}:${seg}`;
    setTimeout(`startCountdown()`, 1000);
    tempo += 1;
  }
}

function cleanCallsDB(noAlert = false) {
  database
    .ref()
    .child(`calls/${id_calls}`)
    .remove()
    .then(() => (noAlert ? null : alert('Successfully clean.')))
    .catch(error => alert(`Clean failed: ${error.message}`));

  database
    .ref()
    .child(`queueCalls/${id_queueCalls}`)
    .remove()
    .then(() => (noAlert ? null : alert('Successfully clean.')))
    .catch(error => alert(`Clean failed: ${error.message}`));
}

function generateRecord(e) {
  database.ref(`queueCalls/${id_queueCalls}`).once('value', item => {
    const data_updated = item.val();

    if (e.target.id === 'generate_record_pd') {
      data_default.queue_pd[0].client.pass = `PD${
        data_updated.p >= 9
          ? (data_updated.p += 1)
          : `0${(data_updated.p += 1)}`
      }`;
      data_updated.queue_pd.push(data_default.queue_pd[0]);
      document.querySelector(
        '#pass',
      ).innerText = `Sua senha é: PD${data_updated.p}`;
    } else {
      data_default.queue_nm[0].client.pass = `NM${
        data_updated.n >= 9
          ? (data_updated.n += 1)
          : `0${(data_updated.n += 1)}`
      }`;
      data_updated.queue_nm.push(data_default.queue_nm[0]);
      document.querySelector(
        '#pass',
      ).innerText = `Sua senha é: NM${data_updated.n}`;
    }

    const updates = {};
    updates[`/queueCalls/${id_queueCalls}`] = data_updated;
    database
      .ref()
      .update(updates)
      .catch(() => {
        alert('not updated');
      });
  });
}

function nextCall(e) {
  database.ref(`queueCalls/${id_queueCalls}`).once('value', item => {
    const data_updated = item.val();
    const local = window.location.search.split('?')[1].split('l=')[1];
    const number = window.location.search.split('?')[2].split('n=')[1];
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

    document.querySelector(
      '#pass',
    ).innerText = `Senha chamada é: ${data[0].client.pass}`;

    data[0].client.local = `${local
      .replace(local, locals[local])
      .toLocaleUpperCase()} ${number}`;

    const updates = {};
    updates[`/queueCalls/${id_queueCalls}`] = data_updated;
    database
      .ref()
      .update(updates)
      .catch(() => {
        alert('not updated');
      });

    return database.ref().child(`calls/${id_calls}`).push(data[0]);
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

  if (pass.split('PD')[1]) {
    visor_pd.innerText = `${local} - ${pass}`;
  }
  visor_nm.innerText = `${local} - ${pass}`;

  const create = document.createElement('div');
  create.setAttribute('class', 'visor');

  function createInput(inputElementData) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('disabled', 'disabled');
    input.setAttribute('value', inputElementData);

    create.appendChild(input);
  }

  createInput(local);
  createInput(pass);

  container.appendChild(create);
  document.getElementsByClassName('visor')[0].remove();
  /* if (queue_ids_calls.length >= 7) {
    console.log(queue_ids_calls.length - 6);
    cleanCallsDB(`/calls/${queue_ids_calls[queue_ids_calls.length - 6]}`, true);
  } */
}

const clear_queue_db = document.querySelector('#clearQueue');
if (clear_queue_db) clear_queue_db.addEventListener('click', cleanCallsDB);

const next_nm_queue = document.querySelector('#next_nm');
if (next_nm_queue) next_nm_queue.addEventListener('click', nextCall);

const next_pd_queue = document.querySelector('#next_pd');
if (next_pd_queue) next_pd_queue.addEventListener('click', nextCall);

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
  database.ref(`calls/${id_calls}`).on('value', snapshot => {
    snapshot.forEach(item => {
      updateQueue(item).then(() => {
        audio.play();
      });
    });
  });
  startCountdown();
}
