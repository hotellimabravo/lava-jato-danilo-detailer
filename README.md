# Sistema de Gestão - Danilo Detailer (Lava Jato)

Projeto de um pequeno CRM e controle financeiro para o lava-jato "Danilo Detailer". Criado com assistência de inteligência artificial e desenvolvido de forma independente.

🔗 **Link de Acesso (Preview):** [https://hotellimabravo.github.io/lava-jato-danilo-detailer/index.html](https://hotellimabravo.github.io/lava-jato-danilo-detailer/index.html)

## 📌 Sobre o Sistema
Este sistema foi projetado para rodar diretamente no navegador, funcionando de forma offline e leve (utilizando `localStorage`), focado em resolver as necessidades diárias de um centro de estética automotiva. O objetivo é substituir o papel e planilhas por uma interface moderna, rápida e intuitiva que permita desde o cadastro rápido de clientes até o controle financeiro de ponta a ponta.

## 🚀 Principais Funcionalidades

* **📋 Gestão de Pedidos (Ordens de Serviço):**
  * Abertura rápida de novas ordens com placa, modelo, cor, cliente e serviços.
  * Workflow de status: "Aguardando", "Em Andamento", "Finalizado (Aguardando Retirada)", e "Encerrado (Pago)".
  * Geração instantânea de Recibo Digital (PNG de alta resolução) pronto para envio.

* **💰 Livro Caixa & Fechamento Diário:**
  * **Entradas Automáticas:** Toda O.S. encerrada e paga contabiliza diretamente no fluxo do dia.
  * **Saídas Manuais (Sangrias/Despesas):** Lançamento de retiradas em dinheiro, pagamento de equipe ou despesas operacionais com categorização, impactando instantaneamente o saldo líquido.
  * **Fechamento de Caixa Inteligente:** Resumo do total arrecadado por forma de pagamento e consolidação diária (manual ou via virada automática no dia seguinte).

* **👤 Cadastro e Histórico de Clientes:**
  * Lista unificada de clientes com telefone (link rápido para WhatsApp) e veículos vinculados.
  * O sistema lembra a placa e cor preenchidos em pedidos anteriores, vinculando ao perfil do cliente.

* **🛠️ Catálogo de Serviços e Precificação:**
  * Tabela de serviços configurável onde é possível determinar um preço padrão.
  * Autopreenchimento do valor sugerido ao selecionar o serviço na hora de abrir a O.S., com liberdade para editar o valor conforme a negociação real.

* **⚙️ Configurações e Backup de Dados:**
  * **Personalização de Marca:** O usuário pode alterar o nome da empresa e a descrição (slogan) que aparecem nos cabeçalhos e recibos.
  * **Exportação/Importação (Backup):** Ferramenta fácil para baixar todo o banco de dados em um arquivo `.json` ou restaurar em outro dispositivo.
  * **Reset Geral:** Opção (com trava de segurança) para limpar todo o banco de dados se necessário.
