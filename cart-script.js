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

function carrickEnhanceCartLayout() {
  const cartItems = document.querySelector("#c7-content .c7-cart-items");

  if (!cartItems || cartItems.dataset.carrickHeaders === "true") return;
  if (!cartItems.querySelector(":scope > div")) return;

  const header = document.createElement("div");
  header.className = "carrick-cart-col-header";
  header.innerHTML = `
    <span class="carrick-cart-col-header__image" aria-hidden="true"></span>
    <span class="carrick-cart-col-header__product">Product</span>
    <span class="carrick-cart-col-header__qty">Qty</span>
    <span class="carrick-cart-col-header__price">Price</span>
    <span class="carrick-cart-col-header__total">Total</span>
  `;

  cartItems.prepend(header);
  cartItems.dataset.carrickHeaders = "true";
}

function carrickEnhanceCouponInput() {
  const couponInput = document.querySelector("#c7-content #c7-promoCode");

  if (!couponInput || couponInput.dataset.carrickPlaceholder === "true") return;

  couponInput.setAttribute("placeholder", "Enter your code");
  couponInput.setAttribute("aria-label", "Coupon code");
  couponInput.dataset.carrickPlaceholder = "true";
}

function carrickInitCartPage() {
  carrickFormatEmptyCartMessage();
  carrickEnhanceCartLayout();
  carrickEnhanceCouponInput();
}

document.addEventListener("DOMContentLoaded", carrickInitCartPage);
window.addEventListener("load", carrickInitCartPage);

const carrickCartObserver = new MutationObserver(carrickInitCartPage);

carrickCartObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
