/* =========================================================
   WATERFRUIT — script.js
   El menú móvil ahora lo maneja el componente Collapse de
   Bootstrap (ver data-bs-toggle en el HTML). Este archivo se
   encarga de: cerrar el menú al elegir una opción, la
   encuesta funcional, el contador de participantes, las
   animaciones al hacer scroll y la configuración de redes
   sociales.
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. CONFIGURACIÓN DE REDES SOCIALES
     Reemplaza estos valores por los enlaces reales de Waterfruit.
  --------------------------------------------------------- */
  const REDES = {
    instagram: "https://www.instagram.com/waterfruit_piura?stkn=MWJpNTR1OW5rb2NjMg%3D%3D&utm_source=qr",
    facebook: "https://www.facebook.com/share/1DbD7hs9iC/?mibextid=wwXIfr"
  };

  function configurarRedesSociales() {
    const enlaces = document.querySelectorAll("[data-social]");
    enlaces.forEach((enlace) => {
      const clave = enlace.getAttribute("data-social");
      if (REDES[clave]) {
        enlace.setAttribute("href", REDES[clave]);
      }
    });
  }

  /* ---------------------------------------------------------
     2. CERRAR EL MENÚ DE BOOTSTRAP AL ELEGIR UNA OPCIÓN
     El menú hamburguesa (navbar-collapse) es de Bootstrap;
     solo nos aseguramos de que se cierre en móvil al tocar
     un enlace, usando la propia API de Bootstrap.
  --------------------------------------------------------- */
  function iniciarCierreDeMenu() {
    const menu = document.getElementById("navMenu");
    if (!menu || !window.bootstrap) return;

    const enlaces = menu.querySelectorAll(".nav-link");
    enlaces.forEach((enlace) => {
      enlace.addEventListener("click", () => {
        const instancia = window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
        instancia.hide();
      });
    });
  }

  /* ---------------------------------------------------------
     3. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
  --------------------------------------------------------- */
  function iniciarAnimacionesReveal() {
    const elementos = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || elementos.length === 0) {
      elementos.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elementos.forEach((el) => observador.observe(el));
  }

  /* ---------------------------------------------------------
     4. ENCUESTA FUNCIONAL
     NOTA IMPORTANTE:
     localStorage solamente guarda las respuestas en el
     navegador de la persona que llena el formulario. Cada
     visitante tiene su propio almacenamiento local, por lo
     que esto sirve para una demostración o prototipo, pero
     NO centraliza respuestas de distintas personas en un
     solo lugar. Para recolectar respuestas reales de muchos
     usuarios, más adelante se puede conectar este formulario
     a un servicio externo como Google Forms, Supabase o
     Firebase, que sí almacenan los datos en un servidor
     compartido.
  --------------------------------------------------------- */

  const CLAVE_RESPUESTAS = "waterfruit_respuestas";
  const CLAVE_CONTADOR = "waterfruit_participantes";

  function obtenerContadorActual() {
    const valor = localStorage.getItem(CLAVE_CONTADOR);
    return valor ? parseInt(valor, 10) : 0;
  }

  function actualizarContadorEnPantalla() {
    const elementoContador = document.getElementById("participantCount");
    if (elementoContador) {
      elementoContador.textContent = String(obtenerContadorActual());
    }
  }

  function guardarRespuesta(respuesta) {
    const respuestasPrevias = JSON.parse(
      localStorage.getItem(CLAVE_RESPUESTAS) || "[]"
    );
    respuestasPrevias.push(respuesta);
    localStorage.setItem(CLAVE_RESPUESTAS, JSON.stringify(respuestasPrevias));

    const nuevoContador = obtenerContadorActual() + 1;
    localStorage.setItem(CLAVE_CONTADOR, String(nuevoContador));
  }

  function mostrarError(campo, mensaje) {
    const error = document.querySelector(`[data-error-for="${campo}"]`);
    if (error) error.textContent = mensaje;
  }

  function limpiarErrores(formulario) {
    formulario.querySelectorAll(".survey-error").forEach((el) => {
      el.textContent = "";
    });
  }

  function validarEncuesta(formulario) {
    let esValido = true;
    limpiarErrores(formulario);

    const sabor = formulario.querySelector('input[name="sabor"]:checked');
    if (!sabor) {
      mostrarError("sabor", "Selecciona un sabor.");
      esValido = false;
    }

    const atractivo = formulario.querySelector('input[name="atractivo"]:checked');
    if (!atractivo) {
      mostrarError("atractivo", "Selecciona una calificación.");
      esValido = false;
    }

    const compraria = formulario.querySelector('input[name="compraria"]:checked');
    if (!compraria) {
      mostrarError("compraria", "Selecciona una opción.");
      esValido = false;
    }

    const saborNuevo = formulario.querySelector("#saborNuevo");
    if (!saborNuevo.value) {
      mostrarError("saborNuevo", "Selecciona un sabor.");
      esValido = false;
    }

    const opinion = formulario.querySelector("#opinion");
    if (!opinion.value.trim()) {
      mostrarError("opinion", "Cuéntanos brevemente tu opinión.");
      esValido = false;
    }

    return esValido;
  }

  function iniciarEncuesta() {
    const formulario = document.getElementById("surveyForm");
    const mensajeExito = document.getElementById("surveySuccess");
    if (!formulario) return;

    actualizarContadorEnPantalla();

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault(); // No recargar la página

      if (!validarEncuesta(formulario)) {
        if (mensajeExito) mensajeExito.textContent = "";
        return;
      }

      const respuesta = {
        sabor: formulario.querySelector('input[name="sabor"]:checked').value,
        atractivo: formulario.querySelector('input[name="atractivo"]:checked').value,
        compraria: formulario.querySelector('input[name="compraria"]:checked').value,
        saborNuevo: formulario.querySelector("#saborNuevo").value,
        opinion: formulario.querySelector("#opinion").value.trim(),
        fecha: new Date().toISOString()
      };

      guardarRespuesta(respuesta);
      actualizarContadorEnPantalla();

      formulario.reset();
      limpiarErrores(formulario);

      if (mensajeExito) {
        mensajeExito.textContent = "¡Gracias por ayudarnos a mejorar Waterfruit!";
      }
    });
  }

  /* ---------------------------------------------------------
     INICIALIZACIÓN
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    configurarRedesSociales();
    iniciarCierreDeMenu();
    iniciarAnimacionesReveal();
    iniciarEncuesta();
  });
})();