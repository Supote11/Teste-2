(() => {
  const $ = id => document.getElementById(id);
  let credentials = null, database = null, editingIndex = null, githubToken = null, fileSha = null, saving = false;
  const GITHUB_OWNER = 'Supote11';
  const GITHUB_REPO = 'Teste-2';
  const GITHUB_BRANCH = 'main';
  const DATA_PATH = 'ramais.json';
  const githubApi = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`;
  const schemas = {
    sads: {fields:['responsavel','ramal','departamento','piso'], labels:['Responsável','Ramal','Departamento','Piso'], name:'responsavel', phone:'ramal'},
    habitacao: {fields:['responsavel','ramal','departamento','piso'], labels:['Responsável','Ramal','Departamento','Piso'], name:'responsavel', phone:'ramal'},
    geral: {fields:['local','endereco','telefone','responsavel'], labels:['Local','Endereço','Telefone','Responsável'], name:'local', phone:'telefone'}
  };
  function status(message, kind='') { $('status').textContent=message; $('status').className='admin-status '+kind; }
  function showApp(yes) { $('loginCard').classList.toggle('hidden',yes); $('app').classList.toggle('hidden',!yes); }
  async function loadJSON(path) { const r=await fetch(path+'?v='+Date.now(),{cache:'no-store'}); if(!r.ok) throw new Error('Não foi possível carregar '+path+'. Confira se o arquivo existe na raiz do repositório.'); return r.json(); }
  async function start() { try { credentials=await loadJSON('admin.json'); } catch(e) { console.error(e); const msg=document.createElement('p');msg.className='admin-status error';msg.textContent='Não foi possível ler admin.json. Confirme que ele está na raiz do site publicado.';$('loginCard').append(msg); } }
  $('loginForm').addEventListener('submit', async e=>{e.preventDefault();if(!credentials){status('Arquivo admin.json não carregado.','error');return;}if($('username').value===credentials.username && $('password').value===credentials.password){githubToken=$('githubToken').value.trim();if(!githubToken){status('Informe o token do GitHub.','error');return;}try{const response=await fetch(githubApi,{headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${githubToken}`,'X-GitHub-Api-Version':'2022-11-28'}});if(!response.ok)throw new Error(response.status===401?'Token inválido ou expirado.':response.status===404?'Arquivo ramais.json não encontrado no repositório/branch configurado.':'Falha ao acessar o GitHub (HTTP '+response.status+').');const file=await response.json();fileSha=file.sha;database=JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\s/g,'')))));Object.keys(schemas).forEach(sortList);showApp(true);updateSchema();renderTable();status('Login aceito. Conectado ao GitHub; salvar enviará o JSON diretamente ao repositório.','success');}catch(err){githubToken=null;status('Não foi possível conectar: '+err.message,'error');}}else status('Usuário ou senha incorretos.','error');});
  $('logoutBtn').addEventListener('click',()=>{database=null;editingIndex=null;githubToken=null;fileSha=null;$('githubToken').value='';showApp(false);$('password').value='';status('Sessão encerrada.');});
  $('section').addEventListener('change',()=>{editingIndex=null;resetForm();updateSchema();renderTable();});$('filterList').addEventListener('input',renderTable);$('newBtn').addEventListener('click',()=>{editingIndex=null;resetForm();});$('cancelEdit').addEventListener('click',()=>{editingIndex=null;resetForm();});
  function updateSchema(){const general=$('section').value==='geral';$('nameLabel').firstChild.textContent=general?'Local':'Responsável';$('nameField').placeholder=general?'Ex.: CRAS Jardim Belval':'Ex.: Maria Silva';$('phoneLabel').firstChild.textContent=general?'Telefone':'Ramal';$('phoneField').placeholder=general?'Telefone':'Ex.: 123';$('deptLabel').firstChild.textContent=general?'Endereço':'Departamento';$('floorLabel').firstChild.textContent=general?'Responsável':'Piso';$('formTitle').textContent=editingIndex===null?'Adicionar contato':'Editar contato';$('saveBtn').textContent=editingIndex===null?'Adicionar à lista':'Salvar alterações';$('cancelEdit').classList.toggle('hidden',editingIndex===null);}
  function resetForm(){$('contactForm').reset();updateSchema();}
  function currentContact(){const general=$('section').value==='geral';const v=[$('nameField').value.trim(),$('phoneField').value.trim(),$('deptField').value.trim(),$('floorField').value.trim()];return general?{local:v[0],endereco:v[2],telefone:v[1],responsavel:v[3]}:{responsavel:v[0],ramal:v[1],departamento:v[2],piso:v[3]};}
  $('contactForm').addEventListener('submit',e=>{e.preventDefault();if(!database)return;const section=$('section').value,contact=currentContact(),schema=schemas[section];if(!contact[schema.name]||!contact[schema.phone]){status('Preencha nome/local e ramal/telefone.','error');return;}if(editingIndex===null)database[section].push(contact);else database[section][editingIndex]=contact;sortList(section);editingIndex=null;resetForm();renderTable();status('Alteração feita no formulário. Clique em “Salvar no GitHub” para publicar no repositório.','success');});
  function sortList(section){const key=schemas[section].name;if(database&&Array.isArray(database[section]))database[section].sort((a,b)=>String(a[key]||'').localeCompare(String(b[key]||''),'pt-BR',{sensitivity:'base'}));}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderTable(){if(!database)return;const section=$('section').value,schema=schemas[section];sortList(section);$('tableHead').innerHTML='<tr>'+schema.labels.map(x=>`<th>${esc(x)}</th>`).join('')+'<th>Ações</th></tr>';const q=$('filterList').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');const rows=database[section].map((item,index)=>({item,index})).filter(({item})=>schema.fields.some(k=>String(item[k]||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').includes(q)));$('listCount').textContent=`${rows.length} de ${database[section].length} registros`;const tbody=$('tableBody');tbody.replaceChildren();for(const {item,index} of rows){const tr=document.createElement('tr');for(const key of schema.fields){const td=document.createElement('td');td.textContent=item[key]||'';tr.append(td);}const td=document.createElement('td');const edit=document.createElement('button');edit.className='admin-btn secondary';edit.textContent='Editar';edit.type='button';edit.addEventListener('click',()=>editItem(index));const del=document.createElement('button');del.className='admin-btn danger';del.textContent='Excluir';del.type='button';del.addEventListener('click',()=>deleteItem(index));td.append(edit,del);tr.append(td);tbody.append(tr);}}
  function editItem(index){const section=$('section').value,item=database[section][index],general=section==='geral';editingIndex=index;$('nameField').value=item[general?'local':'responsavel']||'';$('phoneField').value=item[general?'telefone':'ramal']||'';$('deptField').value=item[general?'endereco':'departamento']||'';$('floorField').value=item[general?'responsavel':'piso']||'';updateSchema();$('formTitle').scrollIntoView({behavior:'smooth',block:'center'});}
  function deleteItem(index){const section=$('section').value,item=database[section][index],schema=schemas[section];if(!confirm(`Excluir “${item[schema.name]}”? Será necessário clicar em Salvar no GitHub para confirmar a exclusão.`))return;database[section].splice(index,1);renderTable();status('Registro removido do formulário. Clique em “Salvar no GitHub” para confirmar a exclusão.','success');}
  $('saveGithubBtn').addEventListener('click', async()=>{
    if(!database || !githubToken || saving)return;
    if(!confirm('Enviar as alterações de ramais.json diretamente para Supote11/Teste-2?'))return;
    saving=true;$('saveGithubBtn').disabled=true;status('Salvando no GitHub…');
    try{
      Object.keys(schemas).forEach(sortList);
      const latest=await fetch(githubApi,{headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${githubToken}`,'X-GitHub-Api-Version':'2022-11-28'}});
      if(!latest.ok)throw new Error('Não foi possível verificar a versão atual do JSON (HTTP '+latest.status+').');
      const latestFile=await latest.json();
      const payload={message:'Atualiza ramais pelo painel administrativo',content:btoa(unescape(encodeURIComponent(JSON.stringify(database,null,2)+'\n'))),sha:latestFile.sha,branch:GITHUB_BRANCH};
      const response=await fetch(githubApi,{method:'PUT',headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${githubToken}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.message||'GitHub recusou a gravação (HTTP '+response.status+').');
      fileSha=result.content?.sha||null;status('Salvo diretamente no GitHub! O commit foi criado. O site público pode levar alguns minutos para refletir a atualização.','success');
    }catch(err){status('Falha ao salvar: '+err.message,'error');}
    finally{saving=false;$('saveGithubBtn').disabled=false;}
  });
  $('downloadBtn').addEventListener('click',()=>{if(!database)return;Object.keys(schemas).forEach(sortList);const blob=new Blob([JSON.stringify(database,null,2)+'\n'],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ramais.json';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);status('JSON baixado. Agora substitua ramais.json no GitHub e confirme o commit.','success');});
  start();
})();
