function carrickFormatEmptyCartMessage() {
  const emptyCart = document.querySelector(
    "#c7-content .c7-message--empty-cart",
  );

  if (!emptyCart || emptyCart.dataset.carrickFormatted === "true") return;

  const originalLink = emptyCart.querySelector("a");

  if (!originalLink) return;

  const href = originalLink.getAttribute("href") || "/collection/wine";

  emptyCart.innerHTML = `
      <p class="c7-empty-cart-text">There are currently no items in your cart.</p>
      <a class="c7-empty-cart-button" href="${href}">Why not add an item?</a>
    `;

  emptyCart.dataset.carrickFormatted = "true";
}

document.addEventListener("DOMContentLoaded", carrickFormatEmptyCartMessage);
window.addEventListener("load", carrickFormatEmptyCartMessage);

const carrickCartObserver = new MutationObserver(carrickFormatEmptyCartMessage);

carrickCartObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
