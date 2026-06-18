// ==========================================================================
// COMPORTAMENTO LOGÍSTICO DA CESTA E INTEGRAÇÃO COM WHATSAPP
// Gerencia a adição de itens e envia o pedido formatado para o WhatsApp.
// ==========================================================================

// OBS: CONFIGURAÇÃO: Coloque o seu número do WhatsApp aqui (Apenas números: Código do país + DDD + Número)
const numeroWhatsApp = "5521998180009"; 

let cesta = [];

document.addEventListener('DOMContentLoaded', () => {
    configurarBotoesCardapio();
    configurarBotaoFinalizar();
});

function configurarBotoesCardapio() {
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const cardProduto = e.target.closest('.produto-card');
            const id = parseInt(cardProduto.getAttribute('data-id'));
            const nome = cardProduto.getAttribute('data-nome');
            const preco = parseFloat(cardProduto.getAttribute('data-preco'));
            
            adicionarAoCarrinho(id, nome, preco);
        });
    });
}

function adicionarAoCarrinho(id, nome, preco) {
    const itemExistente = cesta.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        cesta.push({ id, nome, preco, quantidade: 1 });
    }
    atualizarInterfaceCesta();
}

// Altera a quantidade (+1 ou -1) diretamente de dentro da cesta
function alterarQuantidade(id, mudanca) {
    const item = cesta.find(item => item.id === id);
    if (item) {
        item.quantidade += mudanca;
        if (item.quantidade <= 0) {
            cesta = cesta.filter(item => item.id !== id);
        }
    }
    atualizarInterfaceCesta();
}

function atualizarInterfaceCesta() {
    const containerItens = document.getElementById('cesta-itens');
    const exibicaoTotal = document.getElementById('valor-total');
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    containerItens.innerHTML = '';
    
    if (cesta.length === 0) {
        containerItens.innerHTML = '<p class="cesta-vazia">Sua cesta está vazia.</p>';
        exibicaoTotal.innerText = 'R$ 0,00';
        btnFinalizar.disabled = true;
        return;
    }
    
    let subtotalGeral = 0;
    btnFinalizar.disabled = false;

    cesta.forEach(item => {
        const custoTotalItem = item.preco * item.quantidade;
        subtotalGeral += custoTotalItem;

        const divItem = document.createElement('div');
        divItem.classList.add('cesta-item');
        divItem.innerHTML = `
            <div class="item-detalhes">
                <h4>${item.nome}</h4>
                <span>R$ ${custoTotalItem.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="item-controles">
                <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                <span class="qtd-num">${item.quantidade}</span>
                <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, 1)">+</button>
            </div>
        `;
        containerItens.appendChild(divItem);
    });

    exibicaoTotal.innerText = `R$ ${subtotalGeral.toFixed(2).replace('.', ',')}`;
}

// Configura o clique no botão Finalizar Pedido
function configurarBotaoFinalizar() {
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    btnFinalizar.addEventListener('click', () => {
        if (cesta.length === 0) return;

        // 1. Monta o cabeçalho do texto
        let textoMensagem = `Olá, gostaria de fazer um pedido na *VerdeMar Lanches*! 🌊🥪\n\n`;
        textoMensagem += `*ITENS DO PEDIDO:*\n`;
        
        let total = 0;

        // 2. Lista os produtos da lista, pulando linha e aplicando negritos
        cesta.forEach(item => {
            const totalItem = item.preco * item.quantidade;
            total += totalItem;
            textoMensagem += `▪️ ${item.quantidade}x ${item.nome} - R$ ${totalItem.toFixed(2).replace('.', ',')}\n`;
        });

        // 3. Adiciona o valor total geral
        textoMensagem += `\n*Total Geral: R$ ${total.toFixed(2).replace('.', ',')}*`;

        // 4. Codifica o texto para o padrão que a internet aceita (substitui espaços por códigos, etc)
        const textoFormatadoUri = encodeURIComponent(textoMensagem);

        // 5. Cria o link oficial da API do WhatsApp
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${textoFormatadoUri}`;

        // 6. Abre o chat do WhatsApp em uma nova aba do navegador
        window.open(urlWhatsApp, '_blank');
    });
}