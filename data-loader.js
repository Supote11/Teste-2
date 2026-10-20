(() => {
  const section = document.body.dataset.section;
  const table = document.getElementById('phoneTable');
  const tbody = document.getElementById('phoneTableBody');
  const searchInput = document.getElementById('searchInput');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const floorFilter = document.getElementById('floorFilter');
  const departmentFilter = document.getElementById('departmentFilter');
  const fields = section === 'geral'
    ? ['equipamento','endereco','telefone','coordenador']
    : ['responsavel','ramal','departamento','piso'];
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

  fetch('./ramais.json')
    .then(response => { if (!response.ok) throw new Error('Não foi possível carregar ramais.json'); return response.json(); })
    .then(database => {
      const sortKey = section === 'geral' ? 'equipamento' : 'responsavel';
      const contacts = [...(database[section] || [])].sort((a, b) => String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'pt-BR', { sensitivity: 'base' }));
      tbody.replaceChildren();
      for (const contact of contacts) {
        const tr = document.createElement('tr');
        for (const field of fields) {
          const td = document.createElement('td');
          td.dataset.label = ({responsavel:'Responsável',ramal:'Ramal',departamento:'Departamento',piso:'Piso',equipamento:'Equipamento',endereco:'Endereço',telefone:'Telefone',coordenador:'Coordenador'})[field];
          td.textContent = contact[field] ?? '';
          tr.append(td);
        }
        tbody.append(tr);
      }
      const rows = Array.from(tbody.querySelectorAll('tr'));
      function populateFilter(select, field) {
        if (!select) return;
        const label = field === 'piso' ? 'Todos os pisos' : 'Todos os departamentos';
        const values = [...new Set(contacts.map(c => c[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}));
        select.replaceChildren(new Option(label,''), ...values.map(v=>new Option(v,v)));
      }
      if (section !== 'geral') { populateFilter(floorFilter,'piso'); populateFilter(departmentFilter,'departamento'); }
      function filterRows() {
        const q = normalize(searchInput?.value.trim() || '');
        const floor = floorFilter?.value || '';
        const dept = departmentFilter?.value || '';
        let visible = 0;
        rows.forEach((row, i) => {
          const contact = contacts[i];
          const matches = normalize(Object.values(contact).join(' ')).includes(q) && (!floor || contact.piso === floor) && (!dept || contact.departamento === dept);
          row.hidden = !matches;
          if (matches) visible++;
        });
        if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'resultado' : 'resultados'}`;
        if (emptyState) emptyState.hidden = visible !== 0;
      }
      searchInput?.addEventListener('input', filterRows);
      floorFilter?.addEventListener('change', filterRows);
      departmentFilter?.addEventListener('change', filterRows);
      filterRows();
    })
    .catch(error => {
      console.error(error);
      if (resultCount) resultCount.textContent = 'Erro ao carregar os dados. Abra pelo run.bat.';
      if (emptyState) { emptyState.hidden = false; emptyState.textContent = 'Não foi possível carregar ramais.json. Inicie o site pelo arquivo run.bat.'; }
    });
})();
