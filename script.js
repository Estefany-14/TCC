(function () {
  const body = document.body;
  const ESCALA_MIN = 0.85;
  const ESCALA_MAX = 1.6;
  const PADRAO = { escala: 1, contraste: false, fonte: false };
  let prefs = { ...PADRAO };
 
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
    localStorage.setItem('conecta-prefs', JSON.stringify(prefs));
  }
 
  document.querySelectorAll('.barra-acess button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const acao = btn.dataset.acao;
      if (acao === 'aumentar') prefs.escala = Math.min(ESCALA_MAX, prefs.escala + 0.1);
      if (acao === 'diminuir') prefs.escala = Math.max(ESCALA_MIN, prefs.escala - 0.1);
      if (acao === 'contraste') prefs.contraste = !prefs.contraste;
      if (acao === 'fonte') prefs.fonte = !prefs.fonte;
      if (acao === 'reset') prefs = { ...PADRAO };
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
      avisoIdioma.textContent = modo === 'libras'
        ? 'Modo Libras selecionado: os conteúdos serão exibidos com vídeos em Língua Brasileira de Sinais.'
        : 'Modo Português selecionado: os conteúdos serão exibidos em texto.';
    });
  });
 
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
  renderFeed();
})();