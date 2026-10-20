(() => {
  const cfg = window.RAMAIS_ADMIN_CONFIG || {};
  const apiBase = String(cfg.apiBase || '').replace(/\/$/, '');
  const $ = id => document.getElementById(id);
  let token = sessionStorage.getItem('ramaisAdminToken') || '';
  let database = null;
  let editingIndex = null;
  const schemas = {
    sads: {fields:['responsavel','ramal','departamento','piso'], labels:['Responsável','Ramal','Departamento','Piso'], name:'responsavel', phone:'ramal'},
    habitacao: {fields:['responsavel','ramal','departamento','piso'], labels:['Responsável','Ramal','Departamento','Piso'], name:'responsavel', phone:'ramal'},
    geral: {fields:['equipamento','endereco','telefone','coordenador'], labels:['Equipamento','Endereço','Telefone','Coordenador'], name:'equipamento', phone:'telefone'}
  };
  function status(message, kind='') { $('status').textContent = message; $('status').className = 'admin-status ' + kind; }
  function showApp(yes) { $('loginCard').classList.toggle('hidden',yes); $('app').classList.toggle('hidden',!yes); }
  async function request(path, options={}) {
    if (!apiBase || apiBase.includes('SUBSTITUA-PELA-URL')) throw new Error('Configure a URL do serviço no arquivo admin-config.js antes de usar o painel.');
    const headers = {'Content-Type':'application/json', ...(options.headers||{})};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(apiBase + path, {...options, headers});
    let payload = {}; try { payload = await response.json(); } catch {}
    if (!response.ok) { if (response.status === 401) { token=''; sessionStorage.removeItem('ramaisAdminToken'); showApp(false); } throw new Error(payload.error || `Falha na solicitação (${response.status}).`); }
    return payload;
  }
  async function loadData() { status('Carregando dados…'); const result=await request('/data'); database=result.data; showApp(true); updateSchema(); renderTable(); status('Dados carregados. As alterações só são publicadas quando você salva.','success'); }
  $('loginForm').addEventListener('submit', async e => { e.preventDefault(); try { status('Validando acesso…'); const result=await request('/login',{method:'POST',body:JSON.stringify({username:$('username').value,password:$('password').value})}); token=result.token; sessionStorage.setItem('ramaisAdminToken',token); await loadData(); } catch(err) { status(err.message,'error'); } });
  $('logoutBtn').addEventListener('click',()=>{token='';sessionStorage.removeItem('ramaisAdminToken');database=null;showApp(false);status('Sessão encerrada.');});
  $('section').addEventListener('change',()=>{editingIndex=null;resetForm();updateSchema();renderTable();});
  $('filterList').addEventListener('input',renderTable);
  $('newBtn').addEventListener('click',()=>{editingIndex=null;resetForm();});
  $('cancelEdit').addEventListener('click',()=>{editingIndex=null;resetForm();});
  function updateSchema() {
    const general=$('section').value==='geral';
    $('nameLabel').firstChild.textContent=general?'Equipamento':'Responsável'; $('nameField').placeholder=general?'Ex.: Elevador':'Ex.: Maria Silva';
    $('phoneLabel').firstChild.textContent=general?'Telefone':'Ramal'; $('phoneField').placeholder=general?'Telefone':'Ex.: 123';
    $('deptLabel').firstChild.textContent=general?'Endereço':'Departamento'; $('floorLabel').firstChild.textContent=general?'Coordenador':'Piso';
    $('floorLabel').classList.remove('hidden');
    $('formTitle').textContent=editingIndex===null?'Adicionar contato':'Editar contato';
    $('saveBtn').textContent=editingIndex===null?'Salvar contato':'Salvar alterações';
    $('cancelEdit').classList.toggle('hidden',editingIndex===null);
  }
  function resetForm() { $('contactForm').reset(); $('section').value=$('section').value; updateSchema(); }
  function currentContact() { const general=$('section').value==='geral'; const values=[$('nameField').value.trim(),$('phoneField').value.trim(),$('deptField').value.trim(),$('floorField').value.trim()]; if(general) return {equipamento:values[0],endereco:values[2],telefone:values[1],coordenador:values[3]}; return {responsavel:values[0],ramal:values[1],departamento:values[2],piso:values[3]}; }
  $('contactForm').addEventListener('submit',async e=>{e.preventDefault();if(!database)return;const section=$('section').value;const contact=currentContact();if(!contact[schemas[section].name]||!contact[schemas[section].phone]){status('Preencha o nome/equipamento e o ramal/telefone.','error');return;}const list=database[section];if(editingIndex===null) list.push(contact); else list[editingIndex]=contact;sortList(section);$('saveBtn').disabled=true;try{status('Salvando no GitHub…');const result=await request('/data',{method:'PUT',body:JSON.stringify({data:database})});database=result.data;editingIndex=null;resetForm();renderTable();status('Alterações salvas no ramais.json. O site público pode levar alguns instantes para atualizar.','success');}catch(err){status(err.message,'error');}finally{$('saveBtn').disabled=false;}});
  function sortList(section){const key=schemas[section].name;database[section].sort((a,b)=>String(a[key]||'').localeCompare(String(b[key]||''),'pt-BR',{sensitivity:'base'}));}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderTable(){if(!database)return;const section=$('section').value;sortList(section);const schema=schemas[section];$('tableHead').innerHTML='<tr>'+schema.labels.map(x=>`<th>${escapeHtml(x)}</th>`).join('')+'<th>Ações</th></tr>';const query=$('filterList').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');const rows=database[section].map((item,index)=>({item,index})).filter(({item})=>schema.fields.some(k=>String(item[k]||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').includes(query)));$('listCount').textContent=`${rows.length} de ${database[section].length} registros`;const tbody=$('tableBody');tbody.replaceChildren();for(const {item,index} of rows){const tr=document.createElement('tr');for(const key of schema.fields){const td=document.createElement('td');td.textContent=item[key]||'';tr.append(td);}const td=document.createElement('td');const edit=document.createElement('button');edit.className='admin-btn secondary';edit.textContent='Editar';edit.type='button';edit.addEventListener('click',()=>editItem(index));const del=document.createElement('button');del.className='admin-btn danger';del.textContent='Excluir';del.type='button';del.addEventListener('click',()=>deleteItem(index));td.append(edit,del);tr.append(td);tbody.append(tr);}}
  function editItem(index){const section=$('section').value;const item=database[section][index];editingIndex=index;const general=section==='geral';$('nameField').value=item[general?'equipamento':'responsavel']||'';$('phoneField').value=item[general?'telefone':'ramal']||'';$('deptField').value=item[general?'endereco':'departamento']||'';$('floorField').value=item[general?'coordenador':'piso']||'';updateSchema();$('formTitle').scrollIntoView({behavior:'smooth',block:'center'});}
  async function deleteItem(index){const section=$('section').value;const item=database[section][index];const schema=schemas[section];if(!confirm(`Excluir “${item[schema.name]}”? Essa alteração será gravada no JSON do GitHub.`))return;const backup=JSON.parse(JSON.stringify(database));database[section].splice(index,1);try{status('Salvando exclusão no GitHub…');const result=await request('/data',{method:'PUT',body:JSON.stringify({data:database})});database=result.data;renderTable();status('Registro excluído e JSON atualizado.','success');}catch(err){database=backup;renderTable();status(err.message,'error');}}
  if(token) loadData().catch(err=>{showApp(false);status(err.message,'error');});
})();
