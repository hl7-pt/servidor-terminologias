# servidor-terminologias

Servidor de Terminologias HL7 Portugal — um servidor FHIR (HAPI FHIR JPA)
dedicado ao suporte de ferramentas e software de saúde digital baseados em
terminologias clínicas (CodeSystems, ValueSets e ConceptMaps).

## Arquitetura

O projeto é composto por um servidor FHIR e um conjunto de aplicações web
estáticas servidas pelo próprio HAPI FHIR.

```
.
├── docker-compose.yml       # Orquestração do HAPI FHIR + PostgreSQL
├── hapi_config/
│   └── application.yml      # Configuração do HAPI FHIR
├── web/                     # Conteúdo estático servido em /custom (welcome.html, logo, favicon)
└── apps/                    # Aplicações web servidas em /apps
    ├── csbrowser.html       # Listagem de CodeSystems
    ├── vsbrowser.html       # Listagem de ValueSets
    ├── cmapbrowser.html     # Listagem de ConceptMaps
    ├── csregister.html      # Formulário de criação de CodeSystems
    ├── header.html          # Cabeçalho comum partilhado entre apps
    ├── config.json          # URL base do servidor FHIR usado pelas apps
    ├── assets/              # CSS, JS e fontes (Bootstrap 5, jQuery, DataTables, LiquidJS)
    └── visualiser/          # Visualizador genérico de recursos FHIR via templates Liquid
        ├── viz-index.html
        └── templates/
            ├── CodeSystem.liquid
            ├── ConceptMap.liquid
            └── ValueSet.liquid
```

## Como executar

```bash
docker compose up -d
```

O servidor FHIR fica disponível em `http://localhost:8080/fhir` e a página
inicial (welcome) em `http://localhost:8080/`. As aplicações web são servidas
em `http://localhost:8080/apps/` e o conteúdo estático personalizado em
`http://localhost:8080/custom/`.

## Aplicações

| Aplicação        | Caminho                  | Descrição                                          |
| ---------------- | ------------------------ | -------------------------------------------------- |
| Terminologias    | `/apps/csbrowser.html`   | Navegador de CodeSystems disponíveis no servidor   |
| ValueSets        | `/apps/vsbrowser.html`   | Navegador de ValueSets disponíveis no servidor     |
| Mapeamentos      | `/apps/cmapbrowser.html` | Navegador de ConceptMaps entre terminologias       |
| Registo          | `/apps/csregister.html`  | Criação/submissão de novos CodeSystems via formulário |
| Visualizador     | `/apps/visualiser/viz-index.html?url=...` | Visualização rica de um recurso FHIR individual |

## Configuração

A configuração do servidor FHIR está em
[`hapi_config/application.yml`](hapi_config/application.yml) e é montada no
contentor via `SPRING_CONFIG_LOCATION`.

As aplicações web leem o URL base do servidor a partir de
[`apps/config.json`](apps/config.json):

```json
{
    "server_url": "https://terminologias.hl7.pt/fhir"
}
```

## Mais informação

Consulte o [HL7 FHIR Implementation Guide](https://hl7-pt.github.io/terminologias/)
para detalhes sobre as terminologias publicadas neste servidor.
