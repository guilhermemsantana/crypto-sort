"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LOCALE_OPTIONS = [
  { code: "pt", label: "Portugues" },
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
] as const;

export type SupportedLocale = (typeof LOCALE_OPTIONS)[number]["code"];

const translations = {
  pt: {
    nav: {
      brand: "CryptoSort",
      navLabel: "Navegacao principal",
      menuOpenLabel: "Abrir menu",
      menuCloseLabel: "Fechar menu",
      languagePickerLabel: "Selecionar idioma",
      contractLabel: "Contrato Inteligente",
      themeToggleLabel: "Alternar tema",
      themeLightLabel: "Modo claro",
      themeDarkLabel: "Modo escuro",
      githubLabel: "Github",
      links: [
        { href: "/", label: "Inicio" },
        { href: "/sorteios", label: "Sorteios" },
        { href: "/meus-tickets", label: "Meus tickets" },
      ],
      wallet: {
        idle: "Conectar Carteira",
        connecting: "Conectando...",
        checking: "Verificando...",
      },
    },
    home: {
      badge: "Sorteios web3 para marcas confiaveis",
      heading: "Entregue sorteios em blockchain com credibilidade de ponta a ponta",
      description:
        "Conecte sua carteira, defina regras e deixe nossos smart contracts garantirem sorteios auditaveis, imparciais e com distribuicao automatica de premios.",
      primaryAction: "Explorar sorteios",
      primaryHelper: "Veja campanhas disponiveis e acompanhe resultados on-chain.",
      benefits: [
        {
          title: "Transparencia permanente",
          description:
            "Cada inscricao, sorteio e premio fica registrado em blockchain publica, permitindo auditoria instantanea pela sua comunidade.",
        },
        {
          title: "Distribuicao automatica",
          description:
            "Execute draws imparciais com smart contracts e envie recompensas em segundos, sem planilhas ou riscos de erro humano.",
        },
        {
          title: "Seguranca comprovada",
          description:
            "Use contratos auditados, autenticacao por carteira e logs imutaveis para fortalecer a confianca em cada campanha.",
        },
        {
          title: "Experiencia multicanais",
          description:
            "Integre formulaios, landing pages e CRM para capturar leads enquanto mantem a comprovacao on-chain em segundo plano.",
        },
        {
          title: "Escalavel para qualquer porte",
          description:
            "Crie sorteios recorrentes, pools de premios e campanhas patrocinadas com configuracoes reutilizaveis e gestao centralizada.",
        },
        {
          title: "Analytics em tempo real",
          description:
            "Acompanhe participacoes, wallet mix e entregas de premio com dashboards prontos para compartilhamento.",
        },
      ],
      ctaSection: {
        heading: "Pronto para desbloquear campanhas de sorteio sem duvidas?",
        description:
          "Escale recompensas para clientes, comunidades e colecionadores com rastreabilidade total e provas on-chain acessiveis em um clique.",
        button: "Explorar experiencias",
        helper: "Suporte a redes Ethereum, Polygon e Solana",
      },
    },
    draws: {
      title: "Painel de sorteios",
      subtitle: "Centralize a criacao, auditoria e distribuicao de sorteios on-chain.",
      validating: "Validando conexao com sua carteira...",
      connected: {
        emptyTitle: "Nenhum sorteio ativo",
        emptyDescription: "Quando nao houver campanhas abertas, elas aparecerao aqui.",
      },
      requiresWallet: {
        heading: "Conecte uma carteira para continuar",
        description: "Voce precisa autorizar o acesso via MetaMask para visualizar os sorteios disponiveis.",
        action: "Conectar carteira",
        helper: "MetaMask e redes Ethereum compativeis",
      },
      active: {
        buyCta: "Comprar ticket",
        buySoldOutLabel: "Compras encerradas",
        detailsButton: "Detalhes do sorteio",
        priceLabel: "Valor do ticket",
        startDateLabel: "Inicio",
        endDateLabel: "Fim",
        noEndDateLabel: "Quando os tickets esgotarem",
        detailsLabel: "Detalhes",
        statusLabel: "Status",
        coinLabel: "Moeda",
        networkLabel: "Rede",
        filterLabel: "Filtrar por status",
        currencyFilterLabel: "Filtrar por moeda",
        currencyOptions: {
          all: "Todas",
        },
        networkFilterLabel: "Filtrar por rede",
        networkOptions: {
          all: "Todas",
        },
        sortLabel: "Ordenar por",
        sortOptions: {
          newest: "Mais recentes",
          oldest: "Mais antigos",
          priceDesc: "Maior valor",
          priceAsc: "Menor valor",
        },
        totalTicketsLabel: "Tickets totais",
        totalPrizeLabel: "Premiacao total",
        soldPercentageLabel: "Vendidos",
        ticketModal: {
          title: "Tickets do sorteio",
          subtitle: "Selecione um ticket disponivel para continuar.",
          helper: "Total de {total} tickets neste sorteio.",
          soldHint: "Tickets em cinza ja foram vendidos.",
          emptyLabel: "Nenhum ticket disponivel no momento.",
          closeLabel: "Fechar",
          confirmTitle: "Confirme sua compra",
          confirmSubtitle: "Revise os dados antes de finalizar.",
          selectedLabel: "Tickets escolhidos",
          priceLabel: "Valor do ticket",
          coinLabel: "Moeda",
          networkLabel: "Rede",
          totalLabel: "Total a pagar",
          confirmPlaceholder: "Selecione pelo menos um ticket para continuar.",
          reviewLabel: "Revisar selecao",
          backLabel: "Alterar ticket",
          confirmCta: "Concluir compra",
          processingLabel: "Processando...",
          walletRequiredLabel: "Conecte sua carteira para concluir a compra.",
          randomSelectLabel: "Selecionar aleatoriamente",
          randomSelectPlaceholder: "Quantidade de tickets",
          randomSelectButton: "Escolher tickets",
          randomSelectError: "Informe um numero valido maior que zero.",
          unavailableLabel: "Esse ticket acabou de ser vendido. Escolha outro.",
          genericError: "Nao foi possivel concluir a compra. Tente novamente.",
        },
        resultsLabel: "Sorteios encontrados",
        pagination: {
          previous: "Anterior",
          next: "Proximo",
          page: "Pagina",
        },
        statusOptions: {
          all: "Todos",
          ongoing: "Em andamento",
          scheduled: "Agendado",
          completed: "Concluido",
          cancelled: "Cancelados",
        },
        emptyTitle: "Nenhuma campanha em andamento",
        emptyDescription: "Assim que houver novos sorteios, eles aparecem aqui automaticamente.",
      },
      details: {
        title: "Detalhes do sorteio",
        subtitle: "Veja todas as informacoes desta campanha on-chain.",
        backToList: "Voltar para sorteios",
        idLabel: "ID do sorteio",
        metricsTitle: "Metricas",
        financeTitle: "Detalhes financeiros",
        coinLabel: "Moeda",
        networkLabel: "Rede",
        loadingLabel: "Carregando detalhes...",
        loadError: "Nao foi possivel carregar este sorteio. Tente novamente.",
        notFoundTitle: "Sorteio nao encontrado",
        notFoundDescription: "Nao encontramos informacoes para o ID informado. Volte para a lista e escolha outro sorteio.",
        notFoundCta: "Ver lista de sorteios",
      },
    },
    tickets: {
      title: "Meus tickets",
      loading: "Confirmando informacoes da carteira...",
      summary: {
        drawsLabel: "Sorteios com tickets",
        ticketsLabel: "Total de tickets",
      },
      requiresWallet: {
        heading: "Conecte sua carteira para ver os tickets",
        description: "Use a MetaMask para entrar e sincronizar os tickets vinculados ao seu endereco.",
        action: "Conectar carteira",
        helper: "MetaMask e redes Ethereum compativeis",
      },
      empty: {
        title: "Nenhum ticket encontrado",
        description: "Assim que voce comprar tickets em algum sorteio eles aparecerao aqui.",
      },
      card: {
        drawLabel: "Sorteio",
        statusLabel: "Status",
        priceLabel: "Valor do ticket",
        quantityLabel: "Quantidade",
        timeLabel: "Periodo",
        openEndedLabel: "Sem data final",
        ticketsLabel: "Seus tickets",
        emptyTicketsLabel: "Nenhum ticket registrado para este sorteio.",
        viewDrawCta: "Ver sorteio",
      },
    },
  },
  en: {
    nav: {
      brand: "CryptoSort",
      navLabel: "Primary navigation",
      menuOpenLabel: "Open menu",
      menuCloseLabel: "Close menu",
      languagePickerLabel: "Select language",
      contractLabel: "Smart Contract",
      themeToggleLabel: "Toggle theme",
      themeLightLabel: "Light mode",
      themeDarkLabel: "Dark mode",
      githubLabel: "Github",
      links: [
        { href: "/", label: "Home" },
        { href: "/sorteios", label: "Draws" },
        { href: "/meus-tickets", label: "My tickets" },
      ],
      wallet: {
        idle: "Connect Wallet",
        connecting: "Connecting...",
        checking: "Verifying...",
      },
    },
    home: {
      badge: "Web3 raffles for trustworthy brands",
      heading: "Deliver blockchain raffles with end-to-end credibility",
      description:
        "Connect your wallet, define the rules and let our smart contracts guarantee auditable, impartial raffles with automatic prize distribution.",
      primaryAction: "Browse raffles",
      primaryHelper: "See current campaigns ready to join.",
      benefits: [
        {
          title: "Permanent transparency",
          description:
            "Every entry, draw and prize is written to a public blockchain, enabling instant community audits.",
        },
        {
          title: "Automated distribution",
          description:
            "Run impartial draws with smart contracts and send rewards in seconds, no spreadsheets or human error.",
        },
        {
          title: "Proven security",
          description:
            "Rely on audited contracts, wallet authentication and immutable logs to strengthen trust in each campaign.",
        },
        {
          title: "Multichannel experience",
          description:
            "Integrate forms, landing pages and CRMs to capture leads while keeping on-chain proof running in the background.",
        },
        {
          title: "Scales to any size",
          description:
            "Launch recurring raffles, prize pools and sponsored campaigns with reusable setups and centralized management.",
        },
        {
          title: "Real-time analytics",
          description:
            "Track entries, wallet mix and prize delivery with dashboards that are ready to share.",
        },
      ],
      ctaSection: {
        heading: "Ready to unlock raffle campaigns without doubts?",
        description:
          "Scale rewards for customers, communities and collectors with full traceability and on-chain proofs one click away.",
        button: "Explore experiences",
        helper: "Supports Ethereum, Polygon and Solana networks",
      },
    },
    draws: {
      title: "Raffle dashboard",
      subtitle: "Centralize the creation, auditing and prize distribution of on-chain raffles.",
      validating: "Checking your wallet connection...",
      connected: {
        emptyTitle: "No active raffles",
        emptyDescription: "When no campaigns are open they will show up here.",
      },
      requiresWallet: {
        heading: "Connect a wallet to continue",
        description: "You must authorize access via MetaMask to view the raffles available.",
        action: "Connect wallet",
        helper: "MetaMask and compatible Ethereum networks",
      },
      active: {
        buyCta: "Buy ticket",
        buySoldOutLabel: "Sales closed",
        detailsButton: "Draw details",
        priceLabel: "Ticket price",
        startDateLabel: "Start date",
        endDateLabel: "End date",
        noEndDateLabel: "When tickets sell out",
        detailsLabel: "Details",
        statusLabel: "Status",
        coinLabel: "Coin",
        networkLabel: "Network",
        filterLabel: "Filter by status",
        currencyFilterLabel: "Filter by currency",
        currencyOptions: {
          all: "All",
        },
        networkFilterLabel: "Filter by network",
        networkOptions: {
          all: "All",
        },
        sortLabel: "Sort by",
        sortOptions: {
          newest: "Newest first",
          oldest: "Oldest first",
          priceDesc: "Higher price",
          priceAsc: "Lower price",
        },
        totalTicketsLabel: "Total tickets",
        totalPrizeLabel: "Total prize",
        soldPercentageLabel: "Sold",
        ticketModal: {
          title: "Raffle tickets",
          subtitle: "Select an available ticket to continue.",
          helper: "Total of {total} tickets in this draw.",
          soldHint: "Gray tickets are already sold.",
          emptyLabel: "No tickets available right now.",
          closeLabel: "Close",
          confirmTitle: "Confirm your purchase",
          confirmSubtitle: "Review the details before finishing.",
          selectedLabel: "Selected tickets",
          priceLabel: "Ticket price",
          coinLabel: "Coin",
          networkLabel: "Network",
          totalLabel: "Total",
          confirmPlaceholder: "Pick at least one ticket to continue.",
          reviewLabel: "Review selection",
          backLabel: "Change ticket",
          confirmCta: "Complete purchase",
          processingLabel: "Processing...",
          walletRequiredLabel: "Connect your wallet to finish the purchase.",
          randomSelectLabel: "Random selection",
          randomSelectPlaceholder: "Number of tickets",
          randomSelectButton: "Pick random tickets",
          randomSelectError: "Enter a valid number greater than zero.",
          unavailableLabel: "That ticket was just sold. Pick another.",
          genericError: "We couldn't finish your purchase. Try again.",
        },
        resultsLabel: "Raffles found",
        pagination: {
          previous: "Previous",
          next: "Next",
          page: "Page",
        },
        statusOptions: {
          all: "All",
          ongoing: "Live",
          scheduled: "Scheduled",
          completed: "Completed",
          cancelled: "Cancelled",
        },
        emptyTitle: "No live campaigns",
        emptyDescription: "As soon as new raffles go live they'll appear here automatically.",
      },
      details: {
        title: "Raffle details",
        subtitle: "Review every on-chain detail for this campaign.",
        backToList: "Back to raffles",
        idLabel: "Raffle ID",
        metricsTitle: "Metrics",
        financeTitle: "Financial details",
        coinLabel: "Currency",
        networkLabel: "Network",
        loadingLabel: "Loading raffle...",
        loadError: "We couldn't load this raffle. Please try again.",
        notFoundTitle: "Raffle not found",
        notFoundDescription: "We couldn't find any raffle with this ID. Return to the list and pick another draw.",
        notFoundCta: "Go to raffles list",
      },
    },
    tickets: {
      title: "My tickets",
      loading: "Confirming wallet information...",
      summary: {
        drawsLabel: "Raffles with tickets",
        ticketsLabel: "Tickets owned",
      },
      requiresWallet: {
        heading: "Connect your wallet to view tickets",
        description: "Use MetaMask to sign in and sync the tickets linked to your address.",
        action: "Connect wallet",
        helper: "MetaMask and compatible Ethereum networks",
      },
      empty: {
        title: "You do not have tickets yet",
        description: "As soon as you buy tickets in a raffle they will automatically appear here.",
      },
      card: {
        drawLabel: "Raffle",
        statusLabel: "Status",
        priceLabel: "Ticket price",
        quantityLabel: "Quantity",
        timeLabel: "Timeframe",
        openEndedLabel: "No end date",
        ticketsLabel: "Your tickets",
        emptyTicketsLabel: "No tickets registered for this raffle.",
        viewDrawCta: "View raffle",
      },
    },
  },
  es: {
    nav: {
      brand: "CryptoSort",
      navLabel: "Navegacion principal",
      menuOpenLabel: "Abrir menu",
      menuCloseLabel: "Cerrar menu",
      languagePickerLabel: "Seleccionar idioma",
      contractLabel: "Contrato Inteligente",
      themeToggleLabel: "Alternar tema",
      themeLightLabel: "Modo claro",
      themeDarkLabel: "Modo oscuro",
      githubLabel: "Github",
      links: [
        { href: "/", label: "Inicio" },
        { href: "/sorteios", label: "Sorteos" },
        { href: "/meus-tickets", label: "Mis tickets" },
      ],
      wallet: {
        idle: "Conectar billetera",
        connecting: "Conectando...",
        checking: "Verificando...",
      },
    },
    home: {
      badge: "Sorteos web3 para marcas confiables",
      heading: "Entrega sorteos en blockchain con credibilidad punta a punta",
      description:
        "Conecta tu billetera, define las reglas y deja que nuestros smart contracts garanticen sorteos auditables, imparciales y con distribucion automatica de premios.",
      primaryAction: "Explorar sorteos",
      primaryHelper: "Descubre campañas activas listas para participar.",
      benefits: [
        {
          title: "Transparencia permanente",
          description:
            "Cada registro, sorteo y premio queda en una blockchain publica, permitiendo auditoria instantanea para la comunidad.",
        },
        {
          title: "Distribucion automatica",
          description:
            "Ejecuta sorteos imparciales con smart contracts y envia recompensas en segundos, sin planillas ni riesgo humano.",
        },
        {
          title: "Seguridad comprobada",
          description:
            "Confia en contratos auditados, autenticacion por billetera y registros inmutables para reforcar la confianza.",
        },
        {
          title: "Experiencia multicanal",
          description:
            "Integra formularios, landing pages y CRM para captar leads mientras mantenemos la comprobacion on-chain en segundo plano.",
        },
        {
          title: "Escalable para cualquier tamano",
          description:
            "Crea sorteos recurrentes, pools de premios y campanas patrocinadas con configuraciones reutilizables y gestion centralizada.",
        },
        {
          title: "Analiticas en tiempo real",
          description:
            "Sigue participaciones, mix de billeteras y entrega de premios con tableros listos para compartir.",
        },
      ],
      ctaSection: {
        heading: "Listo para activar sorteos sin dudas?",
        description:
          "Escala recompensas para clientes, comunidades y coleccionistas con trazabilidad total y pruebas on-chain a un clic.",
        button: "Explorar experiencias",
        helper: "Soporta redes Ethereum, Polygon y Solana",
      },
    },
    draws: {
      title: "Panel de sorteos",
      subtitle: "Centraliza la creacion, auditoria y distribucion de sorteos on-chain.",
      validating: "Verificando conexion con tu billetera...",
      connected: {
        emptyTitle: "Sin sorteos activos",
        emptyDescription: "Cuando no haya campañas abiertas apareceran aqui.",
      },
      requiresWallet: {
        heading: "Conecta una billetera para continuar",
        description: "Debes autorizar via MetaMask para visualizar los sorteos disponibles.",
        action: "Conectar billetera",
        helper: "MetaMask y redes compatibles con Ethereum",
      },
      active: {
        buyCta: "Comprar ticket",
        buySoldOutLabel: "Compras cerradas",
        detailsButton: "Detalles del sorteo",
        priceLabel: "Precio del ticket",
        startDateLabel: "Inicio",
        endDateLabel: "Fin",
        noEndDateLabel: "Cuando se agoten los tickets",
        detailsLabel: "Detalles",
        statusLabel: "Estado",
        coinLabel: "Moneda",
        networkLabel: "Red",
        filterLabel: "Filtrar por estado",
        currencyFilterLabel: "Filtrar por moneda",
        currencyOptions: {
          all: "Todas",
        },
        networkFilterLabel: "Filtrar por red",
        networkOptions: {
          all: "Todas",
        },
        sortLabel: "Ordenar por",
        sortOptions: {
          newest: "Mas recientes",
          oldest: "Mas antiguos",
          priceDesc: "Mayor valor",
          priceAsc: "Menor valor",
        },
        totalTicketsLabel: "Tickets totales",
        totalPrizeLabel: "Premio total",
        soldPercentageLabel: "Vendidos",
        ticketModal: {
          title: "Tickets del sorteo",
          subtitle: "Selecciona un ticket disponible para continuar.",
          helper: "Total de {total} tickets en este sorteo.",
          soldHint: "Los tickets en gris ya fueron vendidos.",
          emptyLabel: "No hay tickets disponibles ahora.",
          closeLabel: "Cerrar",
          confirmTitle: "Confirma tu compra",
          confirmSubtitle: "Revisa los datos antes de finalizar.",
          selectedLabel: "Tickets elegidos",
          priceLabel: "Precio del ticket",
          coinLabel: "Moneda",
          networkLabel: "Red",
          totalLabel: "Total a pagar",
          confirmPlaceholder: "Selecciona al menos un ticket para continuar.",
          reviewLabel: "Revisar seleccion",
          backLabel: "Cambiar ticket",
          confirmCta: "Finalizar compra",
          processingLabel: "Procesando...",
          walletRequiredLabel: "Conecta tu billetera para finalizar la compra.",
          randomSelectLabel: "Seleccion aleatoria",
          randomSelectPlaceholder: "Cantidad de tickets",
          randomSelectButton: "Elegir tickets",
          randomSelectError: "Ingresa un numero valido mayor que cero.",
          unavailableLabel: "Ese ticket ya fue vendido. Selecciona otro.",
          genericError: "No pudimos completar tu compra. Intenta de nuevo.",
        },
        resultsLabel: "Sorteos encontrados",
        pagination: {
          previous: "Anterior",
          next: "Siguiente",
          page: "Pagina",
        },
        statusOptions: {
          all: "Todos",
          ongoing: "En curso",
          scheduled: "Programado",
          completed: "Completado",
          cancelled: "Cancelados",
        },
        emptyTitle: "Sin campanas en curso",
        emptyDescription: "Cuando haya nuevos sorteos se mostraran automaticamente aqui.",
      },
      details: {
        title: "Detalles del sorteo",
        subtitle: "Consulta toda la informacion on-chain de esta campana.",
        backToList: "Volver a sorteos",
        idLabel: "ID del sorteo",
        metricsTitle: "Metricas",
        financeTitle: "Detalles financieros",
        coinLabel: "Moneda",
        networkLabel: "Red",
        loadingLabel: "Cargando sorteo...",
        loadError: "No pudimos cargar este sorteo. Vuelve a intentarlo.",
        notFoundTitle: "Sorteo no encontrado",
        notFoundDescription: "No encontramos informacion para este ID. Regresa a la lista y selecciona otro sorteo.",
        notFoundCta: "Ver lista de sorteos",
      },
    },
    tickets: {
      title: "Mis tickets",
      loading: "Confirmando informacion de la billetera...",
      summary: {
        drawsLabel: "Sorteos con tickets",
        ticketsLabel: "Tickets totales",
      },
      requiresWallet: {
        heading: "Conecta tu billetera para ver los tickets",
        description: "Inicia sesion con MetaMask para sincronizar los tickets vinculados a tu direccion.",
        action: "Conectar billetera",
        helper: "MetaMask y redes Ethereum compatibles",
      },
      empty: {
        title: "Todavia no tienes tickets",
        description: "Cuando compres tickets en un sorteo apareceran aqui automaticamente.",
      },
      card: {
        drawLabel: "Sorteo",
        statusLabel: "Estado",
        priceLabel: "Precio del ticket",
        quantityLabel: "Cantidad",
        timeLabel: "Periodo",
        openEndedLabel: "Sin fecha final",
        ticketsLabel: "Tus tickets",
        emptyTicketsLabel: "No hay tickets registrados para este sorteo.",
        viewDrawCta: "Ver sorteo",
      },
    },
  },
} as const;

type TranslationMap = typeof translations;
type Messages = TranslationMap[SupportedLocale];

type LocaleContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: typeof LOCALE_OPTIONS;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = "sorteio-web:locale";

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return LOCALE_OPTIONS.some((option) => option.code === value);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("pt");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLocale(storedLocale)) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      availableLocales: LOCALE_OPTIONS,
      t: translations[locale],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useI18n deve ser usado dentro de LocaleProvider");
  }

  return context;
}
