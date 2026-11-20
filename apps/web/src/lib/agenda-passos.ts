export const APPS_AGENDA = [
  {
    id: "google",
    nome: "Google Agenda",
    passos: [
      "Abra o Google Agenda no computador (não funciona pelo app do celular).",
      "Ao lado de “Outras agendas”, clique em + e escolha “Do URL”.",
      "Cole o link, clique em “Adicionar agenda” e pronto.",
    ],
  },
  {
    id: "apple",
    nome: "Apple Calendário",
    passos: [
      "Abra o Calendário e vá em Arquivo → Nova assinatura de calendário.",
      "Cole o link e clique em “Assinar”.",
      "Escolha a atualização automática e confirme.",
    ],
  },
  {
    id: "outlook",
    nome: "Outlook",
    passos: [
      "No Outlook na web, abra o Calendário e clique em “Adicionar calendário”.",
      "Escolha “Assinar da Web” e cole o link.",
      "Dê um nome à agenda e clique em “Importar”.",
    ],
  },
] as const;
