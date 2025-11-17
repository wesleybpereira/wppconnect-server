/**
 * Script de Teste - API de Botões Interativos
 * Execute: node test-buttons.js
 */

// CONFIGURAÇÕES - AJUSTE AQUI!
const CONFIG = {
  baseUrl: 'http://localhost:21465',
  session: 'session1',
  token: 'SEU_TOKEN_AQUI',
  phone: '5521999999999', // Seu número de teste
};

// Função auxiliar para fazer requisições
async function request(endpoint, data) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.token}`
    },
    body: JSON.stringify(data)
  });

  const json = await response.json();
  return { status: response.status, data: json };
}

// Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Testes
async function runTests() {
  console.log('🧪 Testando API de Botões Interativos do WPPConnect');
  console.log('==================================================\n');

  try {
    // Teste 1: Verificar servidor
    console.log('1️⃣  Verificando servidor...');
    const healthCheck = await fetch(`${CONFIG.baseUrl}/healthz`);
    if (healthCheck.ok) {
      console.log('✅ Servidor está rodando!\n');
    } else {
      throw new Error('Servidor não está respondendo');
    }

    // Teste 2: Enviar mensagem simples com botões
    console.log('2️⃣  Enviando mensagem com 2 botões...');
    const test1 = await request(`/api/${CONFIG.session}/send-interactive-buttons`, {
      phone: [CONFIG.phone],
      message: '🧪 Teste de botões - escolha uma opção:',
      buttons: [
        { id: 'test_yes', title: '✅ Sim' },
        { id: 'test_no', title: '❌ Não' }
      ]
    });
    console.log(`Status: ${test1.status}`);
    console.log('Resposta:', JSON.stringify(test1.data, null, 2));
    console.log('');

    await delay(2000);

    // Teste 3: Enviar com header e footer
    console.log('3️⃣  Enviando com header e footer...');
    const test2 = await request(`/api/${CONFIG.session}/send-interactive-buttons`, {
      phone: [CONFIG.phone],
      header: '🤖 Bot de Teste',
      message: 'Mensagem completa com cabeçalho e rodapé',
      footer: 'Powered by WPPConnect',
      buttons: [
        { id: 'opt1', title: 'Opção 1' },
        { id: 'opt2', title: 'Opção 2' },
        { id: 'opt3', title: 'Opção 3' }
      ]
    });
    console.log(`Status: ${test2.status}`);
    console.log('Resposta:', JSON.stringify(test2.data, null, 2));
    console.log('');

    // Teste 4: Validação - Mais de 3 botões (deve falhar)
    console.log('4️⃣  Testando validação (mais de 3 botões - deve falhar)...');
    const test3 = await request(`/api/${CONFIG.session}/send-interactive-buttons`, {
      phone: [CONFIG.phone],
      message: 'Teste com 4 botões (deve falhar)',
      buttons: [
        { id: '1', title: 'Um' },
        { id: '2', title: 'Dois' },
        { id: '3', title: 'Três' },
        { id: '4', title: 'Quatro' }
      ]
    });
    console.log(`Status: ${test3.status} ${test3.status === 400 ? '(Esperado!)' : ''}`);
    console.log('Resposta:', JSON.stringify(test3.data, null, 2));
    console.log('');

    // Teste 5: Validação - Título muito longo (deve falhar)
    console.log('5️⃣  Testando validação (título > 20 chars - deve falhar)...');
    const test4 = await request(`/api/${CONFIG.session}/send-interactive-buttons`, {
      phone: [CONFIG.phone],
      message: 'Teste título muito longo (deve falhar)',
      buttons: [
        { id: '1', title: 'Este título tem mais de vinte caracteres' }
      ]
    });
    console.log(`Status: ${test4.status} ${test4.status === 400 ? '(Esperado!)' : ''}`);
    console.log('Resposta:', JSON.stringify(test4.data, null, 2));
    console.log('');

    // Teste 6: Detectar botões (precisa de um messageId real)
    console.log('6️⃣  Para testar detecção de botões:');
    console.log('   1. Pegue o messageId de uma mensagem com botões');
    console.log('   2. Execute:');
    console.log(`   
const messageId = 'true_${CONFIG.phone}@c.us_...'; // Seu messageId aqui
const detect = await request('/api/${CONFIG.session}/detect-buttons', { messageId });
console.log(detect);
    `);
    console.log('');

    // Teste 7: Responder botão (precisa de um messageId real)
    console.log('7️⃣  Para testar resposta a botões:');
    console.log('   1. Detecte os botões primeiro (teste 6)');
    console.log('   2. Execute:');
    console.log(`   
const reply = await request('/api/${CONFIG.session}/reply-button', {
  phone: ['${CONFIG.phone}'],
  buttonId: 'test_yes',
  buttonTitle: '✅ Sim',
  messageId: 'message_id_aqui'
});
console.log(reply);
    `);
    console.log('');

    console.log('🎉 Testes finalizados!\n');
    console.log('📝 Próximos passos:');
    console.log(`  1. Verifique as mensagens no WhatsApp: ${CONFIG.phone}`);
    console.log('  2. Para testar bot-to-bot, veja TESTING-GUIDE.md');
    console.log('  3. Logs detalhados no terminal do servidor\n');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.error('\n📝 Verifique:');
    console.error('  1. Servidor está rodando? (npm run dev)');
    console.error('  2. Token está correto?');
    console.error('  3. Sessão está ativa?\n');
  }
}

// Executar testes
runTests();
