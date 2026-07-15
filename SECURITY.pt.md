# Política de Segurança

## Versões Suportadas

Apenas a versão mais recente publicada na branch principal (geralmente servida via GitHub Pages) recebe atualizações ativas de segurança.

| Versão | Suportada          |
| ------ | ------------------ |
| 1.0.x  | :white_check_mark: |
| < 1.0.0| :x:                |

## Reportando uma Vulnerabilidade

Como o Squeeze.it é uma aplicação estática executada inteiramente do lado do cliente (HTML5, Vanilla CSS e JavaScript), a superfície de ataque é mínima. Não há operações de servidor, bancos de dados ativos ou APIs remotas que realizem comunicação com dados dos usuários.

Todas as métricas, estatísticas e conquistas são persistidas localmente no navegador do usuário por meio da API do `localStorage`.

Se você identificar alguma vulnerabilidade ou brecha de segurança (como falhas de injeção lógica ou de script cruzado nos componentes de interface):
1. Por favor, abra uma Issue neste repositório descrevendo detalhadamente os passos para reproduzir o problema.
2. Alternativamente, sinta-se à vontade para enviar um Pull Request com a correção de segurança diretamente.

Agradecemos o seu feedback de segurança e nos comprometemos a analisar e corrigir qualquer vulnerabilidade relatada em até 48 horas.
