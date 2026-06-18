var t; // DataTable instance

function initializeDataTable() {
  if ($.fn.dataTable.isDataTable('#prod-table')) {
    t = $('#prod-table').DataTable();
    t.destroy();
  }

  t = $('#prod-table').DataTable({
    language: {
      search: "Procurar:",
      info: 'A mostrar _START_ a _END_ de _TOTAL_ registos',
      infoEmpty: 'Sem ValueSets para mostrar',
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
      zeroRecords: 'Nenhum ValueSet encontrado'
    }
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
      var baseurl = config.server_url;
      var url = baseurl + '/ValueSet?_format=json&_count=20000';

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

    if (resource["resourceType"] == "ValueSet") {
      console.log(resource);

      var current_row = [];

      current_row.push('<b>' + (resource.title || resource.name || resource.id || '-') + '</b>');
      current_row.push('<b>' + (resource.version || '-') + '</b>');
      current_row.push(resource.description || '-');

      if (resource.expansion && resource.expansion.total) {
        current_row.push(resource.expansion.total);
      } else if (resource.expansion && resource.expansion.contains) {
        current_row.push(resource.expansion.contains.length);
      } else if (resource.count != null) {
        current_row.push(resource.count);
      } else {
        current_row.push('-');
      }

      current_row.push(
        '<a href="' + baseurl + '/ValueSet/' + resource.id + '">Ver</a>');
      current_row.push(
        '<a href="./visualiser/viz-index.html?url=' + baseurl + '/ValueSet/' + resource.id + '">Ver</a>');

      t.row.add(current_row);

      console.log(current_row);
      if (progressIndicator) {
        progressIndicator.innerText = 'A processar ValueSet ' + (i + 1) + ' de ' + totalCount + '...';
      }
    }
  }

  processingModal.style.display = 'none';
  if (progressIndicator) {
    progressIndicator.style.display = 'none';
  }

  t.draw();
}
