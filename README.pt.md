# Squeeze.it — Simulador de Alívio de Estresse do Lado do Cliente

Squeeze.it é um simulador de alívio de estresse de alta fidelidade executado inteiramente no navegador (client-side). O projeto roda sem qualquer dependência de frameworks externos, fornecendo uma bolinha elástica de corpo mole (soft-body) fluida, física e altamente interativa.

[Read in English](README.md) | **Demonstração Online**: [leosdc.github.io/squeezeit](https://leosdc.github.io/squeezeit/)

---

## Arquitetura Técnica

### 1. Motor de Simulação Física
A aplicação emprega um motor de física de corpo mole customizado baseado em integração de Verlet:
- **Discretização**: O contorno da bolinha é modelado por um anel fechado de 24 nós (massas) interconectados.
- **Restrições de Massa-Mola-Amortecedor**: As forças internas de restauração são calculadas a cada quadro utilizando a Lei de Hooke ($F = -k \cdot x$) combinada com fatores de amortecimento para simular comportamentos elásticos de borracha e viscosos de slime.
- **Deformação por Ponteiro**: Entradas do usuário (clique, arrastar e eventos de toque) calculam vetores de deformação radial. Os nós adjacentes ao ponteiro são repelidos, gerando efeitos realistas de esmagamento e estiramento. Na soltura do clique, a energia potencial acumulada é convertida em energia cinética, acionando uma oscilação harmônica amortecida.

### 2. Sintetizador de Áudio Procedural
Os efeitos sonoros são gerados dinamicamente através da **Web Audio API** para evitar a latência e o consumo de rede associados a arquivos de áudio estáticos:
- **Compressão (Clique)**: Um nó oscilador realiza varreduras de frequências agudas para graves (modulação de frequência) combinada com um envelope de ganho para produzir um som de esmagamento.
- **Soltura (Release)**: Um envelope curto de ruído branco combinado com um filtro passa-baixa simula a descompressão da borracha retornando ao seu estado de repouso.
- **Modo Plástico**: Gera pulsos filtrados com alto fator Q para simular o som característico de estouro de bolhas de plástico bolha.

---

## Subsistemas Comportamentais Avançados

Embora projetada como um simulador relaxante, a base de código contém máquinas de estado avançadas que alteram o fluxo físico a partir de gatilhos comportamentais específicos:

### 1. Cenários de Crise Não Documentados
- **Loop de Evasão de Ameaça**: Sob condições específicas de entrada, a aplicação entra em um estado de alerta não documentado. O simulador físico adiciona um forte vetor de repulsão que empurra a bolinha para longe das coordenadas do ponteiro, escalando deformidades faciais de pânico e restrições de colisão com as bordas do canvas.
- **Sequência de Resposta a Emergências**: Se a entrada física do usuário permanecer estática durante o alerta de ameaça, o simulador inicia uma sequência de resposta complexa, envolvendo renderização de diálogos de comunicação, unidades de interceptação tática em tela cheia e sobreposição com confisco completo do cursor.
- **Estado de Falha Operacional**: Conseguir desviar das unidades táticas e colidir com o alvo durante a perseguição ativa aciona uma sequência de falha operacional, resultando em diálogos de frustração da equipe, retirada das unidades e reinicialização limpa dos estados do simulador.

### 2. Máquina de Estados de Repouso (Sono)
- **Gatilho de Inatividade**: Nos modos normais do simulador, a ausência de interações ou movimentações do mouse por 10 segundos inicia o fluxo de ociosidade.
- **Alinhamento Central**: A bolinha é elasticamente atraída para as coordenadas centrais do Canvas, e suas velocidades residuais são amortecidas.
- **Acessórios Visuais**: O renderizador passa a desenhar um travesseiro por trás da bolinha e a cobrir seus nós inferiores com um cobertor texturizado.
- **Mudança de Estado**: A métrica de humor transiciona para `"Dormindo"`, as feições se fecham em arcos de sono e um loop de partículas renderiza caracteres "Zzz" ascendentes.
- **Interrupções**: Qualquer interação do usuário acorda a bolinha instantaneamente, dispersando partículas de algodão e restaurando o fluxo físico padrão.

---

## Estrutura do Projeto

```
.
├── index.html        # Estrutura de marcação HTML e nós do DOM
├── styles.css        # Layouts responsivos, definições de temas e viewports
├── app.js            # Física, áudio, diálogos e loops de animação
├── LICENSE           # Licença MIT
└── SECURITY.md       # Diretrizes de segurança (Inglês)
```

---

## Instalação e Execução

Como o simulador utiliza exclusivamente tecnologias nativas do navegador:
1. Clone este repositório:
   ```bash
   git clone https://github.com/Leosdc/squeezeit.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador web moderno.
3. Para hospedagem, sirva o diretório raiz usando qualquer servidor estático (como GitHub Pages, Nginx, ou via python: `python -m http.server 8000`).

---

## Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes.
