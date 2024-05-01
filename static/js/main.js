document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#menu-button");
  const menu = document.querySelector("#menu");

  if (button && menu) {
    button.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  } else {
    console.error("No se encontraron los elementos del menú.");
  }
});


