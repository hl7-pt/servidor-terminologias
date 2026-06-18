var t; // DataTable instance

// Function to initialize or reinitialize the DataTable
function initializeDataTable() {
  if ($.fn.dataTable.isDataTable('#prod-table')) {
    t = $('#prod-table').DataTable();
    t.destroy();
  }

  t = $('#prod-table').DataTable({
    language: {
      search: "Procurar:",
      info: 'A mostrar _START_ a _END_ de _TOTAL_ registos',
      infoEmpty: 'Sem ConceptMaps para mostrar',
      infoFiltered: ' - filtrado de _MAX_ registos',
      lengthMenu:
        'Mostrar <select>' +
        '<option value="10">10</option>' +
        '<option value="20">20</option>' +
        '<option value="30">30</option>' +
        '<option value="40">40</option>' +
        '<option value="50">50</option>' +
        '</select> registos',
      entries: {
        _: 'registos',
        1: 'Registo'
      },
      zeroRecords: 'Nenhum ConceptMap encontrado'
    }
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
      var baseurl = config.server_url;
      var url = baseurl + '/ConceptMap?_format=json&_count=20000';

      console.log(url);

      initializeDataTable();

      getDataToProcess(url, false)
        .then(data => processData(data, baseurl))
        .catch((error) => console.error('Error processing data:', error));
    })
    .catch((error) => console.error('Error fetching configuration:', error));
});

async function getDataToProcess(url, isBundleOfBundles) {
  const response = await fetch(url);
  const data = await response.json();

  if (!data.entry || data.entry.length === 0) {
    return [];
  }

  if (isBundleOfBundles) {
    return data.entry
      .map(bundle => bundle.resource.entry || [])
      .flat()
      .map(entry => entry.resource);
  } else {
    return data.entry.map(entry => entry.resource);
  }
}

async function processData(data, baseurl) {
  var processingModal = document.getElementById('processingModal');
  var progressIndicator = document.getElementById('progressIndicator');
  processingModal.style.display = 'block';

  var totalCount = data.length;
  console.log(totalCount);
  console.log(data);

  for (var i = 0; i < totalCount; i++) {
    var resource = data[i];

    if (resource["resourceType"] == "ConceptMap") {
      console.log(resource);

      var current_row = [];

      current_row.push(
        '<a href="' + baseurl + '/ConceptMap/' + data[i].id + '">' + data[i].id + '</a>');
      current_row.push(resource.title || resource.name || '-');

      var mappingCount = 0;
      if (resource.group && resource.group.length > 0) {
        for (var g = 0; g < resource.group.length; g++) {
          if (resource.group[g].element && resource.group[g].element.length) {
            mappingCount += resource.group[g].element.length;
          }
        }
      }
      current_row.push(mappingCount > 0 ? mappingCount : '-');

      current_row.push(
        '<a href="./visualiser/viz-index.html?url=' + baseurl + '/ConceptMap/' + data[i].id + '">Ver</a>');

      t.row.add(current_row);

      console.log(current_row);
      if (progressIndicator) {
        progressIndicator.innerText = 'A processar ConceptMap ' + (i + 1) + ' de ' + totalCount + '...';
      }
    }
  }

  processingModal.style.display = 'none';
  if (progressIndicator) {
    progressIndicator.style.display = 'none';
  }

  t.draw();
}
