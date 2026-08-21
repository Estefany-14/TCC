/**
 * Conecta+ — JavaScript Principal
 * Inclusão Digital, Mapa Regional, Autenticação, Libras e Suporte WhatsApp (41) 99900-8019
 */

(function () {
  'use strict';

  /* =========================================================
     1. PREFERÊNCIAS, TEMA (CORES DA LOGO) & ACESSIBILIDADE
     ========================================================= */
  const body = document.body;
  const ESCALA_MIN = 0.85;
  const ESCALA_MAX = 1.5;
  const PADRAO_PREFS = { 
    escala: 1, 
    contraste: false, 
    fonte: false, 
    modoLibras: false,
    tema: 'escuro' // Padrão com as cores escuras da logo
  };
  let prefs = { ...PADRAO_PREFS };

  function carregarPreferencias() {
    try {
      const salvo = JSON.parse(localStorage.getItem('conecta-prefs') || 'null');
      if (salvo) prefs = { ...PADRAO_PREFS, ...salvo };
    } catch (e) {
      prefs = { ...PADRAO_PREFS };
    }
  }

  function aplicarPreferencias() {
    document.documentElement.style.fontSize = (prefs.escala * 100) + '%';
    
    // Tema Claro / Escuro
    if (prefs.tema === 'claro') {
      body.classList.add('modo-claro');
      body.classList.remove('modo-escuro');
    } else {
      body.classList.add('modo-escuro');
      body.classList.remove('modo-claro');
    }

    const iconeTema = document.getElementById('iconeTema');
    const textoTema = document.getElementById('textoTema');
    if (iconeTema && textoTema) {
      if (prefs.tema === 'claro') {
        iconeTema.textContent = '🌙';
        textoTema.textContent = 'Modo Escuro';
      } else {
        iconeTema.textContent = '☀️';
        textoTema.textContent = 'Modo Claro';
      }
    }

    body.classList.toggle('contraste', prefs.contraste);
    body.classList.toggle('fonte-legivel', prefs.fonte);
    body.classList.toggle('modo-libras-ativo', prefs.modoLibras);

    const btnContraste = document.getElementById('btnContraste');
    if (btnContraste) {
      btnContraste.setAttribute('aria-pressed', String(prefs.contraste));
    }

    const statusLibras = document.getElementById('statusModoLibras');
    if (statusLibras) {
      statusLibras.textContent = prefs.modoLibras ? 'ON' : 'OFF';
    }

    localStorage.setItem('conecta-prefs', JSON.stringify(prefs));
  }

  // Alternar Tema Claro / Escuro
  const btnAlternarTema = document.getElementById('btnAlternarTema');
  if (btnAlternarTema) {
    btnAlternarTema.addEventListener('click', () => {
      prefs.tema = prefs.tema === 'escuro' ? 'claro' : 'escuro';
      aplicarPreferencias();
      mostrarNotificacao(prefs.tema === 'escuro' ? '🌙 Modo Escuro Oficial ativado!' : '☀️ Modo Claro ativado!');
    });
  }

  // Eventos dos botões da barra de acessibilidade
  document.querySelectorAll('.barra-acess button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const acao = btn.dataset.acao;
      if (acao === 'aumentar') prefs.escala = Math.min(ESCALA_MAX, +(prefs.escala + 0.1).toFixed(2));
      if (acao === 'diminuir') prefs.escala = Math.max(ESCALA_MIN, +(prefs.escala - 0.1).toFixed(2));
      if (acao === 'contraste') prefs.contraste = !prefs.contraste;
      if (acao === 'fonte') prefs.fonte = !prefs.fonte;
      if (acao === 'reset') prefs = { ...PADRAO_PREFS };
      if (acao === 'falar') falarTextoPagina();
      aplicarPreferencias();
    });
  });

  // Alternar Modo Libras Topo
  const btnModoLibrasTopo = document.getElementById('btnModoLibrasTopo');
  if (btnModoLibrasTopo) {
    btnModoLibrasTopo.addEventListener('click', () => {
      prefs.modoLibras = !prefs.modoLibras;
      aplicarPreferencias();
      mostrarNotificacao(prefs.modoLibras ? '🤟 Modo Libras ativado! Destaques em sinais habilitados.' : 'Modo Libras desativado.');
    });
  }

  // Leitor de tela nativo (Web Speech API)
  function falarTextoPagina() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const telaAtiva = document.querySelector('.tela-secao.tela-ativa') || document.body;
      const texto = telaAtiva.innerText.substring(0, 500);
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      mostrarNotificacao('🔊 Lendo o conteúdo da tela...');
    } else {
      mostrarNotificacao('Leitor de voz não suportado neste navegador.');
    }
  }

  /* =========================================================
     2. NAVEGAÇÃO ENTRE TELAS (SPA)
     ========================================================= */
  const telas = {
    'inicio': document.getElementById('tela-inicio'),
    'mapa': document.getElementById('tela-mapa'),
    'cursos': document.getElementById('tela-cursos'),
    'servicos': document.getElementById('tela-servicos'),
    'empregos': document.getElementById('tela-empregos'),
    'libras': document.getElementById('tela-libras'),
    'comunidade': document.getElementById('tela-comunidade'),
    'perfil': document.getElementById('tela-perfil')
  };

  function navegarParaTela(nomeTela, opcoes = {}) {
    if (!telas[nomeTela]) nomeTela = 'inicio';

    Object.keys(telas).forEach((chave) => {
      const el = telas[chave];
      if (el) {
        if (chave === nomeTela) {
          el.style.display = 'block';
          el.classList.add('tela-ativa');
        } else {
          el.style.display = 'none';
          el.classList.remove('tela-ativa');
        }
      }
    });

    // Links de navegação
    document.querySelectorAll('#navPrincipal .nav-item').forEach((item) => {
      const telaItem = item.dataset.tela;
      item.classList.toggle('ativo', telaItem === nomeTela);
    });

    document.querySelectorAll('.barra-mobile-app .btn-app-tab').forEach((tab) => {
      const telaTab = tab.dataset.tela;
      tab.classList.toggle('ativo', telaTab === nomeTela);
    });

    const navPrincipal = document.getElementById('navPrincipal');
    const menuBtn = document.getElementById('menuBtn');
    if (navPrincipal && navPrincipal.classList.contains('aberto')) {
      navPrincipal.classList.remove('aberto');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    if (nomeTela === 'mapa') {
      setTimeout(() => {
        inicializarMapa();
        if (mapaInstancia) {
          mapaInstancia.invalidateSize();
        }
      }, 150);
    }

    if (!opcoes.semScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (!opcoes.ignorarHash) {
      window.history.pushState({ tela: nomeTela }, '', '#' + nomeTela);
    }
  }

  // Eventos de clique
  document.addEventListener('click', (e) => {
    const elNavegar = e.target.closest('[data-navegar]');
    if (elNavegar) {
      e.preventDefault();
      const destino = elNavegar.dataset.navegar;
      navegarParaTela(destino);
      return;
    }

    const elTab = e.target.closest('.btn-app-tab');
    if (elTab) {
      e.preventDefault();
      const destino = elTab.dataset.tela;
      navegarParaTela(destino);
      return;
    }

    const navLink = e.target.closest('#navPrincipal .nav-item');
    if (navLink) {
      e.preventDefault();
      const destino = navLink.dataset.tela || navLink.getAttribute('href').replace('#', '');
      navegarParaTela(destino);
      return;
    }
  });

  const menuBtn = document.getElementById('menuBtn');
  const navPrincipal = document.getElementById('navPrincipal');
  if (menuBtn && navPrincipal) {
    menuBtn.addEventListener('click', () => {
      const aberto = navPrincipal.classList.toggle('aberto');
      menuBtn.setAttribute('aria-expanded', String(aberto));
    });
  }

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tela) {
      navegarParaTela(e.state.tela, { ignorarHash: true });
    } else {
      const hash = window.location.hash.replace('#', '') || 'inicio';
      navegarParaTela(hash, { ignorarHash: true });
    }
  });

  /* =========================================================
     3. TELA DE BOAS-VINDAS (SPLASH SCREEN)
     ========================================================= */
  const telaBoasVindas = document.getElementById('telaBoasVindas');
  const btnSplashLogin = document.getElementById('btnSplashLogin');
  const btnSplashCadastro = document.getElementById('btnSplashCadastro');
  const btnSplashExplorar = document.getElementById('btnSplashExplorar');
  const btnSplashLibras = document.getElementById('btnSplashLibras');

  function fecharBoasVindas() {
    if (telaBoasVindas) {
      telaBoasVindas.classList.add('oculto');
      document.body.style.overflow = '';
    }
  }

  function abrirBoasVindas() {
    if (telaBoasVindas) {
      telaBoasVindas.classList.remove('oculto');
      document.body.style.overflow = 'hidden';
    }
  }

  if (btnSplashExplorar) {
    btnSplashExplorar.addEventListener('click', () => {
      fecharBoasVindas();
      sessionStorage.setItem('conecta-boas-vindas-vista', 'true');
    });
  }

  if (btnSplashLibras) {
    btnSplashLibras.addEventListener('click', () => {
      fecharBoasVindas();
      navegarParaTela('libras');
      sessionStorage.setItem('conecta-boas-vindas-vista', 'true');
    });
  }

  if (btnSplashLogin) {
    btnSplashLogin.addEventListener('click', () => {
      fecharBoasVindas();
      abrirModalLogin();
    });
  }

  if (btnSplashCadastro) {
    btnSplashCadastro.addEventListener('click', () => {
      fecharBoasVindas();
      abrirModalCadastro();
    });
  }

  const boasVindasVista = sessionStorage.getItem('conecta-boas-vindas-vista');
  if (boasVindasVista) {
    fecharBoasVindas();
  } else {
    document.body.style.overflow = 'hidden';
  }

  /* =========================================================
     4. MAPA REGIONAL (LEAFLET + GEOLOCALIZAÇÃO)
     ========================================================= */
  let mapaInstancia = null;
  let marcadoresCursos = [];
  let marcadoresPessoas = [];
  let marcadorUsuario = null;
  let filtroMapaAtual = 'todos';

  const COORD_PADRAO = [-25.4284, -49.2733];

  const POLOS_CURSOS_DADOS = [
    {
      id: 1,
      nome: 'Polo Centro - Espaço Conecta Digital',
      endereco: 'Rua XV de Novembro, 800 - Centro, Curitiba',
      lat: -25.4296,
      lng: -49.2715,
      cursos: 'Informática Básica, Celular para Idosos e Libras',
      vagas: '15 vagas abertas'
    },
    {
      id: 2,
      nome: 'Polo Portão - Centro de Inclusão Comunitária',
      endereco: 'Av. República Argentina, 2500 - Portão, Curitiba',
      lat: -25.4745,
      lng: -49.2940,
      cursos: 'Digitação, Internet Segura e Serviços Gov.br',
      vagas: '8 vagas abertas'
    },
    {
      id: 3,
      nome: 'Polo Boqueirão - Núcleo de Capacitação',
      endereco: 'Rua Marechal Floriano Peixoto, 7500 - Boqueirão',
      lat: -25.5032,
      lng: -49.2395,
      cursos: 'Primeiro Emprego, E-mail e Pacote Office',
      vagas: '12 vagas abertas'
    },
    {
      id: 4,
      nome: 'Polo Santa Felicidade - Ponto Conecta Fácil',
      endereco: 'Via Vêneto, 1200 - Santa Felicidade',
      lat: -25.4050,
      lng: -49.3320,
      cursos: 'Uso de Smartphone e Segurança Digital',
      vagas: '10 vagas abertas'
    }
  ];

  const PESSOAS_CONECTADAS_DADOS = [
    {
      id: 1,
      nome: 'Maria da Silva',
      bairro: 'Centro, Curitiba',
      lat: -25.4330,
      lng: -49.2680,
      status: 'Estudando Informática Básica',
      tempo: 'Online agora'
    },
    {
      id: 2,
      nome: 'Rafael Souza',
      bairro: 'Portão, Curitiba',
      lat: -25.4690,
      lng: -49.2890,
      status: 'Fazendo curso de Celular',
      tempo: 'Online há 10 min'
    },
    {
      id: 3,
      nome: 'Ana Lima (Intérprete de Libras)',
      bairro: 'Batel, Curitiba',
      lat: -25.4420,
      lng: -49.2860,
      status: '🤟 Disponível para tirar dúvidas em Libras',
      tempo: 'Online agora'
    },
    {
      id: 4,
      nome: 'Carlos Pereira',
      bairro: 'Boqueirão, Curitiba',
      lat: -25.4980,
      lng: -49.2450,
      status: 'Acessando Carteira de Trabalho Digital',
      tempo: 'Online há 20 min'
    }
  ];

  function inicializarMapa() {
    if (mapaInstancia) return;
    const mapaContainer = document.getElementById('mapaConecta');
    if (!mapaContainer || typeof L === 'undefined') return;

    mapaInstancia = L.map('mapaConecta', {
      center: COORD_PADRAO,
      zoom: 12,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapaInstancia);

    renderizarMarcadoresMapa();
    renderizarListasLocais();
  }

  function renderizarMarcadoresMapa() {
    if (!mapaInstancia) return;

    marcadoresCursos.forEach(m => mapaInstancia.removeLayer(m));
    marcadoresPessoas.forEach(m => mapaInstancia.removeLayer(m));
    marcadoresCursos = [];
    marcadoresPessoas = [];

    // Ícone Polo (Azul da Logo)
    const iconePolo = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background: linear-gradient(135deg, #1e6bff, #22e0ff); width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; border: 3px solid #fff; box-shadow: 0 4px 15px rgba(30,107,255,0.5); font-size: 18px;">🏫</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    // Ícone Pessoa (Magenta da Logo)
    const iconePessoa = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background: linear-gradient(135deg, #e93cff, #7b3cff); width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; border: 3px solid #fff; box-shadow: 0 4px 15px rgba(233,60,255,0.5); font-size: 16px;">👤</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Polos
    if (filtroMapaAtual === 'todos' || filtroMapaAtual === 'cursos') {
      POLOS_CURSOS_DADOS.forEach((polo) => {
        const marker = L.marker([polo.lat, polo.lng], { icon: iconePolo }).addTo(mapaInstancia);
        marker.bindPopup(`
          <div style="font-family: var(--fonte-corpo); padding: 4px;">
            <strong style="color: #0056e0; font-size: 14px; display: block; margin-bottom: 4px;">🏫 ${polo.nome}</strong>
            <p style="margin: 0 0 6px; font-size: 12px; color: #4b5e80;">📍 ${polo.endereco}</p>
            <p style="margin: 0 0 6px; font-size: 12px;"><strong>Cursos:</strong> ${polo.cursos}</p>
            <span style="display: inline-block; background: #ebfbf2; color: #059669; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; margin-bottom: 8px;">${polo.vagas}</span><br>
            <a href="https://wa.me/5541999008019?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20${encodeURIComponent(polo.nome)}" target="_blank" style="display: inline-block; background: #25d366; color: #fff; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none;">💬 Tirar Dúvidas no WhatsApp</a>
          </div>
        `);
        marcadoresCursos.push(marker);
      });
    }

    // Pessoas
    if (filtroMapaAtual === 'todos' || filtroMapaAtual === 'pessoas') {
      PESSOAS_CONECTADAS_DADOS.forEach((pessoa) => {
        const marker = L.marker([pessoa.lat, pessoa.lng], { icon: iconePessoa }).addTo(mapaInstancia);
        marker.bindPopup(`
          <div style="font-family: var(--fonte-corpo); padding: 4px;">
            <strong style="color: #e93cff; font-size: 14px; display: block; margin-bottom: 4px;">👤 ${pessoa.nome}</strong>
            <p style="margin: 0 0 4px; font-size: 12px; color: #4b5e80;">📍 ${pessoa.bairro}</p>
            <p style="margin: 0 0 8px; font-size: 12px;"><strong>Atividade:</strong> ${pessoa.status}</p>
            <button type="button" onclick="window.navegarParaComunidade()" style="background: #1e6bff; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">💬 Conectar na Comunidade</button>
          </div>
        `);
        marcadoresPessoas.push(marker);
      });
    }
  }

  function renderizarListasLocais() {
    const listaPolos = document.getElementById('listaPolosCursos');
    const listaPessoas = document.getElementById('listaPessoasRegiao');

    if (listaPolos) {
      listaPolos.innerHTML = POLOS_CURSOS_DADOS.map(p => `
        <div class="local-item-card">
          <div>
            <h4>${p.nome}</h4>
            <p>📍 ${p.endereco}</p>
            <p style="color: var(--ciano); font-weight: 700; margin-top: 4px;">📚 ${p.cursos}</p>
          </div>
          <button type="button" class="btn btn-secundario btn-sm" onclick="window.focarPoloNoMapa(${p.lat}, ${p.lng})">
            Ver no Mapa
          </button>
        </div>
      `).join('');
    }

    if (listaPessoas) {
      listaPessoas.innerHTML = PESSOAS_CONECTADAS_DADOS.map(p => `
        <div class="local-item-card">
          <div>
            <h4>${p.nome}</h4>
            <p>📍 ${p.bairro}</p>
            <p style="color: var(--magenta); font-weight: 700; margin-top: 4px;">${p.status}</p>
          </div>
          <button type="button" class="btn btn-secundario btn-sm" onclick="window.focarPoloNoMapa(${p.lat}, ${p.lng})">
            Localizar
          </button>
        </div>
      `).join('');
    }
  }

  window.focarPoloNoMapa = function(lat, lng) {
    if (mapaInstancia) {
      mapaInstancia.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
      window.scrollTo({ top: document.getElementById('mapaConecta').offsetTop - 120, behavior: 'smooth' });
    }
  };

  window.navegarParaComunidade = function() {
    navegarParaTela('comunidade');
  };

  document.querySelectorAll('.filtro-mapa-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-mapa-btn').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      filtroMapaAtual = btn.dataset.filtroMapa;
      renderizarMarcadoresMapa();
    });
  });

  const btnGeolocalizacao = document.getElementById('btnGeolocalizacao');
  const statusLocalizacao = document.getElementById('statusLocalizacao');

  if (btnGeolocalizacao) {
    btnGeolocalizacao.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        if (statusLocalizacao) statusLocalizacao.textContent = 'Buscando sua localização pelo GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (mapaInstancia) {
              mapaInstancia.flyTo([lat, lng], 14, { animate: true });

              if (marcadorUsuario) mapaInstancia.removeLayer(marcadorUsuario);

              const iconeUsuario = L.divIcon({
                className: 'custom-map-icon',
                html: `<div style="background: #10b981; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; border: 3px solid #fff; box-shadow: 0 0 20px #10b981; font-size: 20px;">📍</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              });

              marcadorUsuario = L.marker([lat, lng], { icon: iconeUsuario }).addTo(mapaInstancia);
              marcadorUsuario.bindPopup('<strong>Você está aqui!</strong><br>Buscando oportunidades ao seu redor.').openPopup();

              if (statusLocalizacao) statusLocalizacao.textContent = `📍 Localização detectada! Mostrando cursos e conexões perto de você.`;
              mostrarNotificacao('📍 Sua localização foi encontrada com sucesso!');
            }
          },
          (err) => {
            if (statusLocalizacao) statusLocalizacao.textContent = 'Não foi possível obter a localização GPS. Exibindo região de Curitiba (DDD 41).';
            mostrarNotificacao('Localização padrão de Curitiba / PR mantida.');
          }
        );
      }
    });
  }

  /* =========================================================
     5. SUPORTE WHATSAPP (41 99900-8019)
     ========================================================= */
  const fecharTooltipWhatsapp = document.getElementById('fecharTooltipWhatsapp');
  const whatsappTooltip = document.getElementById('whatsappTooltip');

  if (fecharTooltipWhatsapp && whatsappTooltip) {
    fecharTooltipWhatsapp.addEventListener('click', () => {
      whatsappTooltip.style.display = 'none';
    });
  }

  /* =========================================================
     6. AUTENTICAÇÃO, LOGIN, CADASTRO E PERFIL
     ========================================================= */
  const USUARIOS_DEMO = [
    {
      id: 1,
      nome: 'Maria da Silva',
      email: 'maria@conecta.com',
      senha: '123',
      cpf: '123.456.789-00',
      telefone: '(41) 99900-8019',
      endereco: 'Rua XV de Novembro, 800',
      cidade: 'Curitiba',
      uf: 'PR',
      interesse: 'Cursos de informática',
      dataCadastro: new Date().toISOString()
    }
  ];

  function getUsuariosRegistrados() {
    try {
      const salvos = JSON.parse(localStorage.getItem('conecta-usuarios') || 'null');
      if (salvos && Array.isArray(salvos) && salvos.length > 0) return salvos;
      localStorage.setItem('conecta-usuarios', JSON.stringify(USUARIOS_DEMO));
      return USUARIOS_DEMO;
    } catch (e) {
      return USUARIOS_DEMO;
    }
  }

  function getUsuarioLogado() {
    try {
      return JSON.parse(localStorage.getItem('conecta-usuario-logado') || 'null');
    } catch (e) {
      return null;
    }
  }

  function setUsuarioLogado(usuario) {
    if (usuario) {
      localStorage.setItem('conecta-usuario-logado', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('conecta-usuario-logado');
    }
    atualizarEstadoAuth();
  }

  function atualizarEstadoAuth() {
    const usuario = getUsuarioLogado();
    const btnAbrirLogin = document.getElementById('btnAbrirLogin');
    const btnCadastro = document.getElementById('btnCadastro');
    const linkPerfil = document.getElementById('linkPerfil');
    const navNomeUsuario = document.getElementById('navNomeUsuario');
    const navAvatarMini = document.getElementById('navAvatarMini');

    if (usuario) {
      if (btnAbrirLogin) btnAbrirLogin.style.display = 'none';
      if (btnCadastro) btnCadastro.style.display = 'none';
      if (linkPerfil) {
        linkPerfil.style.display = 'inline-flex';
        if (navNomeUsuario) navNomeUsuario.textContent = usuario.nome.split(' ')[0];
        if (navAvatarMini) navAvatarMini.textContent = extrairIniciais(usuario.nome);
      }
      renderizarPerfil(usuario);
    } else {
      if (btnAbrirLogin) btnAbrirLogin.style.display = 'inline-flex';
      if (btnCadastro) btnCadastro.style.display = 'inline-flex';
      if (linkPerfil) linkPerfil.style.display = 'none';
    }
  }

  function extrairIniciais(nome) {
    if (!nome) return 'US';
    return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  // --- MODAL LOGIN ---
  const modalLogin = document.getElementById('modalLogin');
  const btnAbrirLogin = document.getElementById('btnAbrirLogin');
  const fecharModalLogin = document.getElementById('fecharModalLogin');
  const formLogin = document.getElementById('formLogin');
  const msgLogin = document.getElementById('msgLogin');
  const btnIrParaCadastro = document.getElementById('btnIrParaCadastro');
  const btnMostrarSenhaLogin = document.getElementById('btnMostrarSenhaLogin');
  const loginSenha = document.getElementById('loginSenha');

  function abrirModalLogin() {
    if (modalLogin) {
      modalLogin.classList.add('aberto');
      modalLogin.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('loginEmail');
      if (input) input.focus();
    }
  }

  function fecharModalLoginFn() {
    if (modalLogin) {
      modalLogin.classList.remove('aberto');
      modalLogin.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (msgLogin) msgLogin.textContent = '';
    }
  }

  if (btnAbrirLogin) btnAbrirLogin.addEventListener('click', abrirModalLogin);
  if (fecharModalLogin) fecharModalLogin.addEventListener('click', fecharModalLoginFn);
  if (modalLogin) {
    modalLogin.addEventListener('click', (e) => {
      if (e.target === modalLogin) fecharModalLoginFn();
    });
  }

  if (btnMostrarSenhaLogin && loginSenha) {
    btnMostrarSenhaLogin.addEventListener('click', () => {
      const tipo = loginSenha.type === 'password' ? 'text' : 'password';
      loginSenha.type = tipo;
      btnMostrarSenhaLogin.textContent = tipo === 'password' ? '👁️' : '🙈';
    });
  }

  if (btnIrParaCadastro) {
    btnIrParaCadastro.addEventListener('click', () => {
      fecharModalLoginFn();
      abrirModalCadastro();
    });
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = formLogin.loginEmail.value.trim();
      const senha = formLogin.loginSenha.value.trim();

      if (!login || !senha) {
        msgLogin.textContent = 'Por favor, preencha o e-mail/CPF e sua senha.';
        msgLogin.style.color = '#e11d48';
        return;
      }

      const usuarios = getUsuariosRegistrados();
      const usuarioEncontrado = usuarios.find(
        (u) => (u.email.toLowerCase() === login.toLowerCase() || (u.cpf && u.cpf === login)) &&
               (u.senha ? u.senha === senha : true)
      );

      if (usuarioEncontrado) {
        msgLogin.textContent = 'Login efetuado com sucesso! Bem-vindo(a), ' + usuarioEncontrado.nome;
        msgLogin.style.color = '#059669';
        setTimeout(() => {
          setUsuarioLogado(usuarioEncontrado);
          fecharModalLoginFn();
          formLogin.reset();
          navegarParaTela('perfil');
        }, 900);
      } else {
        msgLogin.textContent = 'Dados não encontrados ou senha incorreta. Tente novamente.';
        msgLogin.style.color = '#e11d48';
      }
    });
  }

  // --- MODAL CADASTRO ---
  const modalCadastro = document.getElementById('modalCadastro');
  const btnCadastro = document.getElementById('btnCadastro');
  const fecharModalCadastro = document.getElementById('fecharModalCadastro');
  const formCadastro = document.getElementById('formCadastro');
  const msgCadastro = document.getElementById('msgCadastro');
  const btnIrParaLogin = document.getElementById('btnIrParaLogin');
  const btnMostrarSenhaCad = document.getElementById('btnMostrarSenhaCad');
  const cadSenha = document.getElementById('cadSenha');

  function abrirModalCadastro() {
    if (modalCadastro) {
      modalCadastro.classList.add('aberto');
      modalCadastro.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('cadNome');
      if (input) input.focus();
    }
  }

  function fecharModalCadastroFn() {
    if (modalCadastro) {
      modalCadastro.classList.remove('aberto');
      modalCadastro.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (msgCadastro) msgCadastro.textContent = '';
    }
  }

  if (btnCadastro) btnCadastro.addEventListener('click', abrirModalCadastro);
  if (fecharModalCadastro) fecharModalCadastro.addEventListener('click', fecharModalCadastroFn);
  if (modalCadastro) {
    modalCadastro.addEventListener('click', (e) => {
      if (e.target === modalCadastro) fecharModalCadastroFn();
    });
  }

  if (btnMostrarSenhaCad && cadSenha) {
    btnMostrarSenhaCad.addEventListener('click', () => {
      const tipo = cadSenha.type === 'password' ? 'text' : 'password';
      cadSenha.type = tipo;
      btnMostrarSenhaCad.textContent = tipo === 'password' ? '👁️' : '🙈';
    });
  }

  if (btnIrParaLogin) {
    btnIrParaLogin.addEventListener('click', () => {
      fecharModalCadastroFn();
      abrirModalLogin();
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = formCadastro.cadNome.value.trim();
      const email = formCadastro.cadEmail.value.trim();
      const senha = formCadastro.cadSenha.value.trim();
      const cpf = formCadastro.cadCPF.value.trim();
      const telefone = formCadastro.cadTelefone.value.trim();
      const cidade = formCadastro.cadCidade.value.trim();
      const uf = formCadastro.cadUF.value;
      const interesse = formCadastro.cadInteresse.value;
      const aceiteTermos = document.getElementById('aceiteTermos').checked;

      if (!nome || !email || !senha) {
        msgCadastro.textContent = 'Preencha os campos obrigatórios (*).';
        msgCadastro.style.color = '#e11d48';
        return;
      }

      if (!aceiteTermos) {
        msgCadastro.textContent = 'Aceite os termos para prosseguir.';
        msgCadastro.style.color = '#e11d48';
        return;
      }

      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha,
        cpf,
        telefone: telefone || '(41) 99900-8019',
        cidade: cidade || 'Curitiba',
        uf: uf || 'PR',
        interesse,
        dataCadastro: new Date().toISOString()
      };

      const usuarios = getUsuariosRegistrados();
      usuarios.push(novoUsuario);
      localStorage.setItem('conecta-usuarios', JSON.stringify(usuarios));

      msgCadastro.textContent = 'Cadastro realizado com sucesso! Conectando...';
      msgCadastro.style.color = '#059669';

      setTimeout(() => {
        setUsuarioLogado(novoUsuario);
        fecharModalCadastroFn();
        formCadastro.reset();
        navegarParaTela('perfil');
      }, 1000);
    });
  }

  // --- PERFIL ---
  function renderizarPerfil(usuario) {
    if (!usuario) return;
    const elIniciais = document.getElementById('perfilIniciais');
    const elNome = document.getElementById('perfilNome');
    const elEmail = document.getElementById('perfilEmail');
    const elData = document.getElementById('perfilData');
    const elCPF = document.getElementById('perfilCPF');
    const elTelefone = document.getElementById('perfilTelefone');
    const elEndereco = document.getElementById('perfilEndereco');
    const elCidadeUF = document.getElementById('perfilCidadeUF');
    const elInteresse = document.getElementById('perfilInteresse');

    if (elIniciais) elIniciais.textContent = extrairIniciais(usuario.nome);
    if (elNome) elNome.textContent = usuario.nome;
    if (elEmail) elEmail.textContent = usuario.email;
    if (elData) {
      const data = new Date(usuario.dataCadastro || Date.now());
      elData.textContent = data.toLocaleDateString('pt-BR');
    }
    if (elCPF) elCPF.textContent = usuario.cpf || 'Não informado';
    if (elTelefone) elTelefone.textContent = usuario.telefone || '(41) 99900-8019';
    if (elEndereco) elEndereco.textContent = usuario.endereco || 'Não informado';
    if (elCidadeUF) elCidadeUF.textContent = (usuario.cidade && usuario.uf) ? `${usuario.cidade} / ${usuario.uf}` : 'Curitiba / PR';
    if (elInteresse) elInteresse.textContent = usuario.interesse || 'Informática geral';
  }

  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      setUsuarioLogado(null);
      navegarParaTela('inicio');
      mostrarNotificacao('Você saiu da sua conta.');
    });
  }

  /* =========================================================
     7. LIBRAS (VÍDEOS, DICIONÁRIO & DATILOLOGIA)
     ========================================================= */
  const abaLibrasVideos = document.getElementById('abaLibrasVideos');
  const abaLibrasDicionario = document.getElementById('abaLibrasDicionario');
  const abaLibrasAlfabeto = document.getElementById('abaLibrasAlfabeto');
  const painelVideos = document.getElementById('painelVideosLibras');
  const painelDicionario = document.getElementById('painelDicionarioLibras');
  const painelAlfabeto = document.getElementById('painelAlfabetoLibras');

  function trocarAbaLibras(aba) {
    [abaLibrasVideos, abaLibrasDicionario, abaLibrasAlfabeto].forEach((btn) => {
      if (btn) btn.classList.remove('ativo');
    });
    [painelVideos, painelDicionario, painelAlfabeto].forEach((painel) => {
      if (painel) painel.style.display = 'none';
    });

    if (aba === 'videos' && abaLibrasVideos && painelVideos) {
      abaLibrasVideos.classList.add('ativo');
      painelVideos.style.display = 'block';
    } else if (aba === 'dicionario' && abaLibrasDicionario && painelDicionario) {
      abaLibrasDicionario.classList.add('ativo');
      painelDicionario.style.display = 'block';
    } else if (aba === 'alfabeto' && abaLibrasAlfabeto && painelAlfabeto) {
      abaLibrasAlfabeto.classList.add('ativo');
      painelAlfabeto.style.display = 'block';
    }
  }

  if (abaLibrasVideos) abaLibrasVideos.addEventListener('click', () => trocarAbaLibras('videos'));
  if (abaLibrasDicionario) abaLibrasDicionario.addEventListener('click', () => trocarAbaLibras('dicionario'));
  if (abaLibrasAlfabeto) abaLibrasAlfabeto.addEventListener('click', () => trocarAbaLibras('alfabeto'));

  // Player de Vídeo Tópicos
  const TOPICOS_LIBRAS = {
    'apresentacao': {
      legenda: '"Olá! Seja bem-vindo ao Conecta+. Vamos aprender juntos a usar a tecnologia e navegar sem dificuldades!"'
    },
    'computador': {
      legenda: '"Aprenda os sinais e conceitos de: Ligar o computador, usar o Mouse, Teclado e abrir Pastas."'
    },
    'internet': {
      legenda: '"Navegadores, pesquisas no Google e como acessar sites confiáveis na internet."'
    },
    'servicos': {
      legenda: '"Passo a passo em Libras para emitir seu CPF, acessar a Carteira de Trabalho e o portal Gov.br."'
    },
    'vagas': {
      legenda: '"Dicas em Libras para montar seu currículo e se candidatar a vagas inclusivas para surdos (PCD)."'
    }
  };

  const listaTopicos = document.getElementById('listaTopicosLibras');
  const textoLegendaLibras = document.getElementById('textoLegendaLibras');

  if (listaTopicos) {
    listaTopicos.addEventListener('click', (e) => {
      const btn = e.target.closest('.topico-libras-item');
      if (!btn) return;
      listaTopicos.querySelectorAll('.topico-libras-item').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      const topico = btn.dataset.topico;
      if (TOPICOS_LIBRAS[topico] && textoLegendaLibras) {
        textoLegendaLibras.textContent = TOPICOS_LIBRAS[topico].legenda;
      }
    });
  }

  // Dicionário de Sinais
  const SINAIS_DICIONARIO = [
    { termo: 'Internet', icone: '🌐', categoria: 'Tecnologia', desc: 'Mãos com dedos médios tocando-se e girando em movimento ondulatório.' },
    { termo: 'Computador', icone: '💻', categoria: 'Equipamento', desc: 'Mãos simulando a digitação no teclado e o formato retangular da tela.' },
    { termo: 'WhatsApp', icone: '📱', categoria: 'Comunicação', desc: 'Mão formando a letra W movendo-se para frente ou simulando envio de mensagem.' },
    { termo: 'Senha', icone: '🔐', categoria: 'Segurança', desc: 'Dedos indicador e polegar juntos perto dos lábios ou mão em chave girando.' },
    { termo: 'E-mail', icone: '✉️', categoria: 'Comunicação', desc: 'Mão formando uma carta entrando dentro de um envelope aberto.' },
    { termo: 'Ajuda', icone: '🤝', categoria: 'Apoio', desc: 'Mão espalmada por baixo sustentando a outra mão em punho fechado.' },
    { termo: 'Libras', icone: '🤟', categoria: 'Comunicação', desc: 'Mãos abertas se alternando com movimentos circulares e expressão acolhedora.' },
    { termo: 'Conectar', icone: '🔗', categoria: 'Rede', desc: 'Dedos indicadores e polegares se entrelaçando em elos de corrente.' },
    { termo: 'Trabalho', icone: '💼', categoria: 'Carreira', desc: 'Mãos em configuração em L batendo suavemente sobre o dorso da outra mão.' }
  ];

  function renderizarDicionario(sinais) {
    const grade = document.getElementById('gradeDicionarioSinais');
    if (!grade) return;
    grade.innerHTML = sinais.map(s => `
      <article class="card sinal-card" style="text-align: center;">
        <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">${s.icone}</div>
        <span style="color: var(--ciano); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">${s.categoria}</span>
        <h4 style="margin: 0.3rem 0; font-size: 1.15rem;">${s.termo}</h4>
        <p style="font-size: 0.88rem; color: var(--texto-suave); margin: 0;">${s.desc}</p>
      </article>
    `).join('');
  }

  renderizarDicionario(SINAIS_DICIONARIO);

  const buscaSinalInput = document.getElementById('buscaSinalInput');
  if (buscaSinalInput) {
    buscaSinalInput.addEventListener('input', (e) => {
      const termo = e.target.value.toLowerCase().trim();
      const filtrados = SINAIS_DICIONARIO.filter(
        (s) => s.termo.toLowerCase().includes(termo) || s.desc.toLowerCase().includes(termo)
      );
      renderizarDicionario(filtrados);
    });
  }

  // Datilologia
  const ALFABETO_LIBRAS = {
    'A': '✊', 'B': '🖐️', 'C': '🤏', 'D': '☝️', 'E': '✊', 'F': '👌', 'G': '👆',
    'H': '✌️', 'I': '🤙', 'J': '🤙', 'K': '✌️', 'L': '👆', 'M': '🖖', 'N': '✌️',
    'O': '👌', 'P': '✌️', 'Q': '👇', 'R': '🤞', 'S': '👊', 'T': '👌', 'U': '✌️',
    'V': '✌️', 'W': '🤟', 'X': '☝️', 'Y': '🤙', 'Z': '☝️'
  };

  const inputDatilologia = document.getElementById('inputDatilologia');
  const resultadoDatilologia = document.getElementById('resultadoDatilologia');
  const gridLetrasBotoes = document.getElementById('gridLetrasBotoes');

  function converterParaDatilologia(texto) {
    if (!resultadoDatilologia) return;
    resultadoDatilologia.innerHTML = '';
    const letras = texto.toUpperCase().replace(/[^A-Z]/g, '').split('');

    if (!letras.length) {
      resultadoDatilologia.innerHTML = '<p class="nota">Digite uma palavra acima para ver os sinais em Libras.</p>';
      return;
    }

    letras.forEach((letra) => {
      const card = document.createElement('div');
      card.className = 'letra-card';
      const sinal = ALFABETO_LIBRAS[letra] || '🖐️';
      card.innerHTML = `
        <span class="letra-sinal-mao" aria-hidden="true">${sinal}</span>
        <span class="letra-char">${letra}</span>
      `;
      resultadoDatilologia.appendChild(card);
    });
  }

  if (inputDatilologia) {
    converterParaDatilologia(inputDatilologia.value);
    inputDatilologia.addEventListener('input', (e) => converterParaDatilologia(e.target.value));
  }

  if (gridLetrasBotoes) {
    Object.keys(ALFABETO_LIBRAS).forEach((letra) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-letra-alfabeto';
      btn.textContent = letra;
      btn.addEventListener('click', () => {
        if (inputDatilologia) {
          inputDatilologia.value = letra;
          converterParaDatilologia(letra);
        }
      });
      gridLetrasBotoes.appendChild(btn);
    });
  }

  /* =========================================================
     8. COMUNIDADE E FEED
     ========================================================= */
  const feedEl = document.getElementById('feed');
  const formPost = document.getElementById('formPost');
  const msgPost = document.getElementById('msgPost');
  const listaGrupos = document.getElementById('listaGrupos');
  let grupoAtivo = 'Todos';

  const POSTS_INICIAIS = [
    {
      id: 1, autor: 'Maria Julia', grupo: 'Informática', minutos: 15, libras: false,
      texto: 'Consegui criar meu primeiro e-mail e enviar um documento sozinha! Quem estiver começando agora, não desista: a plataforma é bem explicativa.',
      curtidas: 18, curtido: false,
      comentarios: []
    },
    {
      id: 2, autor: 'Ana Lima (Intérprete)', grupo: 'Libras', minutos: 42, libras: true,
      texto: 'Gravei um vídeo em Libras explicando como acessar a Carteira de Trabalho Digital. Quem tiver dúvidas pode me chamar no WhatsApp (41) 99900-8019!',
      curtidas: 35, curtido: false,
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

  function renderFeed() {
    if (!feedEl) return;
    const visiveis = posts.filter((p) => grupoAtivo === 'Todos' || p.grupo === grupoAtivo);
    feedEl.innerHTML = '';

    if (!visiveis.length) {
      feedEl.innerHTML = '<p class="nota">Ainda não há mensagens neste grupo. Seja a primeira pessoa a compartilhar algo!</p>';
      return;
    }

    visiveis.forEach((post) => {
      const artigo = document.createElement('article');
      artigo.className = 'post';
      artigo.innerHTML = `
        <div class="post-topo">
          <span class="avatar" aria-hidden="true">${extrairIniciais(post.autor)}</span>
          <span>
            <span class="post-nome">${post.autor}</span><br>
            <span class="post-meta">${post.minutos} min atrás</span>
          </span>
          <span class="etiqueta">${post.grupo}</span>
        </div>
        <p class="post-texto">${post.texto}</p>
        ${post.libras ? '<div class="post-libras"><span aria-hidden="true">🤟</span> Publicação com interpretação em Libras</div>' : ''}
        <div class="post-barra">
          <button type="button" class="acao ${post.curtido ? 'curtido' : ''}">♥ Curtir (${post.curtidas})</button>
          <a href="https://wa.me/5541999008019?text=Ol%C3%A1!%20Vi%20sua%20publica%C3%A7%C3%A3o%20no%20Conecta%2B." target="_blank" class="acao" style="text-decoration: none; color: #25d366;">💬 Conversar no WhatsApp</a>
        </div>
      `;
      feedEl.appendChild(artigo);
    });
  }

  if (listaGrupos) {
    listaGrupos.addEventListener('click', (e) => {
      const btn = e.target.closest('.grupo');
      if (!btn) return;
      listaGrupos.querySelectorAll('.grupo').forEach((b) => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      grupoAtivo = btn.dataset.grupo;
      renderFeed();
    });
  }

  if (formPost) {
    formPost.addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = document.getElementById('textoPost').value.trim();
      if (!texto) return;

      const usuario = getUsuarioLogado();
      const nomeAutor = usuario ? usuario.nome : 'Você';

      posts.unshift({
        id: Date.now(),
        autor: nomeAutor,
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
      msgPost.textContent = 'Mensagem publicada com sucesso!';
      msgPost.style.color = '#059669';
      setTimeout(() => { msgPost.textContent = ''; }, 3000);
      renderFeed();
    });
  }

  /* =========================================================
     9. TOAST NOTIFICAÇÃO
     ========================================================= */
  function mostrarNotificacao(texto) {
    let toast = document.getElementById('toastNotificacao');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotificacao';
      toast.style.position = 'fixed';
      toast.style.bottom = '85px';
      toast.style.right = '20px';
      toast.style.zIndex = '9999';
      toast.style.background = '#0e1938';
      toast.style.border = '1px solid #22e0ff';
      toast.style.borderRadius = '12px';
      toast.style.padding = '0.85rem 1.4rem';
      toast.style.color = '#fff';
      toast.style.fontWeight = '700';
      toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }
    toast.textContent = texto;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3500);
  }

  /* =========================================================
     10. INICIALIZAÇÃO GERAL
     ========================================================= */
  carregarPreferencias();
  aplicarPreferencias();
  atualizarEstadoAuth();
  renderFeed();

  const hashInicial = window.location.hash.replace('#', '');
  if (hashInicial && hashInicial !== 'inicio') {
    navegarParaTela(hashInicial);
    fecharBoasVindas();
  }
})();