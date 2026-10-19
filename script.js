const searchInput = document.getElementById("searchInput");
const table = document.getElementById("phoneTable");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

if (searchInput && table) {
  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  const normalize = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

  function filterRows() {
    const query = normalize(searchInput.value.trim());
    let visible = 0;

    rows.forEach((row) => {
      const matches = normalize(row.textContent).includes(query);
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    resultCount.textContent = `${visible} ${visible === 1 ? "resultado" : "resultados"}`;
    emptyState.hidden = visible !== 0;
  }

  searchInput.addEventListener("input", filterRows);
  filterRows();
}
