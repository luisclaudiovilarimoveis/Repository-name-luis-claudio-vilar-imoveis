(() => {
  "use strict";

  function iniciarSite() {
    const config = window.CLIENTE_CONFIG || {};

    const normalizarUrl = (valor) => {
      const texto = String(valor || "").trim();
      if (!texto) return "";
      return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
    };

    const configurarLink = (nome, href) => {
      const elemento = document.querySelector(`[data-link="${nome}"]`);
      if (!elemento || !href) return;

      elemento.href = href;
      elemento.style.pointerEvents = "auto";
      elemento.removeAttribute("aria-disabled");
      elemento.setAttribute("tabindex", "0");
    };

    configurarLink("imoveis", normalizarUrl(config.imoveis));

    const numero = String(config.whatsappNumero || "").replace(/\D/g, "");
    if (numero) {
      const mensagem = encodeURIComponent(config.whatsappMensagem || "");
      configurarLink(
        "whatsapp",
        `https://wa.me/${numero}${mensagem ? `?text=${mensagem}` : ""}`
      );
    }

    const email = String(config.email || "").trim();
    if (email) {
      const assunto = encodeURIComponent(config.emailAssunto || "");
      configurarLink(
        "email",
        `mailto:${email}${assunto ? `?subject=${assunto}` : ""}`
      );
    }

    configurarLink("instagram", normalizarUrl(config.instagram));

    const youtube = String(config.youtube || "").trim();
    if (youtube && !/^x+$/i.test(youtube)) {
      configurarLink("youtube", normalizarUrl(youtube));
    }

    if ("serviceWorker" in navigator) {
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker.register("./sw.js").catch((erro) => {
            console.error("Falha ao registrar o Service Worker:", erro);
          });
        },
        { once: true }
      );
    }

    let installPrompt = null;
    const installButton = document.getElementById("installApp");
    const iosInstallModal = document.getElementById("iosInstallModal");
    const closeIosInstall = document.getElementById("closeIosInstall");
    const installTitle = document.getElementById("iosInstallTitle");
    const installInstructions = document.getElementById("installInstructions");

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    const isMobileOrTablet =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileOrTablet && !isStandalone && installButton) {
      installButton.hidden = false;
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      if (installButton) installButton.hidden = false;
    });

    installButton?.addEventListener("click", async () => {
      if (installPrompt) {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        installButton.hidden = true;
        return;
      }

      if (installTitle && installInstructions) {
        if (isIos) {
          installTitle.textContent = "Instalar no iPhone ou iPad";
          installInstructions.innerHTML = `
            <p>Abra este site no Safari e siga:</p>
            <ol>
              <li>Toque em <strong>Compartilhar</strong>.</li>
              <li>Toque em <strong>Adicionar à Tela de Início</strong>.</li>
              <li>Ative <strong>Abrir como App da Web</strong>, se aparecer.</li>
              <li>Toque em <strong>Adicionar</strong>.</li>
            </ol>
          `;
        } else {
          installTitle.textContent = "Instalar no celular";
          installInstructions.innerHTML = `
            <p>No Chrome, siga:</p>
            <ol>
              <li>Toque nos <strong>três pontos</strong> do navegador.</li>
              <li>Toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
              <li>Confirme em <strong>Instalar</strong>.</li>
            </ol>
          `;
        }
      }

      if (iosInstallModal) iosInstallModal.hidden = false;
    });

    closeIosInstall?.addEventListener("click", () => {
      if (iosInstallModal) iosInstallModal.hidden = true;
    });

    iosInstallModal?.addEventListener("click", (event) => {
      if (event.target === iosInstallModal) {
        iosInstallModal.hidden = true;
      }
    });

    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      if (installButton) installButton.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarSite, { once: true });
  } else {
    iniciarSite();
  }
})();
