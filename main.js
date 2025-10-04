const SUPABASE_URL = "https://imcdogitkzynrxcfgezw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY2RvZ2l0a3p5bnJ4Y2ZnZXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODM1NDcsImV4cCI6MjA3NTE1OTU0N30.5wSCcFEkOraoWOFkOY8BSfu-lrTzUiyzOTihUTEz03w";

function show(msg){ const out=document.getElementById('result'); out.textContent=msg; console.log(msg); }

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
      ...(opts.headers || {})
    }
  });
  if(!res.ok){
    const t = await res.text();
    throw new Error(`DB ${res.status}: ${t}`);
  }
  return res.json();
}

async function uploadFile(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const storageBase = SUPABASE_URL.replace('/rest/v1','');
  const url = `${storageBase}/storage/v1/object/submissions/${encodeURIComponent(fileName)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      // 'x-upsert': 'true' // uncomment if you ever re-upload same filename
    },
    body: file
  });
  if(!res.ok){
    const t = await res.text();
    throw new Error(`UPLOAD ${res.status}: ${t}`);
  }
  return `${storageBase}/storage/v1/object/public/submissions/${encodeURIComponent(fileName)}`;
}

async function createSubmission({ file_url, message }) {
  return sb('submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ file_url, message }])
  });
}

async function fetchQueue() {
  return sb('submissions?select=*&status=in.(pending,accepted)&order=created_at.desc', { method: 'GET' });
}

function esc(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

async function renderQueue() {
  try{
    const items = await fetchQueue();
    const wrap = document.getElementById('queue');
    wrap.innerHTML = items.map(it => `
      <div class="card">
        <div><b>${it.status?.toUpperCase?.() || 'PENDING'}</b> —
        <small>${new Date(it.created_at).toLocaleString()}</small></div>
        ${/\.mp3(\?|$)/i.test(it.file_url) ? `<audio controls style="width:100%" src="${it.file_url}"></audio>` :
          `<p><a href="${it.file_url}" target="_blank">Open file</a></p>`}
        <p>${esc(it.message)}</p>
      </div>
    `).join('') || '<p><i>No items yet.</i></p>';
  }catch(e){
    show(e.message);
  }
}

document.getElementById('submitBtn').addEventListener('click', async () => {
  const file = document.getElementById('file').files[0];
  const message = document.getElementById('message').value.trim();
  if(!file){ return show('Pick a file first.'); }
  try{
    show('Uploading...');
    const url = await uploadFile(file);
    show('Saving to queue...');
    await createSubmission({ file_url: url, message });
    document.getElementById('file').value = '';
    document.getElementById('message').value = '';
    await renderQueue();
    show('Done ✅');
  }catch(e){
    show(e.message);
  }
});

renderQueue();
