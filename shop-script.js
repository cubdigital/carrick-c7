//   Carrick shop — footer custom code (View All toggle + C7 tile filter + product hydration)
//   FIXED VERSION. Paste this whole block into the shop page footer custom code.

//   What changed vs your version:
//   - initialiseShopViewAll() is now idempotent (guarded by data-shop-view-all-ready).
//     The 500ms/1500ms re-runs no longer re-collapse a section the user already expanded.
//   Everything else is unchanged from your working version (proxy fetch, no secret).

//   REQUIRED MARKUP (per product section) — this is what makes View All work:
//     <div data-shop-section="true">              wrapper (contains BOTH button and grid)
//       <a data-shop-view-all="true">View All</a>  toggle button
//       <div class="collection-grid w-dyn-items">  the grid
//         <div data-c7-card="slug" class="w-dyn-item">…</div>
//         …
//       </div>
//     </div>
//   Do NOT put data-shop-section on anything inside [data-shop-filter-results]
//   (the 8-tile "Wine Collections" grid) — that belongs to the tile filter.

document.addEventListener("DOMContentLoaded", () => {
  const C7_PRODUCTS_ENDPOINT =
    "https://project-kf5jq.vercel.app/api/c7-products";

  const SHOP_HEADING_TEXT = "Wine Collections";
  const HIDE_CARD_IF_NO_C7_MATCH = false;
  const INITIAL_VISIBLE_COUNT = 3;

  /**
   * Fallback C7 collection IDs.
   * These are only used if data-c7-collection-id is missing from the tile.
   */
  const FALLBACK_COLLECTION_IDS = {
    estate: "3a59280b-6e8f-4538-a46d-6d0076c601d6",
    "limited-release": "e0565a5a-9c5f-4e72-b4d5-4b8444b5edb6",
    "discovery-natural": "8afe5fba-6e3d-40c3-a4d0-6d061e3a2de1",
    white: "56fe6c39-1223-490b-9f04-160d7801049d",
    "pinot-noir": "948e58c2-38ed-472e-ab8b-b70b26726822",
    "library-wine-release": "147d79b5-1911-4589-82ff-94cfd80d8f7e",
    "gift-pack": "9157155e-caf4-432d-a6ae-06b7bca44219",
    magnums: "3d690d5f-6a0c-4042-9e38-a3694853c83f",
  };

  initialiseShop();

  async function initialiseShop() {
    const c7Products = await getCommerce7AvailableProducts();

    updateWebflowProductCards(c7Products);

    await setupCommerce7CollectionFilters(c7Products);

    initialiseShopViewAll();
    customiseShopLoginButtons();

    // Re-run after Commerce7/Webflow scripts have finished hydrating/reordering cards.
    setTimeout(initialiseShopViewAll, 500);
    setTimeout(initialiseShopViewAll, 1500);
    setTimeout(customiseShopLoginButtons, 500);
    setTimeout(customiseShopLoginButtons, 1500);
  }

  /* ========================================
       CLUB-MEMBER LOGIN BUTTON
       C7 injects a plain "Login" button for
       members-only products — match Add to Cart.
    ======================================== */

  function customiseShopLoginButtons() {
    document
      .querySelectorAll(".c7-product__login-message button")
      .forEach((button) => {
        if (
          button.dataset.carrickLoginButtonReady === "true" &&
          button.classList.contains("c7-button") &&
          button.textContent === "LOGIN TO PURCHASE"
        ) {
          return;
        }

        button.dataset.carrickLoginButtonReady = "true";
        button.classList.add("c7-button");
        button.textContent = "LOGIN TO PURCHASE";
        button.setAttribute("aria-label", "Login to purchase");
      });
  }

  function observeShopLoginButtons() {
    customiseShopLoginButtons();

    const observer = new MutationObserver(customiseShopLoginButtons);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  observeShopLoginButtons();

  /* ========================================
       VIEW ALL / HIDE FUNCTIONALITY
       Requires:
       - data-shop-section="true" on each section wrapper
       - data-shop-view-all="true" on each View All button
       - data-shop-item="true" on each CMS item/card (or [data-c7-card] / .w-dyn-item)
    ======================================== */

  function getSectionItems(section) {
    return Array.from(
      section.querySelectorAll("[data-shop-item], [data-c7-card], .w-dyn-item"),
    );
  }

  function setViewAllButtonText(button, expanded) {
    button.textContent = expanded ? "Hide" : "View All";
    button.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function collapseShopSection(section, button) {
    const items = getSectionItems(section);

    items.forEach((item, index) => {
      const shouldShow = index < INITIAL_VISIBLE_COUNT;

      item.hidden = !shouldShow;
      item.style.display = shouldShow ? "" : "none";
      item.style.opacity = "1";
      item.style.visibility = "visible";
      item.classList.toggle("is-hidden", !shouldShow);
    });

    section.setAttribute("data-shop-expanded", "false");
    setViewAllButtonText(button, false);
  }

  function expandShopSection(section, button) {
    const items = getSectionItems(section);

    items.forEach((item) => {
      item.hidden = false;
      item.style.display = "";
      item.style.opacity = "1";
      item.style.visibility = "visible";
      item.classList.remove(
        "is-hidden",
        "hidden",
        "hide",
        "w-condition-invisible",
      );
    });

    const emptyState = section.querySelector(".w-dyn-empty");
    if (emptyState) {
      emptyState.style.display = "none";
    }

    const pagination = section.querySelector(".w-pagination-wrapper");
    if (pagination) {
      pagination.style.display = "none";
    }

    section.setAttribute("data-shop-expanded", "true");
    setViewAllButtonText(button, true);
  }

  function initialiseShopViewAll() {
    const buttons = document.querySelectorAll("[data-shop-view-all]");

    buttons.forEach((button) => {
      const section = button.closest("[data-shop-section]");
      if (!section) {
        console.warn(
          "[shop-view-all] No parent [data-shop-section] found for:",
          button,
        );
        return;
      }

      // This runs on load + at 500ms + 1500ms (to catch late Webflow/C7 hydration).
      // Guard so the re-runs never re-collapse a section the user already expanded.
      if (section.dataset.shopViewAllReady === "true") {
        return;
      }
      section.dataset.shopViewAllReady = "true";

      const items = getSectionItems(section);

      if (items.length <= INITIAL_VISIBLE_COUNT) {
        button.style.display = "none";
        expandShopSection(section, button);
        return;
      }

      button.style.display = "";
      collapseShopSection(section, button);
    });
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-shop-view-all]");
    if (!button) return;

    event.preventDefault();

    const section = button.closest("[data-shop-section]");
    if (!section) {
      console.warn(
        "[shop-view-all] No parent [data-shop-section] found for:",
        button,
      );
      return;
    }

    const isExpanded = section.getAttribute("data-shop-expanded") === "true";

    if (isExpanded) {
      collapseShopSection(section, button);
    } else {
      expandShopSection(section, button);
    }
  });

  /* ========================================
       C7-DRIVEN SINGLE-SELECT SHOP FILTERS
    ======================================== */

  async function setupCommerce7CollectionFilters(allProducts) {
    const filterButtons = Array.from(
      document.querySelectorAll("[data-shop-filter]"),
    ).filter((button) => !button.hasAttribute("data-shop-toggle"));

    const resultsSection = document.querySelector(
      "[data-shop-results-section]",
    );
    const resultsScope = document.querySelector("[data-shop-filter-results]");
    const productCards = Array.from(
      (resultsScope || document).querySelectorAll("[data-c7-card]"),
    );

    const shopHeading = document.querySelector("[data-shop-results-heading]");
    const emptyState = document.querySelector("[data-shop-empty]");

    if (shopHeading) {
      shopHeading.textContent = SHOP_HEADING_TEXT;
    }

    if (!filterButtons.length || !productCards.length) {
      console.warn("[shop-filter] Missing filter buttons or product cards.", {
        filterButtons: filterButtons.length,
        productCards: productCards.length,
      });
      return;
    }

    const collectionOrdersByFilter = await buildCollectionOrders(
      filterButtons,
      allProducts,
    );

    window.__SHOP_COLLECTION_DEBUG__ = collectionOrdersByFilter;

    function getCardSlug(card) {
      return (
        card.getAttribute("data-c7-card") ||
        card.getAttribute("data-c7-product-slug") ||
        ""
      );
    }

    function setHeading() {
      if (shopHeading) {
        shopHeading.textContent = SHOP_HEADING_TEXT;
      }
    }

    function hideAllProducts() {
      setHeading();

      if (resultsSection) {
        resultsSection.style.display = "none";
      }

      productCards.forEach((card) => {
        card.style.display = "none";
      });

      if (emptyState) {
        emptyState.style.display = "none";
      }
    }

    function getActiveButton() {
      return filterButtons.find((button) =>
        button.classList.contains("is-active"),
      );
    }

    function clearActiveButtons() {
      filterButtons.forEach((button) => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
    }

    function activateButton(button) {
      clearActiveButtons();

      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
    }

    function renderSelectedCollection() {
      setHeading();

      const activeButton = getActiveButton();

      if (!activeButton) {
        hideAllProducts();
        return;
      }

      if (resultsSection) {
        resultsSection.style.display = "";
      }

      const activeFilter = activeButton.getAttribute("data-shop-filter");
      const selectedSlugsInOrder = collectionOrdersByFilter[activeFilter] || [];

      const cardsBySlug = new Map();

      productCards.forEach((card) => {
        const slug = getCardSlug(card);

        if (slug) {
          cardsBySlug.set(slug, card);
        }

        card.style.display = "none";
      });

      const visibleCards = [];

      selectedSlugsInOrder.forEach((slug) => {
        const card = cardsBySlug.get(slug);

        if (card) {
          card.style.display = "";
          visibleCards.push(card);
        }
      });

      /**
       * Move visible cards into the selected C7/proxy order.
       * This does not create new cards — it only reorders existing Webflow CMS cards.
       */
      const grid = productCards[0]?.parentElement;

      if (grid) {
        visibleCards.forEach((card) => {
          grid.appendChild(card);
        });
      }

      if (emptyState) {
        emptyState.style.display = visibleCards.length ? "none" : "";
      }

      console.log("[shop-filter] Active collection rendered:", {
        activeFilter,
        expectedProductSlugs: selectedSlugsInOrder.length,
        visibleCards: visibleCards.length,
        missingCards: selectedSlugsInOrder.filter(
          (slug) => !cardsBySlug.has(slug),
        ),
      });
    }

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", (event) => {
        event.preventDefault();

        const isAlreadyActive = button.classList.contains("is-active");

        clearActiveButtons();

        /**
         * Clicking the already-active tile clears the filter.
         * Clicking a different tile replaces the previous active filter.
         */
        if (!isAlreadyActive) {
          activateButton(button);
        }

        renderSelectedCollection();
      });
    });

    /**
     * Initial state:
     * No tile selected = no products shown below Wine Collection tiles.
     */
    hideAllProducts();

    console.log("[shop-filter] C7 single-select collection filtering ready.", {
      collectionOrdersByFilter,
      productCardsFound: productCards.length,
    });
  }

  async function buildCollectionOrders(filterButtons, allProducts) {
    const collectionOrdersByFilter = {};

    await Promise.all(
      filterButtons.map(async (button) => {
        const filter = button.getAttribute("data-shop-filter");
        const collectionId =
          button.getAttribute("data-c7-collection-id") ||
          FALLBACK_COLLECTION_IDS[filter];

        if (!filter || !collectionId) {
          console.warn(
            "[shop-filter] Missing filter or C7 collection ID:",
            button,
          );
          return;
        }

        const products = await getCommerce7ProductsByCollection(
          collectionId,
          allProducts,
        );

        collectionOrdersByFilter[filter] = dedupe(
          products.map((product) => product.slug).filter(Boolean),
        );
      }),
    );

    return collectionOrdersByFilter;
  }

  async function getCommerce7ProductsByCollection(collectionId, allProducts) {
    const productsFromProxy = await fetchCommerce7Products({
      collectionId,
      webStatus: "Available",
      limit: 100,
    });

    const collectionProducts = productsFromProxy.filter((product) =>
      productIsInCollection(product, collectionId),
    );

    if (collectionProducts.length) {
      return sortProductsByCollectionOrder(collectionProducts, collectionId);
    }

    /**
     * Collection-scoped proxy responses use collectionXproduct, not collections[].
     * If the filter missed them, trust the collectionId query response.
     */
    if (productsFromProxy.length) {
      return sortProductsByCollectionOrder(productsFromProxy, collectionId);
    }

    /**
     * Fallback if the proxy does not support collectionId yet.
     * all-products only includes collections[] (no per-collection sortOrder).
     */
    const filteredFromAllProducts = allProducts.filter((product) =>
      productIsInCollection(product, collectionId),
    );

    if (filteredFromAllProducts.length) {
      console.warn(
        "[shop-filter] Proxy did not return collection-specific products; using all-products fallback for collection:",
        collectionId,
      );

      return sortProductsByCollectionOrder(
        filteredFromAllProducts,
        collectionId,
      );
    }

    return [];
  }

  async function getCommerce7AvailableProducts() {
    const products = await fetchCommerce7Products({
      webStatus: "Available",
      limit: 100,
    });

    console.log(
      "Commerce7 available products found via proxy:",
      products.length,
    );

    return products;
  }

  async function fetchCommerce7Products(params = {}) {
    try {
      const url = new URL(C7_PRODUCTS_ENDPOINT);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: "GET",
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        console.error("Commerce7 proxy request failed:", {
          status: response.status,
          statusText: response.statusText,
          response: data,
          params,
        });

        return [];
      }

      return normaliseProductsResponse(data);
    } catch (error) {
      console.error("Commerce7 proxy fetch error:", {
        params,
        error,
      });

      return [];
    }
  }

  function normaliseProductsResponse(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.products)) {
      return data.products;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (data?.product) {
      return [data.product];
    }

    return [];
  }

  function productIsInCollection(product, collectionId) {
    const collectionXproduct = product.collectionXproduct;

    if (collectionXproduct) {
      return (
        collectionXproduct.collectionId === collectionId ||
        collectionXproduct.collection?.id === collectionId
      );
    }

    const collections = Array.isArray(product.collections)
      ? product.collections
      : [];

    return collections.some((collection) => {
      if (!collection) return false;

      if (typeof collection === "string") {
        return collection === collectionId;
      }

      return (
        collection.id === collectionId ||
        collection.collectionId === collectionId ||
        collection.productCollectionId === collectionId
      );
    });
  }

  function getProductCollectionSortOrder(product, collectionId) {
    const collectionXproduct = product.collectionXproduct;

    if (
      collectionXproduct &&
      (collectionXproduct.collectionId === collectionId ||
        collectionXproduct.collection?.id === collectionId) &&
      collectionXproduct.sortOrder != null
    ) {
      return collectionXproduct.sortOrder;
    }

    const collections = Array.isArray(product.collections)
      ? product.collections
      : [];

    for (const collection of collections) {
      if (!collection || typeof collection === "string") {
        continue;
      }

      const id =
        collection.id ||
        collection.collectionId ||
        collection.productCollectionId;

      if (id === collectionId && collection.sortOrder != null) {
        return collection.sortOrder;
      }
    }

    return null;
  }

  function sortProductsByCollectionOrder(products, collectionId) {
    return [...products].sort((productA, productB) => {
      const orderA = getProductCollectionSortOrder(productA, collectionId);
      const orderB = getProductCollectionSortOrder(productB, collectionId);

      if (orderA != null && orderB != null) {
        return orderA - orderB;
      }

      if (orderA != null) {
        return -1;
      }

      if (orderB != null) {
        return 1;
      }

      return 0;
    });
  }

  /* ========================================
       COMMERCE7 PRODUCT DATA
       Keeps product image/price/link/title/subtitle enrichment.
    ======================================== */

  function c7ProductImage(product) {
    if (product.image && !product.image.includes("/images/original/")) {
      return {
        src: product.image,
        srcset: product.imageSrcSet || "",
      };
    }

    const image = product.images?.[0];
    if (!image) return { src: "", srcset: "" };

    const formats = image.formats ?? {};

    const src =
      formats.large?.webp ??
      formats.medium?.webp ??
      formats["x-large"]?.webp ??
      image.src ??
      "";

    const srcset = [
      formats.small?.webp && `${formats.small.webp} ${formats.small.width}w`,
      formats.medium?.webp && `${formats.medium.webp} ${formats.medium.width}w`,
      formats.large?.webp && `${formats.large.webp} ${formats.large.width}w`,
      formats["x-large"]?.webp &&
        `${formats["x-large"].webp} ${formats["x-large"].width}w`,
    ]
      .filter(Boolean)
      .join(", ");

    return { src, srcset };
  }

  function updateWebflowProductCards(c7Products) {
    const c7ProductsBySlug = {};

    c7Products.forEach((product) => {
      if (product.slug) {
        c7ProductsBySlug[product.slug] = product;
      }
    });

    const webflowCards = document.querySelectorAll("[data-c7-card]");

    window.__SHOP_PRODUCTS_DEBUG__ = {
      c7ProductsFound: c7Products.length,
      webflowCardsFound: webflowCards.length,
    };

    console.log("Webflow product cards found:", webflowCards.length);
    console.log("Commerce7 products found:", c7Products.length);

    webflowCards.forEach((card) => {
      const slug =
        card.getAttribute("data-c7-card") ||
        card.getAttribute("data-c7-product-slug");

      if (!slug) {
        console.warn("Webflow product card missing slug:", card);
        return;
      }

      const c7Product = c7ProductsBySlug[slug];

      if (!c7Product) {
        console.warn("No matching Commerce7 product found for slug:", slug);

        if (HIDE_CARD_IF_NO_C7_MATCH) {
          card.style.display = "none";
        }

        return;
      }

      updateProductCard(card, c7Product);
    });
  }

  function updateProductCard(card, product) {
    const image = card.querySelector("[data-c7-image]");
    const price = card.querySelector("[data-c7-price]");
    const link = card.querySelector("[data-c7-link]");
    const title = card.querySelector("[data-c7-title]");
    const subtitle = card.querySelector("[data-c7-product-subtitle]");

    if (subtitle) {
      const subtitleText = product.subTitle || "";

      subtitle.textContent = subtitleText;
      subtitle.style.display = subtitleText ? "" : "none";
    }

    const firstVariant =
      Array.isArray(product.variants) && product.variants.length
        ? product.variants[0]
        : null;

    /**
     * Update image from Commerce7 formats (not images[0].src — that is the original upload).
     */
    if (image) {
      const c7Image = c7ProductImage(product);

      if (c7Image.src) {
        image.src = c7Image.src;

        if (c7Image.srcset) {
          image.srcset = c7Image.srcset;
          image.sizes =
            "(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw";
        } else {
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
        }

        image.loading = "lazy";
        image.decoding = "async";
        image.alt = product.title || "";
      } else {
        console.warn("No C7 image found for:", product.slug);
      }
    }

    /**
     * Update price from Commerce7.
     */
    if (price) {
      const rawPrice =
        firstVariant?.price ||
        firstVariant?.retailPrice ||
        firstVariant?.salePrice ||
        null;

      if (rawPrice) {
        price.textContent = formatPrice(rawPrice);
      }
    }

    /**
     * Update product link.
     */
    if (link && product.slug) {
      link.href = `/product/${product.slug}`;
    }

    /**
     * Optional title override.
     */
    if (title && product.title) {
      title.textContent = product.title;
    }

    /**
     * Add useful C7 attributes to the card.
     */
    card.setAttribute("data-c7-product-id", product.id || "");
    card.setAttribute("data-c7-product-slug", product.slug || "");

    if (firstVariant?.id) {
      card.setAttribute("data-c7-variant-id", firstVariant.id);
    }
  }

  function formatPrice(value) {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    const dollars = number / 100;

    return `$${dollars.toFixed(2)}`;
  }

  function dedupe(items) {
    return Array.from(new Set(items));
  }
});
