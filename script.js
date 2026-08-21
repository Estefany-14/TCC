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

  /* ---------------- modal de cadastro ---------------- */
  const modalCadastro = document.getElementById('modalCadastro');
  const btnCadastro = document.getElementById('btnCadastro');
  const fecharModal = document.getElementById('fecharModal');
  const formCadastro = document.getElementById('formCadastro');
  const msgCadastro = document.getElementById('msgCadastro');

  function abrirModal() {
    modalCadastro.classList.add('aberto');
    modalCadastro.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('cadNome').focus();
  }

  function fecharModalCadastro() {
    modalCadastro.classList.remove('aberto');
    modalCadastro.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    msgCadastro.textContent = '';
  }

  btnCadastro.addEventListener('click', abrirModal);
  fecharModal.addEventListener('click', fecharModalCadastro);

  modalCadastro.addEventListener('click', (e) => {
    if (e.target === modalCadastro) fecharModalCadastro();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCadastro.classList.contains('aberto')) {
      fecharModalCadastro();
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

  cadCPF.addEventListener('input', (e) => {
    e.target.value = formatarCPF(e.target.value);
  });

  cadTelefone.addEventListener('input', (e) => {
    e.target.value = formatarTelefone(e.target.value);
  });

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
    const cpf = formCadastro.cadCPF.value.trim();
    const telefone = formCadastro.cadTelefone.value.trim();
    const endereco = formCadastro.cadEndereco.value.trim();
    const cidade = formCadastro.cadCidade.value.trim();
    const uf = formCadastro.cadUF.value;
    const interesse = formCadastro.cadInteresse.value;
    const aceiteTermos = document.getElementById('aceiteTermos').checked;

    if (!nome || !email) {
      msgCadastro.textContent = 'Por favor, preencha os campos obrigatórios (*).';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgCadastro.textContent = 'Por favor, insira um e-mail válido.';
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
    btnCadastro.style.display = 'inline-block';
    btnCadastro.onclick = abrirModal;
    document.getElementById('linkPerfil').style.display = 'none';
    document.getElementById('perfil').style.display = 'none';
    window.location.href = '#inicio';
  });

  function verificarUsuarioLogado() {
    const usuario = getUsuarioLogado();
    const linkPerfil = document.getElementById('linkPerfil');
    
    if (usuario) {
      btnCadastro.style.display = 'none';
      linkPerfil.style.display = 'inline-block';
      linkPerfil.onclick = mostrarPerfil;
    } else {
      btnCadastro.style.display = 'inline-block';
      linkPerfil.style.display = 'none';
      btnCadastro.onclick = abrirModal;
    }
  }

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