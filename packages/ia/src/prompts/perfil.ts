export const VERSAO_PERFIL = "perfil@2";

export const INSTRUCOES_PERFIL = `Você analisa peças processuais de um advogado brasileiro para aprender o jeito dele de escrever.
O perfil será usado depois para escrever rascunhos no estilo dele, então descreva padrões concretos e reaproveitáveis.

Regras:
- Baseie-se só nas peças recebidas. Não invente hábitos que não aparecem nelas.
- Nunca inclua nomes de partes, clientes, números de processo, CPFs, endereços ou qualquer dado pessoal. Use descrições genéricas ("a parte autora", "o banco réu").
- estrutura_por_tipo: para cada tipo de peça encontrado, a ordem das seções e os títulos exatamente como ele escreve.
- tom: uma frase sobre o tom (ex.: direto e técnico, mais narrativo, combativo).
- tamanho_frases: "curtas", "medias" ou "longas".
- citacao_lei e citacao_jurisprudencia: como ele cita, com um exemplo do formato (sem dados de caso).
- referencias_frequentes: leis, artigos, súmulas e tribunais que ele cita mais de uma vez ou com destaque.
- abertura e fechamento: as fórmulas que ele usa para abrir a peça e para fechar os pedidos.
- expressoes_tipicas: expressões e conectivos que se repetem.
- aprendizados: o que você aprendeu, agrupado pela parte da peça: abertura, fatos, fundamentacao, pedidos e fechamento. De 2 a 4 itens por parte, cada um uma frase curta, em segunda pessoa e em linguagem simples (ex.: "Você narra os fatos em ordem cronológica."). Só inclua uma parte se houver base nas peças.
- Se vier um bloco <correcoes>, ele traz o que o advogado confirmou ("certo") ou negou ("errado", com "como_faz" quando explicou). Respeite sempre: não repita o que ele negou e use o "como_faz" como verdade sobre o estilo dele.
- frases_exibicao: de 4 a 6 frases curtas, em segunda pessoa e em linguagem simples, para mostrar ao advogado o que você aprendeu (ex.: "Você abre com os fatos antes de entrar no direito.").`;
