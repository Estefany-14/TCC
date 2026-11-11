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

  console.log('🔍 Formulário de cadastro encontrado:', formCadastro);
  console.log('🔍 Mensagem de cadastro encontrada:', msgCadastro);

  /* ---------------- modal de login ---------------- */
  const modalLogin = document.getElementById('modalLogin');
  const btnFecharModalLogin = document.getElementById('fecharModalLogin');
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
  if (btnFecharModalLogin) btnFecharModalLogin.addEventListener('click', fecharModalLogin);

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

  const tipoLoginUsuario = document.getElementById('tipoLoginUsuario');
  const tipoLoginAdmin = document.getElementById('tipoLoginAdmin');
  const modalLoginTitulo = document.getElementById('modalLoginTitulo');
  const modalLoginSubtitulo = document.getElementById('modalLoginSubtitulo');
  const dicaLoginUsuario = document.getElementById('dicaLoginUsuario');
  const dicaLoginAdmin = document.getElementById('dicaLoginAdmin');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  const btnPreencherAdmin = document.getElementById('btnPreencherAdmin');

  let modoLoginAtual = 'usuario';

  function setModoLogin(modo) {
    modoLoginAtual = modo;
    if (modo === 'admin') {
      if (tipoLoginAdmin) {
        tipoLoginAdmin.classList.add('ativo');
        tipoLoginAdmin.setAttribute('aria-selected', 'true');
      }
      if (tipoLoginUsuario) {
        tipoLoginUsuario.classList.remove('ativo');
        tipoLoginUsuario.setAttribute('aria-selected', 'false');
      }
      if (modalLoginTitulo) modalLoginTitulo.innerHTML = 'Acesso Administrativo 🛡️';
      if (modalLoginSubtitulo) modalLoginSubtitulo.textContent = 'Painel exclusivo para gestão de cadastros MySQL';
      if (dicaLoginUsuario) dicaLoginUsuario.style.display = 'none';
      if (dicaLoginAdmin) dicaLoginAdmin.style.display = 'flex';
      if (btnSubmitLogin) btnSubmitLogin.textContent = 'Entrar como Administrador';
    } else {
      if (tipoLoginUsuario) {
        tipoLoginUsuario.classList.add('ativo');
        tipoLoginUsuario.setAttribute('aria-selected', 'true');
      }
      if (tipoLoginAdmin) {
        tipoLoginAdmin.classList.remove('ativo');
        tipoLoginAdmin.setAttribute('aria-selected', 'false');
      }
      if (modalLoginTitulo) modalLoginTitulo.textContent = 'Bem-vindo de volta!';
      if (modalLoginSubtitulo) modalLoginSubtitulo.textContent = 'Entre na sua conta para continuar';
      if (dicaLoginUsuario) dicaLoginUsuario.style.display = 'flex';
      if (dicaLoginAdmin) dicaLoginAdmin.style.display = 'none';
      if (btnSubmitLogin) btnSubmitLogin.textContent = 'Entrar';
    }
  }

  if (tipoLoginUsuario) {
    tipoLoginUsuario.addEventListener('click', () => setModoLogin('usuario'));
  }
  if (tipoLoginAdmin) {
    tipoLoginAdmin.addEventListener('click', () => setModoLogin('admin'));
  }

  if (btnPreencherAdmin) {
    btnPreencherAdmin.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const senhaInput = document.getElementById('loginSenha');
      if (emailInput) emailInput.value = 'admin@conecta.com';
      if (senhaInput) senhaInput.value = 'admin123';
      mostrarToast('Credenciais de Administrador preenchidas!', 'sucesso');
    });
  }

  function abrirModalLoginAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const usuario = getUsuarioLogado();
    if (usuario && (usuario.tipo === 'admin' || usuario.email === 'admin@conecta.com')) {
      abrirPainelAdmin();
      return;
    }
    setModoLogin('admin');
    abrirModalLogin();
  }
  window.abrirModalLoginAdmin = abrirModalLoginAdmin;

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
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
        // Tentar autenticar via backend MySQL
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.sucesso && data.usuario) {
          salvarUsuarioLogado(data.usuario);
          const ehAdmin = data.usuario.tipo === 'admin' || data.usuario.email === 'admin@conecta.com';
          msgLogin.textContent = ehAdmin ? 'Acesso Administrativo Autorizado! Abrindo painel...' : 'Login realizado com sucesso! Entrando...';
          msgLogin.style.color = '#2bff9b';
          mostrarToast(ehAdmin ? '🛡️ Bem-vindo ao Painel do Administrador!' : 'Bem-vindo(a) de volta, ' + data.usuario.nome + '!', 'sucesso');

          setTimeout(() => {
            fecharModalLogin();
            if (formLogin) formLogin.reset();
            msgLogin.textContent = '';
            msgLogin.style.color = '';
            verificarUsuarioLogado();
            if (ehAdmin) {
              abrirPainelAdmin();
            } else {
              mostrarPerfil();
            }
          }, 700);
          return;
        } else {
          msgLogin.textContent = data.mensagem || 'E-mail ou senha incorretos.';
          msgLogin.style.color = '#ff4d4d';
          return;
        }
      } catch (error) {
        console.warn('Backend offline, usando fallback local:', error);
        // Fallback especial para admin caso o servidor esteja fora
        if (email === 'admin@conecta.com' && senha === 'admin123') {
          const adminObj = {
            id: 9999,
            nome: 'Administrador Conecta+',
            email: 'admin@conecta.com',
            tipo: 'admin',
            dataCadastro: new Date().toISOString()
          };
          salvarUsuarioLogado(adminObj);
          msgLogin.textContent = 'Acesso Administrativo Autorizado (Modo Offline)!';
          msgLogin.style.color = '#2bff9b';
          mostrarToast('🛡️ Bem-vindo ao Painel do Administrador!', 'sucesso');
          setTimeout(() => {
            fecharModalLogin();
            if (formLogin) formLogin.reset();
            msgLogin.textContent = '';
            verificarUsuarioLogado();
            abrirPainelAdmin();
          }, 700);
          return;
        }

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

  if (formCadastro) {
    console.log('✅ Event listener do formCadastro adicionado');
    formCadastro.addEventListener('submit', async (e) => {
      console.log('📝 Formulário de cadastro submetido!');
      e.preventDefault();

      const dados = {
        nome: formCadastro.cadNome.value.trim(),
        email: formCadastro.cadEmail.value.trim(),
        senha: formCadastro.cadSenha.value.trim(),
        cpf: formCadastro.cadCPF.value.trim(),
        telefone: formCadastro.cadTelefone.value.trim(),
        endereco: formCadastro.cadEndereco.value.trim(),
        cidade: formCadastro.cadCidade.value.trim(),
        uf: formCadastro.cadUF.value,
        interesse: formCadastro.cadInteresse.value,
      };

      const aceiteTermos = document.getElementById('aceiteTermos').checked;

      console.log('📋 Dados do formulário:', dados);

      if (!dados.nome || !dados.email || !dados.senha) {
        msgCadastro.textContent = 'Por favor, preencha os campos obrigatórios (*).';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
        msgCadastro.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }

      if (dados.senha.length < 6) {
        msgCadastro.textContent = 'A senha deve ter no mínimo 6 caracteres.';
        return;
      }

      if (dados.cpf && !validarCPF(dados.cpf)) {
        msgCadastro.textContent = 'Por favor, insira um CPF válido.';
        return;
      }

      if (!aceiteTermos) {
        msgCadastro.textContent = 'Você precisa aceitar os termos de uso para continuar.';
        return;
      }

      const usuario = {
        id: Date.now(),
        ...dados,
        dataCadastro: new Date().toISOString()
      };

      try {
        console.log('🌐 Enviando dados para o backend...');
        const response = await fetch('http://localhost:3000/api/cadastro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });

        console.log('📦 Resposta do servidor:', response.status);
        const data = await response.json();
        console.log('📄 Dados da resposta:', data);

        if (data.sucesso) {
          msgCadastro.textContent = 'Cadastro realizado com sucesso, ' + dados.nome + '! Bem-vindo ao Conecta+.';
          msgCadastro.style.color = '#2bff9b';

          const usuarioComId = {
            ...usuario,
            id: data.usuarioId
          };
          salvarUsuarioLogado(usuarioComId);

          setTimeout(() => {
            fecharModalCadastro();
            formCadastro.reset();
            msgCadastro.style.color = '';
            verificarUsuarioLogado();
            mostrarPerfil();
          }, 2000);
        } else {
          msgCadastro.textContent = data.mensagem || 'Erro ao realizar cadastro.';
          msgCadastro.style.color = '#ff4d4d';
        }
      } catch (error) {
        console.error('❌ Erro ao conectar com servidor:', error);
        msgCadastro.textContent = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
        msgCadastro.style.color = '#ff4d4d';
      }
    });
  }

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
    formCadastroPagina.addEventListener('submit', async (e) => {
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
        // Enviar dados para o backend MySQL
        const response = await fetch('http://localhost:3000/api/cadastro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            email,
            senha,
            cpf,
            telefone,
            interesse
          })
        });

        const data = await response.json();

        if (data.sucesso) {
          msgCadastroPagina.textContent = '🎉 Conta criada com sucesso, ' + nome + '! Bem-vindo(a) ao Conecta+.';
          msgCadastroPagina.style.color = '#2bff9b';
          mostrarToast('Conta criada com sucesso! Bem-vindo(a), ' + nome, 'sucesso');

          // Salvar usuário logado com ID do banco
          const usuarioComId = {
            ...usuario,
            id: data.usuarioId
          };
          salvarUsuarioLogado(usuarioComId);
          verificarUsuarioLogado();
          atualizarContadorClientes();

          setTimeout(() => {
            formCadastroPagina.reset();
            msgCadastroPagina.textContent = '';
            mostrarPerfil();
          }, 1800);
        } else {
          msgCadastroPagina.textContent = data.mensagem || 'Erro ao realizar cadastro.';
          msgCadastroPagina.style.color = '#ff4d4d';
        }

      } catch (error) {
        console.error('Erro ao conectar com servidor:', error);
        msgCadastroPagina.textContent = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
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
    const btnNavAdmin = document.getElementById('btnNavAdmin');

    if (usuario) {
      if (btnLogin) btnLogin.style.display = 'none';
      if (btnCadastro) btnCadastro.style.display = 'none';
      if (linkPerfil) {
        linkPerfil.style.display = 'inline-flex';
        linkPerfil.onclick = mostrarPerfil;
        if (navAvatarIniciais) navAvatarIniciais.textContent = iniciais(usuario.nome);
      }
      if (btnNavAdmin) {
        const ehAdmin = usuario.tipo === 'admin' || usuario.email === 'admin@conecta.com';
        btnNavAdmin.style.display = ehAdmin ? 'inline-flex' : 'none';
      }
    } else {
      if (btnLogin) btnLogin.style.display = 'inline-block';
      if (btnCadastro) btnCadastro.style.display = 'inline-block';
      if (linkPerfil) linkPerfil.style.display = 'none';
      if (btnNavAdmin) btnNavAdmin.style.display = 'none';
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

  /* ---------------- SISTEMA DO PAINEL DE ADMINISTRADOR ---------------- */
  const modalAdmin = document.getElementById('modalAdmin');
  const fecharModalAdmin = document.getElementById('fecharModalAdmin');
  const btnAtualizarAdmin = document.getElementById('btnAtualizarAdmin');
  const btnSairAdmin = document.getElementById('btnSairAdmin');
  const adminBuscaUsuarios = document.getElementById('adminBuscaUsuarios');
  const adminFiltroInteresse = document.getElementById('adminFiltroInteresse');
  const adminTabelaCorpo = document.getElementById('adminTabelaCorpo');
  const adminTotalUsuarios = document.getElementById('adminTotalUsuarios');
  const adminContadorFiltrados = document.getElementById('adminContadorFiltrados');
  const adminContadorTotal = document.getElementById('adminContadorTotal');
  const iconeAtualizar = document.getElementById('iconeAtualizar');

  let usuariosCarregadosAdmin = [];

  async function abrirPainelAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (modalAdmin) {
      modalAdmin.classList.add('aberto');
      modalAdmin.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      await carregarDadosAdmin();
    }
  }

  function fecharPainelAdmin() {
    if (modalAdmin) {
      modalAdmin.classList.remove('aberto');
      modalAdmin.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  window.abrirPainelAdmin = abrirPainelAdmin;
  window.fecharPainelAdmin = fecharPainelAdmin;

  if (fecharModalAdmin) fecharModalAdmin.addEventListener('click', fecharPainelAdmin);
  if (modalAdmin) {
    modalAdmin.addEventListener('click', (e) => {
      if (e.target === modalAdmin) fecharPainelAdmin();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalAdmin && modalAdmin.classList.contains('aberto')) fecharPainelAdmin();
    }
  });

  if (btnAtualizarAdmin) {
    btnAtualizarAdmin.addEventListener('click', async () => {
      if (iconeAtualizar) iconeAtualizar.style.transform = 'rotate(360deg)';
      await carregarDadosAdmin();
      mostrarToast('Dados sincronizados com o MySQL!', 'sucesso');
      setTimeout(() => { if (iconeAtualizar) iconeAtualizar.style.transform = ''; }, 400);
    });
  }

  if (btnSairAdmin) {
    btnSairAdmin.addEventListener('click', () => {
      localStorage.removeItem('conecta-usuario-logado');
      fecharPainelAdmin();
      verificarUsuarioLogado();
      mostrarToast('Sessão de Administrador finalizada.', 'info');
    });
  }

  // ==========================================
  // GESTÃO DO PAINEL ADMIN (USUÁRIOS, PRODUTOS, PEDIDOS)
  // ==========================================
  let produtosCarregadosAdmin = [];
  let pedidosCarregadosAdmin = [];

  const mockProdutosFallback = [
    { id: 1, nome: 'Teclado com Caracteres Ampliados', categoria_nome: 'Tecnologia Assistiva', preco: 120.00, estoque: 15, tipo: 'produto', data_cadastro: '2026-11-11' },
    { id: 2, nome: 'Mouse Ergonômico Vertical Adaptado', categoria_nome: 'Tecnologia Assistiva', preco: 89.90, estoque: 25, tipo: 'produto', data_cadastro: '2026-11-11' },
    { id: 3, nome: 'Curso de Informática Básica para Iniciantes', categoria_nome: 'Cursos e Treinamentos', preco: 0.00, estoque: 999, tipo: 'curso', data_cadastro: '2026-11-11' },
    { id: 4, nome: 'Pacote Office e Ferramentas Digitais', categoria_nome: 'Cursos e Treinamentos', preco: 0.00, estoque: 999, tipo: 'curso', data_cadastro: '2026-11-11' },
    { id: 5, nome: 'Dicionário Digital e Guia Prático de Libras', categoria_nome: 'Materiais em Libras', preco: 45.00, estoque: 50, tipo: 'produto', data_cadastro: '2026-11-11' },
    { id: 6, nome: 'Headset com Microfone e Redutor de Ruído', categoria_nome: 'Periféricos e Acessórios', preco: 79.90, estoque: 30, tipo: 'produto', data_cadastro: '2026-11-11' }
  ];

  const mockPedidosFallback = [
    { id: 1, cliente_nome: 'Estefany Aluna', cliente_email: 'aluno@conecta.com', data_pedido: '2026-11-11T08:40:00Z', status: 'Entregue', forma_pagamento: 'Pix', valor_total: 120.00 },
    { id: 2, cliente_nome: 'Maria Julia Silva', cliente_email: 'maria@email.com', data_pedido: '2026-11-11T09:15:00Z', status: 'Aprovado', forma_pagamento: 'Cartão de Crédito', valor_total: 45.00 },
    { id: 3, cliente_nome: 'Carlos Eduardo Souza', cliente_email: 'carlos@email.com', data_pedido: '2026-11-11T10:00:00Z', status: 'Pendente', forma_pagamento: 'Boleto Bancário', valor_total: 169.80 }
  ];

  function alternarAbaAdmin(aba) {
    const paineis = {
      usuarios: document.getElementById('adminPainelUsuarios'),
      produtos: document.getElementById('adminPainelProdutos'),
      pedidos: document.getElementById('adminPainelPedidos')
    };

    const botoes = {
      usuarios: document.getElementById('adminTabBtnUsuarios'),
      produtos: document.getElementById('adminTabBtnProdutos'),
      pedidos: document.getElementById('adminTabBtnPedidos')
    };

    Object.keys(paineis).forEach((key) => {
      if (paineis[key]) paineis[key].classList.toggle('ativo', key === aba);
      if (botoes[key]) {
        botoes[key].classList.toggle('ativa', key === aba);
        botoes[key].setAttribute('aria-selected', key === aba ? 'true' : 'false');
      }
    });
  }
  window.alternarAbaAdmin = alternarAbaAdmin;

  async function carregarDadosAdmin() {
    try {
      if (adminTabelaCorpo) {
        adminTabelaCorpo.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--ciano);">⏳ Conectando ao MySQL e carregando dados...</td></tr>';
      }

      // Buscar usuários
      const res = await fetch('http://localhost:3000/api/usuarios');
      const data = await res.json();

      if (data.sucesso && Array.isArray(data.usuarios)) {
        usuariosCarregadosAdmin = data.usuarios;
        if (adminTotalUsuarios) adminTotalUsuarios.textContent = data.usuarios.length;
        if (adminContadorTotal) adminContadorTotal.textContent = data.usuarios.length;
        renderizarTabelaAdmin();
      } else {
        throw new Error(data.mensagem || 'Falha ao buscar usuários');
      }

      // Buscar produtos
      try {
        const resProd = await fetch('http://localhost:3000/api/produtos');
        const dataProd = await resProd.json();
        if (dataProd.sucesso && Array.isArray(dataProd.produtos)) {
          produtosCarregadosAdmin = dataProd.produtos;
        } else {
          produtosCarregadosAdmin = mockProdutosFallback;
        }
      } catch {
        produtosCarregadosAdmin = mockProdutosFallback;
      }
      renderizarTabelaProdutos();

      // Buscar pedidos
      try {
        const resPed = await fetch('http://localhost:3000/api/pedidos');
        const dataPed = await resPed.json();
        if (dataPed.sucesso && Array.isArray(dataPed.pedidos)) {
          pedidosCarregadosAdmin = dataPed.pedidos;
        } else {
          pedidosCarregadosAdmin = mockPedidosFallback;
        }
      } catch {
        pedidosCarregadosAdmin = mockPedidosFallback;
      }
      renderizarTabelaPedidos();

    } catch (err) {
      console.warn('Backend MySQL offline, usando dados locais de demonstração:', err);
      // Fallback para exibir dados locais mesmo se o servidor estiver temporariamente desligado
      const usuariosLocais = getUsuariosRegistrados();
      const mockAdminUsers = [
        { id: 1, nome: 'Administrador Conecta+', email: 'admin@conecta.com', telefone: '(11) 90000-0000', cidade: 'São Paulo', uf: 'SP', interesse: 'Gestão do Sistema', tipo: 'admin', data_cadastro: '2026-11-11' },
        { id: 2, nome: 'Estefany Aluna', email: 'aluno@conecta.com', telefone: '(11) 98765-4321', cidade: 'São Paulo', uf: 'SP', interesse: 'Cursos de informática', tipo: 'usuario', data_cadastro: '2026-11-11' },
        { id: 3, nome: 'Maria Julia Silva', email: 'maria@email.com', telefone: '(11) 91234-5678', cidade: 'São Paulo', uf: 'SP', interesse: 'Conteúdos em Libras', tipo: 'usuario', data_cadastro: '2026-11-11' }
      ];

      usuariosCarregadosAdmin = usuariosLocais.length > 0 ? usuariosLocais : mockAdminUsers;
      produtosCarregadosAdmin = mockProdutosFallback;
      pedidosCarregadosAdmin = mockPedidosFallback;

      if (adminTotalUsuarios) adminTotalUsuarios.textContent = usuariosCarregadosAdmin.length;
      if (adminContadorTotal) adminContadorTotal.textContent = usuariosCarregadosAdmin.length;

      renderizarTabelaAdmin();
      renderizarTabelaProdutos();
      renderizarTabelaPedidos();
    }
  }

  function renderizarTabelaProdutos() {
    const adminTabelaProdutosCorpo = document.getElementById('adminTabelaProdutosCorpo');
    const adminTotalProdutos = document.getElementById('adminTotalProdutos');
    const adminContadorProdutos = document.getElementById('adminContadorProdutos');

    if (adminTotalProdutos) adminTotalProdutos.textContent = produtosCarregadosAdmin.length;
    if (adminContadorProdutos) adminContadorProdutos.textContent = produtosCarregadosAdmin.length;
    if (!adminTabelaProdutosCorpo) return;

    if (produtosCarregadosAdmin.length === 0) {
      adminTabelaProdutosCorpo.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--texto-mutado);">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    adminTabelaProdutosCorpo.innerHTML = produtosCarregadosAdmin.map((p) => {
      const precoFormatado = Number(p.preco) === 0 ? '<span style="color:#2bff9b; font-weight:700;">Gratuito</span>' : `R$ ${Number(p.preco).toFixed(2).replace('.', ',')}`;
      const dataFmt = p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : '-';
      const badgeTipo = p.tipo === 'curso' ? '📚 Curso' : '📦 Produto';

      return `
        <tr>
          <td><strong>#${p.id}</strong></td>
          <td><b>${escapeHtml(p.nome)}</b></td>
          <td><span style="background: rgba(233,60,255,0.12); color: var(--magenta-claro); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">${escapeHtml(p.categoria_nome || 'Geral')}</span></td>
          <td>${precoFormatado}</td>
          <td><b>${p.estoque}</b> un</td>
          <td><span class="badge-tipo-usuario">${badgeTipo}</span></td>
          <td>${dataFmt}</td>
        </tr>
      `;
    }).join('');
  }

  function renderizarTabelaPedidos() {
    const adminTabelaPedidosCorpo = document.getElementById('adminTabelaPedidosCorpo');
    const adminTotalPedidos = document.getElementById('adminTotalPedidos');
    const adminContadorPedidos = document.getElementById('adminContadorPedidos');

    if (adminTotalPedidos) adminTotalPedidos.textContent = pedidosCarregadosAdmin.length;
    if (adminContadorPedidos) adminContadorPedidos.textContent = pedidosCarregadosAdmin.length;
    if (!adminTabelaPedidosCorpo) return;

    if (pedidosCarregadosAdmin.length === 0) {
      adminTabelaPedidosCorpo.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--texto-mutado);">Nenhum pedido realizado.</td></tr>';
      return;
    }

    adminTabelaPedidosCorpo.innerHTML = pedidosCarregadosAdmin.map((ped) => {
      const valorFmt = `R$ ${Number(ped.valor_total).toFixed(2).replace('.', ',')}`;
      const dataFmt = ped.data_pedido ? new Date(ped.data_pedido).toLocaleDateString('pt-BR') : '-';
      const statusCor = ped.status === 'Entregue' ? '#2bff9b' : (ped.status === 'Aprovado' ? 'var(--ciano)' : '#ffb84d');

      return `
        <tr>
          <td><strong>#PED-${ped.id}</strong></td>
          <td><b>${escapeHtml(ped.cliente_nome || 'Cliente')}</b></td>
          <td><code>${escapeHtml(ped.cliente_email || '-')}</code></td>
          <td>${dataFmt}</td>
          <td><span style="color: ${statusCor}; font-weight: 700;">● ${escapeHtml(ped.status)}</span></td>
          <td>${escapeHtml(ped.forma_pagamento || 'Cartão')}</td>
          <td><b>${valorFmt}</b></td>
        </tr>
      `;
    }).join('');
  }


  function escapeHtml(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderizarTabelaAdmin() {
    if (!adminTabelaCorpo) return;
    const termo = (adminBuscaUsuarios ? adminBuscaUsuarios.value : '').toLowerCase().trim();
    const filtroInteresse = adminFiltroInteresse ? adminFiltroInteresse.value : '';

    const filtrados = usuariosCarregadosAdmin.filter((u) => {
      const matchBusca = !termo ||
        (u.nome && u.nome.toLowerCase().includes(termo)) ||
        (u.email && u.email.toLowerCase().includes(termo)) ||
        (u.cpf && u.cpf.toLowerCase().includes(termo)) ||
        (u.telefone && u.telefone.toLowerCase().includes(termo)) ||
        (u.cidade && u.cidade.toLowerCase().includes(termo));

      const matchInteresse = !filtroInteresse || u.interesse === filtroInteresse;
      return matchBusca && matchInteresse;
    });

    if (adminContadorFiltrados) adminContadorFiltrados.textContent = filtrados.length;

    if (filtrados.length === 0) {
      adminTabelaCorpo.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--texto-mutado);">Nenhum usuário encontrado com os filtros atuais.</td></tr>';
      return;
    }

    adminTabelaCorpo.innerHTML = filtrados.map((u) => {
      const ehAdminUser = u.tipo === 'admin' || u.email === 'admin@conecta.com';
      const badgeTipo = ehAdminUser
        ? '<span class="badge-tipo-admin">🛡️ Admin</span>'
        : '<span class="badge-tipo-usuario">👤 Usuário</span>';

      const dataFormatada = u.data_cadastro ? new Date(u.data_cadastro).toLocaleDateString('pt-BR') : '-';
      const cidadeUf = (u.cidade && u.uf) ? `${u.cidade}/${u.uf}` : (u.cidade || u.uf || '-');

      const botaoExcluir = ehAdminUser
        ? '<span style="color: var(--texto-mutado); font-size: 0.75rem;">Protegido</span>'
        : `<button type="button" class="btn-excluir-usuario" onclick="excluirUsuarioAdmin(${u.id}, '${escapeHtml(u.nome)}')">🗑️ Excluir</button>`;

      return `
        <tr>
          <td><strong>#${u.id}</strong></td>
          <td><b>${escapeHtml(u.nome || '')}</b></td>
          <td><code>${escapeHtml(u.email || '')}</code></td>
          <td>${escapeHtml(u.telefone || '-')}</td>
          <td>${escapeHtml(cidadeUf)}</td>
          <td><span style="font-size: 0.8rem; color: var(--texto-mutado);">${escapeHtml(u.interesse || '-')}</span></td>
          <td>${badgeTipo}</td>
          <td>${dataFormatada}</td>
          <td style="text-align: right;">${botaoExcluir}</td>
        </tr>
      `;
    }).join('');
  }

  async function excluirUsuarioAdmin(id, nome) {
    if (!confirm(`Tem certeza de que deseja excluir o usuário "${nome}" (ID #${id}) do banco MySQL?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.sucesso) {
        mostrarToast(`Usuário "${nome}" excluído do MySQL!`, 'sucesso');
        await carregarDadosAdmin();
      } else {
        mostrarToast(data.mensagem || 'Erro ao excluir usuário.', 'erro');
      }
    } catch (e) {
      console.error('Erro ao excluir usuário:', e);
      mostrarToast('Erro ao comunicar com o servidor MySQL.', 'erro');
    }
  }

  window.excluirUsuarioAdmin = excluirUsuarioAdmin;

  if (adminBuscaUsuarios) {
    adminBuscaUsuarios.addEventListener('input', renderizarTabelaAdmin);
  }
  if (adminFiltroInteresse) {
    adminFiltroInteresse.addEventListener('change', renderizarTabelaAdmin);
  }

  function solicitarProduto(id, nome) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
      mostrarToast(`Para solicitar "${nome}", faça login ou cadastre-se!`, 'info');
      abrirModalLogin();
      return;
    }
    mostrarToast(`✅ Solicitação de "${nome}" realizada com sucesso para ${usuario.nome}!`, 'sucesso');
  }
  window.solicitarProduto = solicitarProduto;

  carregar();
  aplicar();
  verificarUsuarioLogado();
  grupoAtivo = 'Todos';
  listaGrupos.querySelectorAll('.grupo').forEach((b) => b.classList.toggle('ativo', b.dataset.grupo === 'Todos'));
  renderFeed();
})();