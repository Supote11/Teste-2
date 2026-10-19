const searchInput = document.getElementById("searchInput");
const table = document.getElementById("phoneTable");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const floorFilter = document.getElementById("floorFilter");
const departmentFilter = document.getElementById("departmentFilter");

if (searchInput && table) {
  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  const normalize = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

  function filterRows() {
    const query = normalize(searchInput.value.trim());
    const floor = floorFilter?.value ?? "";
    const department = departmentFilter?.value ?? "";
    let visible = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const matches = normalize(row.textContent).includes(query)
        && (!floor || cells[3]?.textContent.trim() === floor)
        && (!department || cells[2]?.textContent.trim() === department);
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    resultCount.textContent = `${visible} ${visible === 1 ? "resultado" : "resultados"}`;
    emptyState.hidden = visible !== 0;
  }

  function populateFilter(select, cellIndex, sourceRows = rows) {
    if (!select) return;
    const placeholder = select.options[0]?.textContent ?? "Todos";
    const options = [...new Set(sourceRows.map((row) => row.querySelectorAll("td")[cellIndex]?.textContent.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    const previousValue = select.value;
    select.replaceChildren(new Option(placeholder, ""));
    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
    if (options.includes(previousValue)) select.value = previousValue;
  }

  populateFilter(floorFilter, 3);
  function updateDepartments() {
    const selectedFloor = floorFilter?.value ?? "";
    const rowsForFloor = selectedFloor
      ? rows.filter((row) => row.querySelectorAll("td")[3]?.textContent.trim() === selectedFloor)
      : rows;
    populateFilter(departmentFilter, 2, rowsForFloor);
    filterRows();
  }

  floorFilter?.addEventListener("change", updateDepartments);
  departmentFilter?.addEventListener("change", filterRows);
  searchInput.addEventListener("input", filterRows);
  updateDepartments();
}
