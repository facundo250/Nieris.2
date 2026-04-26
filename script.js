const contenedor = document.getElementById('contenedor-principal');
let sonidoHabilitado = false;
let paginaActual = 1;
let cargando = false; 

async function traerVideosDeInternet() {
    if (cargando) return; 
    cargando = true ;

    try {
        const respuesta = await fetch(`https://api.pexels.com/videos/popular?per_page=10&page=${paginaActual}`, {
            headers: {
                Authorization: "563492ad6f91700001000001bc93c06e206940d99818816c52a0a256"
            }
        });
        
        const datos = await respuesta.json();
        
        if (datos.videos.length > 0) {
            datos.videos.forEach(videoInfo => {
                const archivoVideo = videoInfo.video_files.find(f => f.quality === 'sd') || videoInfo.video_files[0];
                crearPost({
                    url: archivoVideo.link,
                    autor: videoInfo.user.name
                });
            });
            paginaActual++;
        }
    } catch (error) {
        console.error("Error en la carga infinita");
    } finally {
        cargando = false; 
    }
}

function crearPost(datos) {
    const seccion = document.createElement('section');
    seccion.className = 'post';

    seccion.innerHTML = `
        <video src="${datos.url}" loop muted playsinline></video>
        <div class="info-usuario">
            <h3>@${datos.autor.replace(/\s+/g, '_').toLowerCase()}</h3>
        </div>
        <button class="btn-like">♥</button>
    `;

    const video = seccion.querySelector('video');
    const boton = seccion.querySelector('.btn-like');

    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaRojo = boton.style.color === 'red';
        boton.style.color = estaRojo ? 'white' : 'red';
        boton.style.backgroundColor = estaRojo ? 'rgba(0,0,0,0.4)' : 'white';
    });

    seccion.addEventListener('click', () => {
        if (video.paused) {
            video.muted = false;
            sonidoHabilitado = true;
            video.play();
        } else {
            video.pause();
        }
    });

    contenedor.appendChild(seccion);
    vigilante.observe(seccion);
}

const vigilante = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        const video = entrada.target.querySelector('video');
        
        if (entrada.isIntersecting) {
            video.currentTime = 0;
            video.muted = !sonidoHabilitado;
            video.play().catch(() => {
                video.muted = true;
                video.play();
            });

            
            const todosLosPosts = Array.from(document.querySelectorAll('.post'));
            const indiceActual = todosLosPosts.indexOf(entrada.target);
            
            if (indiceActual >= todosLosPosts.length - 3) {
                traerVideosDeInternet();
            }
        } else {
            video.pause();
            video.muted = true;
        }
    });
}, { threshold: 0.5 });


traerVideosDeInternet();
