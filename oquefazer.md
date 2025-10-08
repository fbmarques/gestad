veja em @screenshots/ quando não houver a informação você deve deixar ela em  branco, sempre deixe, no exemplo, um é bolsista e aparece e o outro por não ser nem mostra a agência de fomento,   então, sempre deixe tudo e quando não tiver dado deixe em branco. Em definição da pesquisa, observando o ponto anterior, sempre deixe assim: Problema de Pesquisa, Pergunta de Pesquisa, Objetivos e Metodologia, se não existir informação deixe em branco. quanto aos Requisitos Acadêmicos são 2, Status da Qualificação e Status da Defesa, onde você pode mostrar o que está no banco de dados e para o usuário mostrar em português do Brasil. Trabalho Concluído, só informe "Não entregue", pois quando o usuário informar que o trabalho foi entregue, o nome dele deixará de ser mostrado nessa janela e estará em outra. vocẽ pode implementar essas questões?

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



  ● Implementação concluída! ✅

  Mudanças realizadas no modal de detalhes do discente (Discentes.tsx):

  1. Definições de Pesquisa - Padronização completa

  - Agora sempre exibe os 4 campos, mesmo vazios:
    - Problema de Pesquisa
    - Questão de Pesquisa
    - Objetivos
    - Metodologia

  2. Status Acadêmicos - Tradução para português

  - Criada função translateStatus() que traduz:
    - "Not Scheduled" → "Não Agendada"
    - "Scheduled" → "Agendada"
    - "Completed" → "Concluída"
    - Aplicada aos campos "Status da Qualificação" e "Status da Defesa"

  3. Trabalho Concluído - Valor fixo

  - Campo agora sempre mostra "Não entregue" nesta view
  - Quando o trabalho for entregue, o discente deixará de aparecer nesta
  janela

  4. Agência de Fomento - Sempre visível

  - Campo garantidamente sempre exibido, mesmo quando vazio
