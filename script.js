(function () {
  const body = document.body;
  const ESCALA_MIN = 0.85;
  const ESCALA_MAX = 1.6;
  const PADRAO = { escala: 1, contraste: false, fonte: false };
  let prefs = { ...PADRAO };

  /* Container de Toasts */
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast' + (tipo ? ' toast-' + tipo : '');
    const icone = tipo === 'sucesso' ? '✨' : tipo === 'libras' ? '🤟' : 'ℹ️';
    toast.innerHTML = '<span style="font-size: 1.2rem;">' + icone + '</span> <span>' + mensagem + '</span>';
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem('conecta-prefs') || 'null');
      if (salvo) prefs = { ...PADRAO, ...salvo };
    } catch (e) {
      prefs = { ...PADRAO };
    }
  }

  function aplicar() {
    document.documentElement.style.fontSize = (prefs.escala * 100) + '%';
    body.classList.toggle('contraste', prefs.contraste);
    body.classList.toggle('fonte-legivel', prefs.fonte);

    const btnContraste = document.querySelector('[data-acao="contraste"]');
    const btnFonte = document.querySelector('[data-acao="fonte"]');
    if (btnContraste) btnContraste.classList.toggle('ativo', prefs.contraste);
    if (btnFonte) btnFonte.classList.toggle('ativo', prefs.fonte);

    localStorage.setItem('conecta-prefs', JSON.stringify(prefs));
  }

  document.querySelectorAll('.barra-inner button, .barra-botoes button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const acao = btn.dataset.acao;
      if (acao === 'aumentar') {
        prefs.escala = Math.min(ESCALA_MAX, prefs.escala + 0.1);
        mostrarToast('Tamanho do texto aumentado', 'sucesso');
      }
      if (acao === 'diminuir') {
        prefs.escala = Math.max(ESCALA_MIN, prefs.escala - 0.1);
        mostrarToast('Tamanho do texto diminuído', 'sucesso');
      }
      if (acao === 'contraste') {
        prefs.contraste = !prefs.contraste;
        mostrarToast(prefs.contraste ? 'Alto contraste ativado' : 'Alto contraste desativado', 'sucesso');
      }
      if (acao === 'fonte') {
        prefs.fonte = !prefs.fonte;
        mostrarToast(prefs.fonte ? 'Fonte legível ativada' : 'Fonte padrão ativada', 'sucesso');
      }
      if (acao === 'reset') {
        prefs = { ...PADRAO };
        mostrarToast('Configurações de acessibilidade restauradas', 'info');
      }
      aplicar();
    });
  });

  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('navPrincipal');
  menuBtn.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', String(aberto));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('aberto');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const avisoIdioma = document.getElementById('avisoIdioma');
  document.querySelectorAll('[data-idioma]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modo = btn.dataset.idioma;
      const ehLibras = modo === 'libras';
      body.classList.toggle('modo-libras-ativo', ehLibras);
      if (avisoIdioma) {
        avisoIdioma.textContent = ehLibras
          ? '🤟 Modo Libras ativado! Os conteúdos priorizam vídeos e intérpretes em Língua Brasileira de Sinais.'
          : '🌐 Modo Português ativado! Conteúdo exibido em texto padrão.';
        avisoIdioma.style.color = ehLibras ? 'var(--magenta)' : 'var(--ciano)';
      }
      mostrarToast(ehLibras ? 'Modo Libras ativado!' : 'Modo Português ativado!', ehLibras ? 'libras' : 'sucesso');
    });
  });

  /* ---------------- robô de IA intérprete ---------------- */
  const gridSinaisIA = document.getElementById('gridSinaisIA');
  const handEsq = document.getElementById('handEsq');
  const handDir = document.getElementById('handDir');

  if (gridSinaisIA) {
    gridSinaisIA.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-sinal-ia');
      if (!btn) return;
      gridSinaisIA.querySelectorAll('.btn-sinal-ia').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');

      if (handEsq) handEsq.textContent = btn.dataset.handesq || '🤟';
      if (handDir) handDir.textContent = btn.dataset.handdir || '✋';

      const legenda = btn.dataset.legenda || '';
      if (textoLegendaLibras) textoLegendaLibras.textContent = legenda;

      mostrarToast('IA Robô sinalizando em Libras: ' + btn.textContent.trim(), 'libras');
    });
  }

  /* ---------------- aulas em Libras ---------------- */
  const listaAulasLibras = document.getElementById('listaAulasLibras');
  const tituloAulaLibras = document.getElementById('tituloAulaLibras');
  const textoLegendaLibras = document.getElementById('textoLegendaLibras');

  if (listaAulasLibras) {
    listaAulasLibras.addEventListener('click', (e) => {
      const btn = e.target.closest('.topico-libras-item');
      if (!btn) return;
      listaAulasLibras.querySelectorAll('.topico-libras-item').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      if (tituloAulaLibras) tituloAulaLibras.textContent = btn.dataset.titulo || '';
      if (textoLegendaLibras) textoLegendaLibras.textContent = btn.dataset.legenda || '';
    });
  }

  /* ---------------- datilologia (alfabeto em Libras) ---------------- */
  const EMOJIS_LIBRAS = {
    'A': '✊', 'B': '🖐️', 'C': '🫲', 'D': '☝️', 'E': '✊', 'F': '🤟',
    'G': '👆', 'H': '✌️', 'I': '🤙', 'J': '🤙', 'K': '✌️', 'L': '👆',
    'M': '🤘', 'N': '🤘', 'O': '👌', 'P': '🫳', 'Q': '🫲', 'R': '🤞',
    'S': '✊', 'T': '👊', 'U': '✌️', 'V': '✌️', 'W': '🤟', 'X': '🤞',
    'Y': '🤙', 'Z': '☝️'
  };

  function renderizarDatilologia(texto) {
    const resultadoDatilologia = document.getElementById('resultadoDatilologia');
    if (!resultadoDatilologia) return;
    resultadoDatilologia.innerHTML = '';

    if (!texto.trim()) {
      resultadoDatilologia.innerHTML = '<p style="color: var(--texto-mutado); margin: 0;">Clique nas letras acima ou digite no campo para ver a tradução em Libras...</p>';
      return;
    }

    for (const char of texto) {
      if (char === ' ') {
        const espaco = document.createElement('div');
        espaco.style.width = '20px';
        resultadoDatilologia.appendChild(espaco);
        continue;
      }

      const card = document.createElement('div');
      card.className = 'letra-card';
      const emoji = EMOJIS_LIBRAS[char] || '🤟';
      card.innerHTML =
        '<span style="font-size: 1.8rem;">' + emoji + '</span>' +
        '<strong style="color: var(--magenta); font-size: 1.1rem; margin-top: 0.2rem;">' + char + '</strong>';
      resultadoDatilologia.appendChild(card);
    }
  }

  function inicializarDatilologia() {
    const gridEl = document.getElementById('gridAlfabetoLibras');
    const inputEl = document.getElementById('inputDatilologia');
    const btnEx = document.getElementById('btnExemploConecta');
    const btnLimp = document.getElementById('btnLimparDatilologia');

    if (gridEl && gridEl.children.length === 0) {
      Object.keys(EMOJIS_LIBRAS).forEach((letra) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'alfabeto-card-item';
        item.title = 'Letra ' + letra + ' em Libras';
        item.innerHTML =
          '<span class="alfabeto-card-emoji">' + EMOJIS_LIBRAS[letra] + '</span>' +
          '<span class="alfabeto-card-letra">' + letra + '</span>';

        item.addEventListener('click', () => {
          if (inputEl) {
            inputEl.value = (inputEl.value + letra).slice(0, 20);
            renderizarDatilologia(inputEl.value);
            mostrarToast('Letra ' + letra + ' adicionada', 'libras');
          }
        });
        gridEl.appendChild(item);
      });
    }

    if (inputEl && !inputEl.dataset.bound) {
      inputEl.dataset.bound = 'true';
      const atualizar = () => {
        const texto = inputEl.value.toUpperCase().replace(/[^A-Z\s]/g, '');
        inputEl.value = texto;
        renderizarDatilologia(texto);
      };
      ['input', 'keyup', 'change'].forEach((ev) => inputEl.addEventListener(ev, atualizar));
      if (inputEl.value) atualizar();
    }

    if (btnEx && !btnEx.dataset.bound) {
      btnEx.dataset.bound = 'true';
      btnEx.addEventListener('click', () => {
        if (inputEl) {
          inputEl.value = 'CONECTA';
          renderizarDatilologia('CONECTA');
          mostrarToast('Exemplo "CONECTA" carregado!', 'libras');
        }
      });
    }

    if (btnLimp && !btnLimp.dataset.bound) {
      btnLimp.dataset.bound = 'true';
      btnLimp.addEventListener('click', () => {
        if (inputEl) {
          inputEl.value = '';
          renderizarDatilologia('');
          inputEl.focus();
        }
      });
    }
  }

  inicializarDatilologia();
  document.addEventListener('DOMContentLoaded', inicializarDatilologia);
  window.addEventListener('load', inicializarDatilologia);

  const form = document.getElementById('formContato');
  const msgForm = document.getElementById('msgForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgForm.textContent = 'Por favor, preencha seu nome e um e-mail válido.';
      return;
    }
    msgForm.textContent = 'Obrigado, ' + nome + '! Seu cadastro foi registrado.';
    form.reset();
  });

  /* ---------------- modal de cadastro ---------------- */
  const modalCadastro = document.getElementById('modalCadastro');
  const btnCadastro = document.getElementById('btnCadastro');
  const btnLogin = document.getElementById('btnLogin');
  const fecharModal = document.getElementById('fecharModal');
  const formCadastro = document.getElementById('formCadastro');
  const msgCadastro = document.getElementById('msgCadastro');

  /* ---------------- modal de login ---------------- */
  const modalLogin = document.getElementById('modalLogin');
  const fecharModalLogin = document.getElementById('fecharModalLogin');
  const formLogin = document.getElementById('formLogin');
  const msgLogin = document.getElementById('msgLogin');
  const linkParaCadastro = document.getElementById('linkParaCadastro');
  const linkParaLogin = document.getElementById('linkParaLogin');

  function abrirModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById('modalCadastro');
    if (modal) {
      modal.classList.add('aberto');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('cadNome');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function fecharModalCadastro() {
    const modal = document.getElementById('modalCadastro');
    const msg = document.getElementById('msgCadastro');
    if (modal) {
      modal.classList.remove('aberto');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (msg) msg.textContent = '';
    }
  }

  function abrirModalLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById('modalLogin');
    if (modal) {
      modal.classList.add('aberto');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('loginEmail');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function fecharModalLogin() {
    const modal = document.getElementById('modalLogin');
    const msg = document.getElementById('msgLogin');
    if (modal) {
      modal.classList.remove('aberto');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (msg) msg.textContent = '';
    }
  }

  window.abrirModal = abrirModal;
  window.abrirModalLogin = abrirModalLogin;
  window.fecharModalCadastro = fecharModalCadastro;
  window.fecharModalLogin = fecharModalLogin;

  if (btnCadastro) btnCadastro.addEventListener('click', abrirModal);
  if (btnLogin) btnLogin.addEventListener('click', abrirModalLogin);
  if (fecharModal) fecharModal.addEventListener('click', fecharModalCadastro);
  if (fecharModalLogin) fecharModalLogin.addEventListener('click', fecharModalLogin);

  if (linkParaCadastro) {
    linkParaCadastro.addEventListener('click', (e) => {
      e.preventDefault();
      fecharModalLogin();
      setTimeout(abrirModal, 150);
    });
  }

  if (linkParaLogin) {
    linkParaLogin.addEventListener('click', (e) => {
      e.preventDefault();
      fecharModalCadastro();
      setTimeout(abrirModalLogin, 150);
    });
  }

  if (modalCadastro) {
    modalCadastro.addEventListener('click', (e) => {
      if (e.target === modalCadastro) fecharModalCadastro();
    });
  }

  if (modalLogin) {
    modalLogin.addEventListener('click', (e) => {
      if (e.target === modalLogin) fecharModalLogin();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalCadastro.classList.contains('aberto')) fecharModalCadastro();
      if (modalLogin.classList.contains('aberto')) fecharModalLogin();
    }
  });

  function formatarCPF(valor) {
    return valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatarTelefone(valor) {
    return valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  const cadCPF = document.getElementById('cadCPF');
  const cadTelefone = document.getElementById('cadTelefone');

  if (cadCPF) {
    cadCPF.addEventListener('input', (e) => {
      e.target.value = formatarCPF(e.target.value);
    });
  }

  if (cadTelefone) {
    cadTelefone.addEventListener('input', (e) => {
      e.target.value = formatarTelefone(e.target.value);
    });
  }

  /* ---------------- contas padrão e lógica de login ---------------- */
  const CONTAS_PADRAO = [
    {
      id: 1,
      nome: 'Estefany Aluna',
      email: 'aluno@conecta.com',
      senha: '123456',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      endereco: 'Rua Principal, 100',
      cidade: 'São Paulo',
      uf: 'SP',
      interesse: 'Cursos de informática',
      dataCadastro: new Date().toISOString()
    },
    {
      id: 2,
      nome: 'Maria Julia Silva',
      email: 'maria@email.com',
      senha: '123456',
      cpf: '987.654.321-99',
      telefone: '(11) 91234-5678',
      endereco: 'Av. Brasil, 500',
      cidade: 'São Paulo',
      uf: 'SP',
      interesse: 'Conteúdos em Libras',
      dataCadastro: new Date().toISOString()
    }
  ];

  function getUsuariosRegistrados() {
    try {
      const stored = JSON.parse(localStorage.getItem('conecta-usuarios') || 'null');
      if (Array.isArray(stored) && stored.length > 0) return stored;
      localStorage.setItem('conecta-usuarios', JSON.stringify(CONTAS_PADRAO));
      return CONTAS_PADRAO;
    } catch (e) {
      return CONTAS_PADRAO;
    }
  }

  const btnPreencherTeste = document.getElementById('btnPreencherTeste');
  if (btnPreencherTeste) {
    btnPreencherTeste.addEventListener('click', () => {
      const loginEmail = document.getElementById('loginEmail');
      const loginSenha = document.getElementById('loginSenha');
      if (loginEmail) loginEmail.value = 'aluno@conecta.com';
      if (loginSenha) loginSenha.value = '123456';
      mostrarToast('Credenciais de teste preenchidas!', 'sucesso');
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('loginEmail');
      const senhaInput = document.getElementById('loginSenha');
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const senha = senhaInput ? senhaInput.value.trim() : '';

      if (!email || !senha) {
        msgLogin.textContent = 'Por favor, preencha todos os campos.';
        msgLogin.style.color = '#ff4d4d';
        return;
      }

      try {
        const usuarios = getUsuariosRegistrados();
        const usuario = usuarios.find(
          (u) => (u.email && u.email.toLowerCase() === email) && u.senha === senha
        );

        if (usuario) {
          salvarUsuarioLogado(usuario);
          msgLogin.textContent = 'Login realizado com sucesso! Entrando...';
          msgLogin.style.color = '#2bff9b';
          mostrarToast('Bem-vindo(a) de volta, ' + usuario.nome + '!', 'sucesso');

          setTimeout(() => {
            fecharModalLogin();
            if (formLogin) formLogin.reset();
            msgLogin.textContent = '';
            msgLogin.style.color = '';
            verificarUsuarioLogado();
            mostrarPerfil();
          }, 700);
        } else {
          msgLogin.textContent = 'E-mail ou senha incorretos. (Dica de teste: aluno@conecta.com / 123456)';
          msgLogin.style.color = '#ff4d4d';
        }
      } catch (error) {
        msgLogin.textContent = 'Erro ao fazer login. Tente novamente.';
        msgLogin.style.color = '#ff4d4d';
      }
    });
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;

    return cpf[9] == digito1 && cpf[10] == digito2;
  }

  formCadastro.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = formCadastro.cadNome.value.trim();
    const email = formCadastro.cadEmail.value.trim();
    const senha = formCadastro.cadSenha.value.trim();
    const cpf = formCadastro.cadCPF.value.trim();
    const telefone = formCadastro.cadTelefone.value.trim();
    const endereco = formCadastro.cadEndereco.value.trim();
    const cidade = formCadastro.cadCidade.value.trim();
    const uf = formCadastro.cadUF.value;
    const interesse = formCadastro.cadInteresse.value;
    const aceiteTermos = document.getElementById('aceiteTermos').checked;

    if (!nome || !email || !senha) {
      msgCadastro.textContent = 'Por favor, preencha os campos obrigatórios (*).';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgCadastro.textContent = 'Por favor, insira um e-mail válido.';
      return;
    }

    if (senha.length < 6) {
      msgCadastro.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (cpf && !validarCPF(cpf)) {
      msgCadastro.textContent = 'Por favor, insira um CPF válido.';
      return;
    }

    if (!aceiteTermos) {
      msgCadastro.textContent = 'Você precisa aceitar os termos de uso para continuar.';
      return;
    }

    const usuario = {
      id: Date.now(),
      nome,
      email,
      senha,
      cpf,
      telefone,
      endereco,
      cidade,
      uf,
      interesse,
      dataCadastro: new Date().toISOString()
    };

    try {
      const usuarios = JSON.parse(localStorage.getItem('conecta-usuarios') || '[]');
      usuarios.push(usuario);
      localStorage.setItem('conecta-usuarios', JSON.stringify(usuarios));

      msgCadastro.textContent = 'Cadastro realizado com sucesso, ' + nome + '! Bem-vindo ao Conecta+.';
      msgCadastro.style.color = '#2bff9b';

      setTimeout(() => {
        fecharModalCadastro();
        formCadastro.reset();
        msgCadastro.style.color = '';
      }, 2000);

      salvarUsuarioLogado(usuario);
      btnCadastro.textContent = 'Perfil';
      btnCadastro.onclick = mostrarPerfil;

    } catch (error) {
      msgCadastro.textContent = 'Erro ao salvar cadastro. Tente novamente.';
    }
  });

  /* ---------------- cadastro de clientes na página ---------------- */
  const formCadastroPagina = document.getElementById('formCadastroPagina');
  const msgCadastroPagina = document.getElementById('msgCadastroPagina');
  const pagCadCPF = document.getElementById('pagCadCPF');
  const pagCadTelefone = document.getElementById('pagCadTelefone');
  const contadorClientesTotal = document.getElementById('contadorClientesTotal');

  function atualizarContadorClientes() {
    if (!contadorClientesTotal) return;
    try {
      const usuarios = JSON.parse(localStorage.getItem('conecta-usuarios') || '[]');
      const total = 128 + usuarios.length;
      contadorClientesTotal.textContent = total + '+';
    } catch (e) {
      contadorClientesTotal.textContent = '128+';
    }
  }

  atualizarContadorClientes();

  if (pagCadCPF) {
    pagCadCPF.addEventListener('input', (e) => {
      e.target.value = formatarCPF(e.target.value);
    });
  }

  if (pagCadTelefone) {
    pagCadTelefone.addEventListener('input', (e) => {
      e.target.value = formatarTelefone(e.target.value);
    });
  }

  if (formCadastroPagina) {
    formCadastroPagina.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = formCadastroPagina.pagCadNome.value.trim();
      const email = formCadastroPagina.pagCadEmail.value.trim();
      const senha = formCadastroPagina.pagCadSenha.value.trim();
      const cpf = formCadastroPagina.pagCadCPF.value.trim();
      const telefone = formCadastroPagina.pagCadTelefone.value.trim();
      const interesse = formCadastroPagina.pagCadInteresse.value;
      const aceiteTermos = document.getElementById('pagAceiteTermos').checked;

      if (!nome || !email || !senha) {
        msgCadastroPagina.textContent = 'Por favor, preencha os campos obrigatórios (*).';
        msgCadastroPagina.style.color = '#ff4d4d';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msgCadastroPagina.textContent = 'Por favor, insira um e-mail válido.';
        msgCadastroPagina.style.color = '#ff4d4d';
        return;
      }

      if (senha.length < 6) {
        msgCadastroPagina.textContent = 'A senha deve ter no mínimo 6 caracteres.';
        msgCadastroPagina.style.color = '#ff4d4d';
        return;
      }

      if (cpf && !validarCPF(cpf)) {
        msgCadastroPagina.textContent = 'Por favor, insira um CPF válido.';
        msgCadastroPagina.style.color = '#ff4d4d';
        return;
      }

      if (!aceiteTermos) {
        msgCadastroPagina.textContent = 'Você precisa aceitar os termos de uso para continuar.';
        msgCadastroPagina.style.color = '#ff4d4d';
        return;
      }

      const usuario = {
        id: Date.now(),
        nome,
        email,
        senha,
        cpf,
        telefone,
        interesse,
        dataCadastro: new Date().toISOString()
      };

      try {
        const usuarios = JSON.parse(localStorage.getItem('conecta-usuarios') || '[]');
        usuarios.push(usuario);
        localStorage.setItem('conecta-usuarios', JSON.stringify(usuarios));

        msgCadastroPagina.textContent = '🎉 Conta criada com sucesso, ' + nome + '! Bem-vindo(a) ao Conecta+.';
        msgCadastroPagina.style.color = '#2bff9b';
        mostrarToast('Conta criada com sucesso! Bem-vindo(a), ' + nome, 'sucesso');

        salvarUsuarioLogado(usuario);
        verificarUsuarioLogado();
        atualizarContadorClientes();

        setTimeout(() => {
          formCadastroPagina.reset();
          msgCadastroPagina.textContent = '';
          mostrarPerfil();
        }, 1800);

      } catch (error) {
        msgCadastroPagina.textContent = 'Erro ao salvar cadastro. Tente novamente.';
        msgCadastroPagina.style.color = '#ff4d4d';
      }
    });
  }

  function salvarUsuarioLogado(usuario) {
    localStorage.setItem('conecta-usuario-logado', JSON.stringify(usuario));
  }

  function getUsuarioLogado() {
    try {
      return JSON.parse(localStorage.getItem('conecta-usuario-logado') || 'null');
    } catch (e) {
      return null;
    }
  }

  function mostrarPerfil() {
    const usuario = getUsuarioLogado();
    if (!usuario) {
      abrirModal();
      return;
    }

    const secaoPerfil = document.getElementById('perfil');
    secaoPerfil.style.display = 'block';

    document.getElementById('perfilIniciais').textContent = iniciais(usuario.nome);
    document.getElementById('perfilNome').textContent = usuario.nome;
    document.getElementById('perfilEmail').textContent = usuario.email;

    const data = new Date(usuario.dataCadastro);
    document.getElementById('perfilData').textContent = data.toLocaleDateString('pt-BR');

    document.getElementById('perfilCPF').textContent = usuario.cpf || 'Não informado';
    document.getElementById('perfilTelefone').textContent = usuario.telefone || 'Não informado';
    document.getElementById('perfilEndereco').textContent = usuario.endereco || 'Não informado';
    document.getElementById('perfilCidadeUF').textContent =
      (usuario.cidade && usuario.uf) ? `${usuario.cidade}/${usuario.uf}` :
        (usuario.cidade || usuario.uf || 'Não informado');
    document.getElementById('perfilInteresse').textContent = usuario.interesse || 'Não informado';

    secaoPerfil.scrollIntoView({ behavior: 'smooth' });
  }

  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  const btnSair = document.getElementById('btnSair');

  btnEditarPerfil.addEventListener('click', () => {
    const usuario = getUsuarioLogado();
    if (usuario) {
      formCadastro.cadNome.value = usuario.nome;
      formCadastro.cadEmail.value = usuario.email;
      formCadastro.cadSenha.value = usuario.senha || '';
      formCadastro.cadCPF.value = usuario.cpf || '';
      formCadastro.cadTelefone.value = usuario.telefone || '';
      formCadastro.cadEndereco.value = usuario.endereco || '';
      formCadastro.cadCidade.value = usuario.cidade || '';
      formCadastro.cadUF.value = usuario.uf || '';
      formCadastro.cadInteresse.value = usuario.interesse || '';
      document.getElementById('aceiteTermos').checked = true;

      abrirModal();
    }
  });

  btnSair.addEventListener('click', () => {
    localStorage.removeItem('conecta-usuario-logado');
    document.getElementById('perfil').style.display = 'none';
    window.location.href = '#inicio';
    verificarUsuarioLogado();
  });

  function verificarUsuarioLogado() {
    const usuario = getUsuarioLogado();
    const linkPerfil = document.getElementById('linkPerfil');
    const navAvatarIniciais = document.getElementById('navAvatarIniciais');

    if (usuario) {
      if (btnLogin) btnLogin.style.display = 'none';
      if (btnCadastro) btnCadastro.style.display = 'none';
      if (linkPerfil) {
        linkPerfil.style.display = 'inline-flex';
        linkPerfil.onclick = mostrarPerfil;
        if (navAvatarIniciais) navAvatarIniciais.textContent = iniciais(usuario.nome);
      }
    } else {
      if (btnLogin) btnLogin.style.display = 'inline-block';
      if (btnCadastro) btnCadastro.style.display = 'inline-block';
      if (linkPerfil) linkPerfil.style.display = 'none';
    }
  }

  /* Botão mostrar/ocultar senha */
  document.querySelectorAll('.btn-mostrar-senha').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        const ehSenha = input.type === 'password';
        input.type = ehSenha ? 'text' : 'password';
        btn.textContent = ehSenha ? '🔒' : '👁️';
      }
    });
  });

  /* Clique nos cards com links */
  document.querySelectorAll('.card.link').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        const link = card.querySelector('a');
        if (link) link.click();
      }
    });
  });

  /* Clique nos cards de curso */
  document.querySelectorAll('.card.curso').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const titulo = card.querySelector('h3')?.textContent || 'Curso';
      if (!getUsuarioLogado()) {
        abrirModal();
      } else {
        mostrarPerfil();
      }
    });
  });

  verificarUsuarioLogado();

  /* ---------------- comunidade ---------------- */
  const USUARIO = 'Você';
  const feedEl = document.getElementById('feed');
  const formPost = document.getElementById('formPost');
  const msgPost = document.getElementById('msgPost');
  const listaGrupos = document.getElementById('listaGrupos');
  let grupoAtivo = 'Todos';

  const POSTS_INICIAIS = [
    {
      id: 1, autor: 'Maria Julia', grupo: 'Informática', minutos: 12, libras: false,
      texto: 'Consegui criar meu primeiro e-mail sozinha depois do curso de informática básica! Quem estiver começando, não desista — é mais simples do que parece.',
      curtidas: 14, curtido: false,
      comentarios: [
        { autor: 'Rafael Souza', texto: 'Parabéns, Maria! Também comecei essa semana.' },
        { autor: 'Ana Lima', texto: 'Que ótimo! Depois conta como foi organizar as pastas.' }
      ]
    },
    {
      id: 2, autor: 'Carlos Pereira', grupo: 'Serviços', minutos: 48, libras: false,
      texto: 'Alguém sabe explicar como agendar atendimento no posto de saúde pela internet? Nunca fiz isso e fico com medo de errar.',
      curtidas: 6, curtido: false,
      comentarios: [
        { autor: 'Ana Lima', texto: 'Tem um passo a passo na área de Serviços Públicos aqui da plataforma!' }
      ]
    },
    {
      id: 3, autor: 'Ana Lima', grupo: 'Libras', minutos: 95, libras: true,
      texto: 'Gravei um vídeo em Libras explicando como usar o navegador e fazer buscas seguras. Espero que ajude a comunidade surda!',
      curtidas: 27, curtido: false,
      comentarios: [
        { autor: 'Rafael Souza', texto: 'Muito obrigado por compartilhar!' }
      ]
    },
    {
      id: 4, autor: 'Rafael Souza', grupo: 'Empregos', minutos: 180, libras: false,
      texto: 'Fiz o curso de qualificação indicado aqui e fui chamado para uma entrevista. Dica: capriche no currículo e treine falar sobre o que você aprendeu.',
      curtidas: 33, curtido: false,
      comentarios: []
    }
  ];

  let posts = [];
  try {
    posts = JSON.parse(localStorage.getItem('conecta-posts') || 'null') || POSTS_INICIAIS;
  } catch (e) {
    posts = POSTS_INICIAIS;
  }

  function salvarPosts() {
    localStorage.setItem('conecta-posts', JSON.stringify(posts));
  }

  function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  function tempo(minutos) {
    if (minutos < 1) return 'agora mesmo';
    if (minutos < 60) return 'há ' + minutos + ' min';
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return 'há ' + horas + (horas === 1 ? ' hora' : ' horas');
    const dias = Math.floor(horas / 24);
    return 'há ' + dias + (dias === 1 ? ' dia' : ' dias');
  }

  function renderFeed() {
    const visiveis = posts.filter((p) => grupoAtivo === 'Todos' || p.grupo === grupoAtivo);
    feedEl.innerHTML = '';

    if (!visiveis.length) {
      const vazio = document.createElement('p');
      vazio.className = 'nota';
      vazio.textContent = 'Ainda não há publicações neste grupo. Seja a primeira pessoa a publicar!';
      feedEl.appendChild(vazio);
      return;
    }

    visiveis.forEach((post) => {
      const artigo = document.createElement('article');
      artigo.className = 'post';

      const topo = document.createElement('div');
      topo.className = 'post-topo';
      topo.innerHTML =
        '<span class="avatar" aria-hidden="true">' + iniciais(post.autor) + '</span>' +
        '<span><span class="post-nome">' + post.autor + '</span><br>' +
        '<span class="post-meta">' + tempo(post.minutos) + '</span></span>' +
        '<span class="etiqueta">' + post.grupo + '</span>';
      artigo.appendChild(topo);

      const texto = document.createElement('p');
      texto.className = 'post-texto';
      texto.textContent = post.texto;
      artigo.appendChild(texto);

      if (post.libras) {
        const libras = document.createElement('p');
        libras.className = 'post-libras';
        libras.innerHTML = '<span aria-hidden="true">🤟</span> Publicação com vídeo em Libras';
        artigo.appendChild(libras);
      }

      const barra = document.createElement('div');
      barra.className = 'post-barra';

      const btnCurtir = document.createElement('button');
      btnCurtir.type = 'button';
      btnCurtir.className = 'acao' + (post.curtido ? ' curtido' : '');
      btnCurtir.textContent = '♥ Curtir (' + post.curtidas + ')';
      btnCurtir.setAttribute('aria-pressed', String(post.curtido));
      btnCurtir.addEventListener('click', () => {
        post.curtido = !post.curtido;
        post.curtidas += post.curtido ? 1 : -1;
        salvarPosts();
        renderFeed();
      });

      const btnComentar = document.createElement('button');
      btnComentar.type = 'button';
      btnComentar.className = 'acao';
      btnComentar.textContent = '💬 Comentar (' + post.comentarios.length + ')';

      const btnResponder = document.createElement('button');
      btnResponder.type = 'button';
      btnResponder.className = 'acao';
      btnResponder.textContent = '🤟 Responder em Libras';
      btnResponder.addEventListener('click', () => {
        post.comentarios.push({ autor: USUARIO, texto: 'Respondeu com um vídeo em Libras 🤟' });
        salvarPosts();
        renderFeed();
      });

      barra.append(btnCurtir, btnComentar, btnResponder);
      artigo.appendChild(barra);

      const listaComentarios = document.createElement('div');
      listaComentarios.className = 'comentarios';
      post.comentarios.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'comentario';
        item.innerHTML =
          '<span class="avatar" aria-hidden="true">' + iniciais(c.autor) + '</span>' +
          '<p><b>' + c.autor + '</b><br>' + c.texto + '</p>';
        listaComentarios.appendChild(item);
      });
      if (post.comentarios.length) artigo.appendChild(listaComentarios);

      const formComentario = document.createElement('form');
      formComentario.className = 'form-comentario';
      const inputId = 'comentario-' + post.id;
      formComentario.innerHTML =
        '<label class="sr" for="' + inputId + '">Escrever comentário</label>' +
        '<input id="' + inputId + '" type="text" placeholder="Escreva um comentário...">' +
        '<button type="submit">Enviar</button>';
      formComentario.addEventListener('submit', (e) => {
        e.preventDefault();
        const campo = formComentario.querySelector('input');
        const valor = campo.value.trim();
        if (!valor) return;
        post.comentarios.push({ autor: USUARIO, texto: valor });
        salvarPosts();
        renderFeed();
      });
      artigo.appendChild(formComentario);

      btnComentar.addEventListener('click', () => {
        const campo = document.getElementById(inputId);
        if (campo) campo.focus();
      });

      feedEl.appendChild(artigo);
    });
  }

  listaGrupos.addEventListener('click', (e) => {
    const btn = e.target.closest('.grupo');
    if (!btn) return;
    listaGrupos.querySelectorAll('.grupo').forEach((b) => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    grupoAtivo = btn.dataset.grupo;
    renderFeed();
  });

  formPost.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = document.getElementById('textoPost').value.trim();
    if (!texto) {
      msgPost.textContent = 'Escreva uma mensagem antes de publicar.';
      return;
    }
    posts.unshift({
      id: Date.now(),
      autor: USUARIO,
      grupo: document.getElementById('grupoPost').value,
      minutos: 0,
      libras: document.getElementById('videoLibras').checked,
      texto: texto,
      curtidas: 0,
      curtido: false,
      comentarios: []
    });
    salvarPosts();
    formPost.reset();
    msgPost.textContent = 'Publicado na comunidade!';
    grupoAtivo = 'Todos';
    listaGrupos.querySelectorAll('.grupo').forEach((b) => b.classList.toggle('ativo', b.dataset.grupo === 'Todos'));
    renderFeed();
  });

  carregar();
  aplicar();
  grupoAtivo = 'Todos';
  listaGrupos.querySelectorAll('.grupo').forEach((b) => b.classList.toggle('ativo', b.dataset.grupo === 'Todos'));
  renderFeed();
})();