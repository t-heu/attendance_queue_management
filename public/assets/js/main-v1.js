/* eslint-env browser */
/* global firebase */
/* eslint no-alert: off */
/* eslint no-implied-eval: off */

const id_aqm = localStorage.getItem('id_aqm');
const database = firebase.database();
const locals = {
  guiche: 'guichê',
  consultorio: 'consultório',
};
const audio = new Audio(
  'assets/sounds/salamisound-2028068-ding-dong-bell-doorbell.mp3',
);
let tempo = 0;
const container = document.querySelector('#screen');
const visor_time = document.querySelector('#visor_time');

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

function cleanCallsDB() {
  database.ref(`user_aqm/${id_aqm}`).once('value', item => {
    const data_updated = item.val();
    
    data_updated.calls = null;
    data_updated.calls = {
      db: true,
    };
    data_updated.queueCalls.nm = 0;
    data_updated.queueCalls.pd = 0;
    data_updated.queueCalls.queue_nm = ['NM00'];
    data_updated.queueCalls.queue_pd = ['PD00'];

    const updates = {};
    updates[`/user_aqm/${id_aqm}`] = data_updated;
    database
      .ref()
      .update(updates)
      .catch(() => {
        alert('not updated');
      });
  }).catch((err) => alert(err));
}

function generateRecord(e) {
  database.ref(`user_aqm/${id_aqm}/queueCalls`).once('value', item => {
    const data_updated = item.val();
    
    if (e.target.id === 'generate_record_pd') {
      data_updated.queue_pd.push(
        `PD${
          data_updated.pd >= 9
            ? (data_updated.pd += 1)
            : `0${(data_updated.pd += 1)}`
        }`,
      );
      alert(`Sua senha é: PD${data_updated.pd}`);
    } else {
      data_updated.queue_nm.push(
        `NM${
          data_updated.nm >= 9
            ? (data_updated.nm += 1)
            : `0${(data_updated.nm += 1)}`
        }`,
      );
      alert(`Sua senha é: NM${data_updated.nm}`);
    }

    const updates = {};
    updates[`/user_aqm/${id_aqm}/queueCalls`] = data_updated;
    database
      .ref()
      .update(updates)
      .catch(() => {
        alert('not updated');
      });
  }).catch((err) => alert(err));
}

function nextCall(e) {
  let tempo2 = 0;
  function startCountdownLocal() {
    if (tempo2 - 0 >= 0) {
      let min = tempo2 / 60;
      let seg = tempo2 % 60;

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
      setTimeout(`startCountdownLocal()`, 1000);
      tempo2 += 1;
    }
  }

  database.ref(`user_aqm/${id_aqm}/queueCalls`).once('value', item => {
    const data_updated = item.val();
    const local = window.location.search.split('?')[1].split('l=')[1];
    const number = window.location.search.split('?')[2].split('n=')[1];
    const data = {
      client: {
        local: `${local
          .replace(local, locals[local])
          .toLocaleUpperCase()} ${number}`,
        pass: '00',
      },
    };

    if (e.target.id === 'next_nm') {
      if (!(data_updated.queue_nm.length >= 2)) {
        return alert('Sem fila');
      }
      const [pass] = data_updated.queue_nm.splice(1, 1);
      data.client.pass = pass;
    } else {
      if (!(data_updated.queue_pd.length >= 2)) {
        return alert('Sem fila');
      }
      const [pass] = data_updated.queue_pd.splice(1, 1);
      data.client.pass = pass;
    }

    document.querySelector('#pass').innerText = data.client.pass;
    tempo2 = 0;
    startCountdownLocal();

    const updates = {};
    updates[`/user_aqm/${id_aqm}/queueCalls`] = data_updated;
    database
      .ref()
      .update(updates)
      .catch(() => {
        alert('not updated');
      });

    return database.ref().child(`user_aqm/${id_aqm}/calls`).push(data);
  });
}

async function updateQueue(data) {
  const visor_nm = document.querySelector('#visor_nm');
  const visor_pd = document.querySelector('#visor_pd');
  tempo = 0;

  if (data.val().length === 0) return;

  const { client } = data.val();
  const { local, pass } = client;

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
}

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

const clear_queue_db = document.querySelector('#clearQueue');
if (clear_queue_db) clear_queue_db.addEventListener('click', cleanCallsDB);

const form_id_aqm = document.querySelector('#form_id_aqm');
if (form_id_aqm) {
  if (id_aqm) {
    document.querySelector('#form_id_aqm').style.display = 'none';
  }
  form_id_aqm.addEventListener('click', (e) => {
    e.preventDefault();
    const camp_id = document.querySelector('.campId');
    localStorage.setItem('id_aqm', camp_id.value);
    document.location.reload();
  });
}

if (container) {
  database.ref(`user_aqm/${id_aqm}/calls`).on('value', snapshot => {
    snapshot.forEach(item => {
      updateQueue(item).then(() => {
        audio.play();
      });
    });
  });
  startCountdown();
}
