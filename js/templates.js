/**
 * ProjectClone - Modelos de Projetos Profissionais (Templates)
 */

const ProjectTemplates = {
  getTemplate(key) {
    const today = ProjectEngine.formatDate(new Date());

    if (key === 'software') {
      return {
        project: {
          name: 'Desenvolvimento de Plataforma SaaS Web',
          startDate: today,
          currency: 'BRL',
          baselineSaved: false,
          showCriticalPath: true,
          zoom: 'week'
        },
        resources: [
          { id: 1, name: 'Product Manager (PM)', role: 'Gestão', standardRate: 140, type: 'work' },
          { id: 2, name: 'Tech Lead / Arquiteto', role: 'Engenharia', standardRate: 180, type: 'work' },
          { id: 3, name: 'UI/UX Designer', role: 'Design', standardRate: 120, type: 'work' },
          { id: 4, name: 'Desenvolvedor Full Stack', role: 'Desenvolvimento', standardRate: 130, type: 'work' },
          { id: 5, name: 'QA Engineer', role: 'Qualidade', standardRate: 100, type: 'work' }
        ],
        tasks: [
          // Fase 1
          { id: 1, name: '1. Discovery e Arquitetura de Solução', duration: 10, start: today, end: ProjectEngine.addWorkDays(today, 10), progress: 100, predecessors: '', resourceIds: [1, 2], level: 0, isSummary: true },
          { id: 2, name: 'Mapeamento de Requisitos e User Stories', duration: 4, start: today, end: ProjectEngine.addWorkDays(today, 4), progress: 100, predecessors: '', resourceIds: [1], level: 1 },
          { id: 3, name: 'Definição de Arquitetura Cloud e Banco de Dados', duration: 6, start: ProjectEngine.addWorkDays(today, 5), end: ProjectEngine.addWorkDays(today, 10), progress: 100, predecessors: '2FS', resourceIds: [2], level: 1 },
          { id: 4, name: 'Marco: Escopo Técnico Aprovado', duration: 0, start: ProjectEngine.addWorkDays(today, 10), end: ProjectEngine.addWorkDays(today, 10), progress: 100, predecessors: '3FS', resourceIds: [], level: 1, milestone: true },

          // Fase 2
          { id: 5, name: '2. Design de Experiência (UI/UX)', duration: 12, start: ProjectEngine.addWorkDays(today, 11), end: ProjectEngine.addWorkDays(today, 22), progress: 75, predecessors: '4FS', resourceIds: [3], level: 0, isSummary: true },
          { id: 6, name: 'Wireframes e Fluxo de Navegação', duration: 5, start: ProjectEngine.addWorkDays(today, 11), end: ProjectEngine.addWorkDays(today, 15), progress: 100, predecessors: '4FS', resourceIds: [3], level: 1 },
          { id: 7, name: 'Protótipo de Alta Fidelidade no Figma', duration: 7, start: ProjectEngine.addWorkDays(today, 16), end: ProjectEngine.addWorkDays(today, 22), progress: 60, predecessors: '6FS', resourceIds: [3], level: 1 },

          // Fase 3
          { id: 8, name: '3. Desenvolvimento Frontend & Backend', duration: 25, start: ProjectEngine.addWorkDays(today, 23), end: ProjectEngine.addWorkDays(today, 47), progress: 30, predecessors: '7FS', resourceIds: [2, 4], level: 0, isSummary: true },
          { id: 9, name: 'Setup do Repositório, CI/CD e Ambientes', duration: 3, start: ProjectEngine.addWorkDays(today, 23), end: ProjectEngine.addWorkDays(today, 25), progress: 100, predecessors: '7FS', resourceIds: [2], level: 1 },
          { id: 10, name: 'Desenvolvimento das APIs REST / GraphQL', duration: 12, start: ProjectEngine.addWorkDays(today, 26), end: ProjectEngine.addWorkDays(today, 37), progress: 40, predecessors: '9FS', resourceIds: [2, 4], level: 1 },
          { id: 11, name: 'Interface Web Responsiva e Componentes', duration: 15, start: ProjectEngine.addWorkDays(today, 28), end: ProjectEngine.addWorkDays(today, 42), progress: 20, predecessors: '9FS+2', resourceIds: [4], level: 1 },
          { id: 12, name: 'Integração de Gateway de Pagamentos e Webhooks', duration: 5, start: ProjectEngine.addWorkDays(today, 43), end: ProjectEngine.addWorkDays(today, 47), progress: 0, predecessors: '10FS, 11FS', resourceIds: [4], level: 1 },

          // Fase 4
          { id: 13, name: '4. Qualidade (QA), Segurança e Homologação', duration: 8, start: ProjectEngine.addWorkDays(today, 48), end: ProjectEngine.addWorkDays(today, 55), progress: 0, predecessors: '12FS', resourceIds: [5], level: 0, isSummary: true },
          { id: 14, name: 'Testes de Carga, Estresse e Auditoria de Segurança', duration: 4, start: ProjectEngine.addWorkDays(today, 48), end: ProjectEngine.addWorkDays(today, 51), progress: 0, predecessors: '12FS', resourceIds: [5], level: 1 },
          { id: 15, name: 'Correção de Bugs e Ajustes Finais', duration: 4, start: ProjectEngine.addWorkDays(today, 52), end: ProjectEngine.addWorkDays(today, 55), progress: 0, predecessors: '14FS', resourceIds: [4], level: 1 },

          // Fase 5
          { id: 16, name: '5. Lançamento e Go-Live', duration: 2, start: ProjectEngine.addWorkDays(today, 56), end: ProjectEngine.addWorkDays(today, 57), progress: 0, predecessors: '15FS', resourceIds: [1, 2], level: 0, isSummary: true },
          { id: 17, name: 'Deploy em Produção e Monitoramento', duration: 2, start: ProjectEngine.addWorkDays(today, 56), end: ProjectEngine.addWorkDays(today, 57), progress: 0, predecessors: '15FS', resourceIds: [2], level: 1 },
          { id: 18, name: 'Marco: Sistema Oficialmente em Produção!', duration: 0, start: ProjectEngine.addWorkDays(today, 57), end: ProjectEngine.addWorkDays(today, 57), progress: 0, predecessors: '17FS', resourceIds: [], level: 1, milestone: true }
        ]
      };
    }

    if (key === 'marketing') {
      return {
        project: {
          name: 'Lançamento de Produto e Campanha de Marketing Digital',
          startDate: today,
          currency: 'BRL',
          baselineSaved: false,
          showCriticalPath: true,
          zoom: 'week'
        },
        resources: [
          { id: 1, name: 'Head de Marketing', role: 'Coordenação', standardRate: 150, type: 'work' },
          { id: 2, name: 'Copywriter', role: 'Conteúdo', standardRate: 90, type: 'work' },
          { id: 3, name: 'Designer & Editor de Vídeo', role: 'Audiovisual', standardRate: 110, type: 'work' },
          { id: 4, name: 'Gestor de Tráfego Pago', role: 'Mídia de Performance', standardRate: 130, type: 'work' }
        ],
        tasks: [
          { id: 1, name: '1. Estratégia e Posicionamento', duration: 5, start: today, end: ProjectEngine.addWorkDays(today, 5), progress: 100, predecessors: '', resourceIds: [1], level: 0, isSummary: true },
          { id: 2, name: 'Pesquisa de Público e Análise Concorrencial', duration: 3, start: today, end: ProjectEngine.addWorkDays(today, 3), progress: 100, predecessors: '', resourceIds: [1], level: 1 },
          { id: 3, name: 'Definição da Oferta e Cronograma de Postagens', duration: 2, start: ProjectEngine.addWorkDays(today, 4), end: ProjectEngine.addWorkDays(today, 5), progress: 100, predecessors: '2FS', resourceIds: [1, 2], level: 1 },
          
          { id: 4, name: '2. Produção de Ativos e Criativos', duration: 10, start: ProjectEngine.addWorkDays(today, 6), end: ProjectEngine.addWorkDays(today, 15), progress: 50, predecessors: '3FS', resourceIds: [2, 3], level: 0, isSummary: true },
          { id: 5, name: 'Criação das Copys de E-mails e Anúncios', duration: 4, start: ProjectEngine.addWorkDays(today, 6), end: ProjectEngine.addWorkDays(today, 9), progress: 100, predecessors: '3FS', resourceIds: [2], level: 1 },
          { id: 6, name: 'Gravação e Edição de Vídeos Institucionais', duration: 6, start: ProjectEngine.addWorkDays(today, 10), end: ProjectEngine.addWorkDays(today, 15), progress: 40, predecessors: '5FS', resourceIds: [3], level: 1 },
          { id: 7, name: 'Construção da Landing Page de Captura', duration: 5, start: ProjectEngine.addWorkDays(today, 10), end: ProjectEngine.addWorkDays(today, 14), progress: 70, predecessors: '5FS', resourceIds: [3], level: 1 },

          { id: 8, name: '3. Execução da Campanha', duration: 15, start: ProjectEngine.addWorkDays(today, 16), end: ProjectEngine.addWorkDays(today, 30), progress: 0, predecessors: '6FS, 7FS', resourceIds: [4], level: 0, isSummary: true },
          { id: 9, name: 'Fase de Captação e Aquecimento (Tráfego)', duration: 10, start: ProjectEngine.addWorkDays(today, 16), end: ProjectEngine.addWorkDays(today, 25), progress: 0, predecessors: '6FS', resourceIds: [4], level: 1 },
          { id: 10, name: 'Webinário / Evento de Abertura de Vendas', duration: 1, start: ProjectEngine.addWorkDays(today, 26), end: ProjectEngine.addWorkDays(today, 26), progress: 0, predecessors: '9FS', resourceIds: [1], level: 1 },
          { id: 11, name: 'Marco: Carrinho Aberto / Vendas Liberadas', duration: 0, start: ProjectEngine.addWorkDays(today, 26), end: ProjectEngine.addWorkDays(today, 26), progress: 0, predecessors: '10FS', resourceIds: [], level: 1, milestone: true },
          { id: 12, name: 'Campanha de Remarketing e Fechamento', duration: 4, start: ProjectEngine.addWorkDays(today, 27), end: ProjectEngine.addWorkDays(today, 30), progress: 0, predecessors: '10FS', resourceIds: [4], level: 1 }
        ]
      };
    }

    // Default: Construção Civil
    return {
      project: {
        name: 'Construção de Edifício Residencial Horizonte',
        startDate: today,
        currency: 'BRL',
        baselineSaved: false,
        showCriticalPath: true,
        zoom: 'week'
      },
      resources: [
        { id: 1, name: 'Eng. Civil Coordenador', role: 'Gestão de Obras', standardRate: 200, type: 'work' },
        { id: 2, name: 'Mestre de Obras', role: 'Supervisão de Campo', standardRate: 110, type: 'work' },
        { id: 3, name: 'Equipe de Fundação e Concreto', role: 'Operacional', standardRate: 250, type: 'work' },
        { id: 4, name: 'Equipe de Alvenaria e Fechamento', role: 'Alvenaria', standardRate: 180, type: 'work' },
        { id: 5, name: 'Eletricista Instalador', role: 'Instalações', standardRate: 90, type: 'work' },
        { id: 6, name: 'Encanador / Hidráulica', role: 'Instalações', standardRate: 90, type: 'work' },
        { id: 7, name: 'Gesseiro e Pintor', role: 'Acabamentos', standardRate: 100, type: 'work' }
      ],
      tasks: [
        // Fase 1
        { id: 1, name: '1. SERVIÇOS PRELIMINARES E CANTEIRO', duration: 12, start: today, end: ProjectEngine.addWorkDays(today, 12), progress: 100, predecessors: '', resourceIds: [1, 2], level: 0, isSummary: true },
        { id: 2, name: 'Sondagem do Terreno e Levantamento Topográfico', duration: 4, start: today, end: ProjectEngine.addWorkDays(today, 4), progress: 100, predecessors: '', resourceIds: [1], level: 1 },
        { id: 3, name: 'Alvarás, Licenças e Aprovação em Órgãos Públicos', duration: 8, start: today, end: ProjectEngine.addWorkDays(today, 8), progress: 100, predecessors: '', resourceIds: [1], level: 1 },
        { id: 4, name: 'Montagem do Canteiro de Obras e Ligação Provisória', duration: 4, start: ProjectEngine.addWorkDays(today, 9), end: ProjectEngine.addWorkDays(today, 12), progress: 100, predecessors: '2FS', resourceIds: [2], level: 1 },
        { id: 5, name: 'Marco: Canteiro e Licenças Aprovadas', duration: 0, start: ProjectEngine.addWorkDays(today, 12), end: ProjectEngine.addWorkDays(today, 12), progress: 100, predecessors: '3FS, 4FS', resourceIds: [], level: 1, milestone: true },

        // Fase 2
        { id: 6, name: '2. FUNDAÇÃO E ESTRUTURA DE CONCRETO', duration: 25, start: ProjectEngine.addWorkDays(today, 13), end: ProjectEngine.addWorkDays(today, 37), progress: 65, predecessors: '5FS', resourceIds: [2, 3], level: 0, isSummary: true },
        { id: 7, name: 'Escavação e Perfuração de Estacas', duration: 6, start: ProjectEngine.addWorkDays(today, 13), end: ProjectEngine.addWorkDays(today, 18), progress: 100, predecessors: '5FS', resourceIds: [3], level: 1 },
        { id: 8, name: 'Armação e Concretagem de Blocos e Sapatas', duration: 7, start: ProjectEngine.addWorkDays(today, 19), end: ProjectEngine.addWorkDays(today, 25), progress: 90, predecessors: '7FS', resourceIds: [3], level: 1 },
        { id: 9, name: 'Pilares, Vigas e Concretagem de Laje 1º Pavimento', duration: 12, start: ProjectEngine.addWorkDays(today, 26), end: ProjectEngine.addWorkDays(today, 37), progress: 30, predecessors: '8FS', resourceIds: [3], level: 1 },
        { id: 10, name: 'Marco: Estrutura Principal Concluída', duration: 0, start: ProjectEngine.addWorkDays(today, 37), end: ProjectEngine.addWorkDays(today, 37), progress: 0, predecessors: '9FS', resourceIds: [], level: 1, milestone: true },

        // Fase 3
        { id: 11, name: '3. ALVENARIA E FECHAMENTO', duration: 18, start: ProjectEngine.addWorkDays(today, 38), end: ProjectEngine.addWorkDays(today, 55), progress: 0, predecessors: '10FS', resourceIds: [2, 4], level: 0, isSummary: true },
        { id: 12, name: 'Levantamento de Paredes e Fechamentos Externos', duration: 10, start: ProjectEngine.addWorkDays(today, 38), end: ProjectEngine.addWorkDays(today, 47), progress: 0, predecessors: '10FS', resourceIds: [4], level: 1 },
        { id: 13, name: 'Divisórias Internas e Vãos de Esquadrias', duration: 8, start: ProjectEngine.addWorkDays(today, 48), end: ProjectEngine.addWorkDays(today, 55), progress: 0, predecessors: '12FS', resourceIds: [4], level: 1 },

        // Fase 4
        { id: 14, name: '4. INSTALAÇÕES ELÉTRICAS E HIDRÁULICAS', duration: 16, start: ProjectEngine.addWorkDays(today, 45), end: ProjectEngine.addWorkDays(today, 60), progress: 0, predecessors: '12SS+7', resourceIds: [5, 6], level: 0, isSummary: true },
        { id: 15, name: 'Passagem de Tubulações e Eletrodutos', duration: 8, start: ProjectEngine.addWorkDays(today, 45), end: ProjectEngine.addWorkDays(today, 52), progress: 0, predecessors: '12SS+7', resourceIds: [5, 6], level: 1 },
        { id: 16, name: 'Fiação, Quadros de Distribuição e Testes', duration: 8, start: ProjectEngine.addWorkDays(today, 53), end: ProjectEngine.addWorkDays(today, 60), progress: 0, predecessors: '15FS', resourceIds: [5], level: 1 },

        // Fase 5
        { id: 17, name: '5. ACABAMENTOS E REVESTIMENTOS', duration: 20, start: ProjectEngine.addWorkDays(today, 61), end: ProjectEngine.addWorkDays(today, 80), progress: 0, predecessors: '13FS, 16FS', resourceIds: [7], level: 0, isSummary: true },
        { id: 18, name: 'Reboco, Massa Corrida e Gesso', duration: 8, start: ProjectEngine.addWorkDays(today, 61), end: ProjectEngine.addWorkDays(today, 68), progress: 0, predecessors: '13FS', resourceIds: [7], level: 1 },
        { id: 19, name: 'Assentamento de Pisos e Porcelanatos', duration: 7, start: ProjectEngine.addWorkDays(today, 69), end: ProjectEngine.addWorkDays(today, 75), progress: 0, predecessors: '18FS', resourceIds: [7], level: 1 },
        { id: 20, name: 'Pintura Final e Instalação de Louças/Metais', duration: 5, start: ProjectEngine.addWorkDays(today, 76), end: ProjectEngine.addWorkDays(today, 80), progress: 0, predecessors: '19FS', resourceIds: [7], level: 1 },

        // Fase 6
        { id: 21, name: '6. VISTORIA FINAL E ENTREGA', duration: 4, start: ProjectEngine.addWorkDays(today, 81), end: ProjectEngine.addWorkDays(today, 84), progress: 0, predecessors: '20FS', resourceIds: [1, 2], level: 0, isSummary: true },
        { id: 22, name: 'Limpeza Fina Pós-Obra e Retoques', duration: 3, start: ProjectEngine.addWorkDays(today, 81), end: ProjectEngine.addWorkDays(today, 83), progress: 0, predecessors: '20FS', resourceIds: [2], level: 1 },
        { id: 23, name: 'Vistoria Técnica de Habite-se e Vistoria com Cliente', duration: 1, start: ProjectEngine.addWorkDays(today, 84), end: ProjectEngine.addWorkDays(today, 84), progress: 0, predecessors: '22FS', resourceIds: [1], level: 1 },
        { id: 24, name: 'Marco: Entrega das Chaves Concluída!', duration: 0, start: ProjectEngine.addWorkDays(today, 84), end: ProjectEngine.addWorkDays(today, 84), progress: 0, predecessors: '23FS', resourceIds: [], level: 1, milestone: true }
      ]
    };
  }
};

window.ProjectTemplates = ProjectTemplates;
