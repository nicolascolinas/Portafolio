// ==========================================
// MENÚ PARA CELULAR
// ==========================================

const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("active");
    });
}


// ==========================================
// CERRAR MENÚ AL SELECCIONAR UNA OPCIÓN
// ==========================================

const navigationLinks = document.querySelectorAll(".nav a");

if (navigation) {
    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {
            navigation.classList.remove("active");
        });

    });
}


// ==========================================
// FORMULARIO DE CONTACTO
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = document.getElementById("name")?.value || "";
        const phone = document.getElementById("phone")?.value || "";
        const service = document.getElementById("service")?.value || "";
        const message = document.getElementById("message")?.value || "";

        const whatsappNumber = "5491123580709";

        const whatsappMessage =
            `Hola, soy ${name}.%0A%0A` +
            `Teléfono: ${phone}%0A` +
            `Servicio: ${service}%0A%0A` +
            `Consulta: ${message}`;

        const whatsappUrl =
            `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

        window.open(whatsappUrl, "_blank");

    });

}


// ==========================================
// BOTÓN FLOTANTE DE WHATSAPP
// ==========================================

const whatsappButton = document.getElementById("whatsappButton");

if (whatsappButton) {

    const whatsappNumber = "5491123580709";

    whatsappButton.href =
        `https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20consultar%20por%20un%20aire%20acondicionado.`;

}


// ==========================================
// CARRUSEL PRINCIPAL
// ==========================================

const fotosHero = [
    "img/carru1.jpg",
    "img/carru2.jpg",
    "img/carru3.jpg",
    "img/carru4.jpg"
];

let fotoActual = 0;

const heroImage = document.getElementById("hero-carousel");

if (heroImage) {

    setInterval(() => {

        // Desaparece
        heroImage.style.opacity = "0";

        setTimeout(() => {

            // Siguiente imagen
            fotoActual++;

            if (fotoActual >= fotosHero.length) {
                fotoActual = 0;
            }

            heroImage.src = fotosHero[fotoActual];

            // Vuelve a aparecer
            heroImage.style.opacity = "1";

        }, 500);

    }, 3000);

}