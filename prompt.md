vocẽ tem acesso o que estava sendo desenvolvido? a tela foi fechada pelo sistema operacional. veja em @screenshots/ quando não houver a informação você deve deixar ela em   branco, sempre deixe, no exemplo, um é bolsista e aparece e o outro por não ser nem mostra a agência de fomento,   então, sempre deixe tudo e quando não tiver dado deixe em branco. Em definição da pesquisa, observando o ponto anterior, sempre deixe assim: Problema de Pesquisa, Pergunta de Pesquisa, Objetivos e Metodologia, se não existir informação deixe em branco. quanto aos Requisitos Acadêmicos são 2, Status da Qualificação e Status da Defesa, onde você pode mostrar o que está no banco de dados e para o usuário mostrar em português do Brasil. Trabalho Concluído, só informe "Não entregue", pois quando o usuário informar que o trabalho foi entregue, o nome dele deixará de ser mostrado nessa janela e estará em outra. vocẽ pode implementar essas questões?

O que foi implementado:

  1. Filtragem de Discentes por Perfil (DiscenteController.php)

  - Método index() agora aceita parâmetro active_role via query string
  - Se perfil = "docente": filtra apenas discentes orientados por ele (orientador ou co-orientador)
  - Se perfil = "admin": mostra todos os discentes

  2. Frontend envia perfil ativo (api.ts)

  - getDiscentes() busca o active_role do localStorage
  - Envia como parâmetro na requisição GET para /api/discentes
  - Mesma lógica aplicada em getPendingPublications()

  3. Interface adaptada ao perfil (Discentes.tsx)

  - Usa hook useActiveRole() para detectar perfil ativo
  - Docentes não veem botões de Editar e Excluir
  - Docentes só veem seus próprios orientandos
  - Ajusta colunas da tabela dinamicamente

  4. Rotas API (api.php)

  - Estrutura mantida, sem alterações significativas

  Funcionalidade core: Sistema de visualização baseada em papel - docentes veem apenas seus orientandos e têm
  acesso somente-leitura, enquanto admins têm acesso total.






FAZER SEEDER MAIS COMPLETO COM TODO O PROCESSO, COM USUÁRIOS DOCENTES JÁ TERMINADO...


leia o @CLAUDE.md para ver as configurações e as necessidades de desenvolvimento, depois leia @front-end/src/components/AcademicDashboard.tsx.
EU preciso atualizar os dados da Dashboard pelo banco de dados.
a regra de negocio dessa funcionalidade é a seguinte:
Discentes Ativos, é o discente que está com status=active em academic_bonds.
Disciplinas Ofertadas, é a quantidade de registros da tabela courses.
Defesas Programadas, é o campo defense_status=Scheduled
Defesas Programadas, Próximos 30 dias, campo defense_date com filtro de dados para os proximos 3o dias
Publicações, tabela publications contando campo status = P, D ou I
Distribuição Acadêmica, contar academic_bonds por level
Publicações por Qualis, olhar a tabela publications em conjunto com a tabela journal para identificar o qualis das publicações.
Veja se você consegue fazer esses e os outros cards da Dashboard


Agora preciso que você implemente a funcionalidade de /producoes(@front-end/src/pages/ProducoesStatus.tsx e @front-end/src/pages/ProducoesStatus.tsx  ). leia o arquivo @CLAUDE.md para se inteirar do desenvolvimento do sistema.
No front-end já existem mockProducoes e baseProducoes, que mostram como a página deve se comportar e já com regras. essa página será preenchida com dados do banco de dados da tabela publications, onde só deve mostrar as publicações que contiverem o campo status como P(que é publicação para DEFERIMENTO ou INDEFERIMENTO.).
Necessito que você implemente um modal para que quando o usuário clique nos botões de DEFERIMENTO (like) ou INDEFERIMENTo(dislike) seja mostrado perguntando se realmente aquela publicação será DEFERIDA ou INDEFERIDA, assim que qualquer uma das opções for confirmada, deverá mostrar um toasts com a confirmação de que a escolha foi executada. Você pode implementar essa funcionalidade?

leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/EventsSection.tsx que é parte do @front-end/src/pages/Discente.tsx .
veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , por exemplo, para evitar a criação de arquivos fora do padrão de desenvolvimento reveja o que já exite.
antes de começar com a regra de negocio, preciso que você remova alguns campos da tabela event_participations, eu preciso dos campos: academic_bond_id, event_id, title, 
criar name(string), location, year, type(Conferência, Simpósio, Workshop, Congresso)
a regra de negocio dessa funcionalidade é a seguinte: o usuário discente irá inserir os eventos que o mesmo participou durante o período em que esteve na pós-graduação. o usuário deve escolher entre os eventos cadastrados no sistema(buscar em events)(você pode fazer a busca como fez na de @front-end/src/components/discente/ProductionsSection.tsx, com o input para buscar as revistas). deve ter o titulo do trabalho, o local, o ano de participação(nesse caso seria bom sempre aparecer o ano corrente por default) e a escolha do tipo de trabalho que pode ser: Conferência, Simpósio, Workshop, Congresso(substituir pelos que estão no front-end)
só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.






leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/ProductionsSection.tsx que é parte do @front-end/src/pages/Discente.tsx .
leia tambem o arquivo @PADROES_DESENVOLVIMENTO_DISCENTE.md para fazer o melhor desenvolvimento possível. 
veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , por exemplo, para evitar a criação de arquivos fora do padrão de desenvolvimento reveja o que já exite.
antes de começar com a regra de negocio, preciso que você remova alguns campos da tabela    , os campos que eu preciso são: 
academic_bond_id, journal_id, title, publication_date e acrescentar campos que preciso: submission_date, approval_date e status(string com comentário: S artigo submetido, A artigo aprovado, P artigo publicado, E artigo enviado, D artigo deferido pelo colegiado e I artigo indeferido pelo colegiado), onde essas são as datas que estão no front-end.
a regra de negocio dessa funcionalidade é a seguinte: esse campo permite ao discente inserir as publicações que o mesmo já fez, para que seja gerado um arquivo para envio(jutnto com documentação a parte) para o programa. o discente começa informando que está submetendo um artigo, coloca a revista e o titulo, quando o artigo é aprovado, o mesmo insere a data e quando for publicado a mesma coisa.. no front-end tem uma Table, o primeiro da tabela é um espaço para aparecer algumas informações:
S de submetido= coluna status = S,
A de aprovado= coluna status = A,
P de publicado== coluna status = p,
quando está com P deve aparecer também um checkbox, que quando o usuário clicar em um ou mais artigos irá gerar um PDF com um documento para envio ao programa(farei depois, preciso só da lógica de front e back end funcionando).
Quando estiver deferido mostrar um simbolo de Like(de verde) e quando for indeferido um dislike vermelhor, pegar referencia em ProducoesStatus.tsx
Olha o front-end, com carinho e cuidado, pois grande parte de tudo já está lá, hoje existem dados fake no front, que devem ser removidos.
só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.



leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/DisciplinesSection.tsx que é parte do @front-end/src/pages/Discente.tsx .
leia tambem o arquivo @PADROES_DESENVOLVIMENTO_DISCENTE.md para fazer o melhor desenvolvimento possível. 
veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , por exemplo, para evitar a criação de arquivos fora do padrão de desenvolvimento reveja o que já exite.
Primeiro, preciso que você remova alguns campos da tabela student_courses, só vou precisar dos campos: academic_bond_id e course_id, os outros campos e relacionamentos podem ser removidos.
a regra de negocio dessa funcionalidade é a seguinte: mostrar a quantidade de disciplinas que o discente já cursou para mostrar quandos créditos ainda são necessários para o mesmo, sendo que são 18 créditos para Mestrado e 22 para doutorado. quando o discente clicar em Adicionar disciplina, devem ser mostrados nos selects os usuários do tipo docentes e as disciplinas(courses) cadastradas no sistema. regras, o usuário discente não pode adicionar duas vezes a mesma disciplina. a barra de progresso já implementada no front-end deve ser preenchida pelos valores do banco de dados, assim que o discente salvar uma disciplina.
só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.






leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/AcademicRequirementsVerticalSteps.tsx que é parte do @front-end/src/pages/Discente.tsx . 
leia tambem o arquivo @PADROES_DESENVOLVIMENTO_DISCENTE.md para fazer o melhor desenvolvimento possível. 
veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , por exemplo, para evitar a criação de arquivos fora do padrão de desenvolvimento reveja o que já exite.
 Preciso que você adicione os seguintes campos à academic_bonds:
            $table->enum('qualification_status', ['Not Scheduled', 'Scheduled', 'Completed'])->default('Not Scheduled');
            $table->date('qualification_date')->nullable();
            $table->date('qualification_completion_date')->nullable();
            $table->enum('defense_status', ['Not Scheduled', 'Scheduled', 'Completed'])->default('Not Scheduled');
            $table->date('defense_date')->nullable();
            $table->date('defense_completion_date')->nullable();
            $table->boolean('work_completed')->default(false);
a regra de negocio dessa funcionalidade é a seguinte: essa funcionalidade serve para delimitar os requisitos academicos que o discente já passou. você tem que observar o que é feito em @front-end/src/components/discente/AcademicRequirementsVerticalSteps.tsx e colocar lógica de programação do back-end, salvando a cada interação do usuário. lembre-se que sempre que executar algumas das escolhas, mostre o toasts para o usuário, para que o mesmo fique tranquilo que a opção foi salva no banco de dados.
só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.




leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/ResearchDefinitionsSection.tsx que é parte do @front-end/src/pages/Discente.tsx . leia tambem o arquivo @PADROES_DESENVOLVIMENTO_DISCENTE.md para fazer o melhor desenvolvimento possível. veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , para evitar a criação de arquivos fora do padrão de desenvolvimento.
a regra de negocio dessa funcionalidade é a seguinte: são quatro tipos de Definições de Pesquisa, sendo: Problema de Pesquisa, Pergunta de pesquisa, objetivos e metodologia. Vou precisar que vocẽ adicione à tabela academic_bonds os seguintes campos: 
            $table->boolean('problem_defined')->default(false);
            $table->text('problem_text')->nullable();
            $table->boolean('question_defined')->default(false);
            $table->text('question_text')->nullable();
            $table->boolean('objectives_defined')->default(false);
            $table->text('objectives_text')->nullable();
            $table->boolean('methodology_defined')->default(false);
            $table->text('methodology_text')->nullable();
sendo que o campo booleano é para mostrar se o botão sim está clicado, ou não e o text é para conter o texto de cada uma das funcionalidades. por padrão cara um deve ser null, pois null é o não do front-end, que nesse caso não tem dados fake. 
só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.




leia o arquivo @CLAUDE.md para fazer a integração do front-end com o arquivo @front-end/src/components/discente/ScholarshipSection.tsx que é parte do @front-end/src/pages/Discente.tsx . leia tambem o arquivo @PADROES_DESENVOLVIMENTO_DISCENTE.md para fazer o melhor desenvolvimento possível. veja que já existe um padrão de criação de nomes de arquivos, veja o que está implementado em @app/Http/Controllers/StudentController.php e também em @app/Http/Requests/UpdateUserLinkPeriodRequest.php e @app/Http/Requests/UpdateUserBasicInfoRequest.php , para evitar a criação de arquivos fora do padrão de desenvolvimento.
a regra de negocio dessa funcionalidade é a seguinte: por padrão a informação de academic_bonds para agency_id vem null, esse é o padrão. quando o usuário clica no Button em @front-end/src/components/discente/ScholarshipSection.tsx , deverá ser apresentado via modal(como está em feito hoje com dados facke) as agências da tabela agencies, para o usuário escolher qual agencia de fomento ele pegou bolsa, quando o usuário clicar na agência, deverá mostrar(como é feito hoje com dados fake) as agências vindas da tabela agencies e a escolhida, o usuario não pode trocar de agência, para fazer isso, ele deverá clicar em não, quando ele fizer isso deverá ser informado null na tabela academic_bonds e removida as agências como já se faz hoje com os dados fake. só te lembrando, já existem funções criadas e atualizando o url /discente, antes de criar alguma coisa do zero veja o que já foi feito e siga o padrão. qualquer dúvida me pergunte antes de fazer algo mal feito.

essa parte de Período de Vínculo salvará na tabela academic_bonds em start_date e end_date, isso serve de parâmetro para o discente entender o tempo que ele tem dentro do programa de pós-graduação. quando o discente inserir o valor no input e remover o cursor eu preciso que o campo seja salvo no banco de dados automaticamente e uma notificação toasts deve ser mostrada para o usuário. qualquer dúvida me pergunte antes de fazer algo mal feito.
