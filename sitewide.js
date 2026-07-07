/* ========================================
     Carrick age gate
     Saves confirmation on same browser/device
  ======================================== */

  (() => {
    const STORAGE_KEY = 'carrick-age-verified';

    function getStoredAgeConfirmation() {
      try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
      } catch (error) {
        return false;
      }
    }

    function setStoredAgeConfirmation() {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (error) {
        console.warn('Unable to save Carrick age confirmation.', error);
      }
    }

    function initialiseAgeGate() {
      const gate = document.getElementById('age-gate') || document.querySelector('[data-age-gate]');

      const checkbox = document.getElementById('age-confirm') || document.querySelector('[data-age-checkbox]');

      const enterButton = document.getElementById('age-enter') || document.querySelector('[data-age-confirm]');

      const form = checkbox?.closest('form');

      if (!gate || !checkbox || !enterButton) {
        console.warn('Carrick age-gate elements were not found.');
        return;
      }

      function hideGate() {
        gate.style.setProperty('display', 'none', 'important');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }

      function showGate() {
        gate.style.setProperty('display', 'flex', 'important');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        gate.setAttribute('role', 'dialog');
        gate.setAttribute('aria-modal', 'true');
        gate.setAttribute('aria-label', 'Age verification');

        window.setTimeout(() => {
          checkbox.focus();
        }, 0);
      }

      function updateEnterButtonState() {
        const isConfirmed = checkbox.checked;

        enterButton.setAttribute('aria-disabled', String(!isConfirmed));
        enterButton.style.pointerEvents = isConfirmed ? 'auto' : 'none';
        enterButton.style.opacity = isConfirmed ? '1' : '0.5';
      }

      if (form) {
        form.addEventListener(
          'submit',
          (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          },
          true,
        );
      }

      if (getStoredAgeConfirmation()) {
        hideGate();
        return;
      }

      showGate();
      updateEnterButtonState();

      checkbox.addEventListener('change', updateEnterButtonState);

      enterButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (!checkbox.checked) {
          checkbox.focus();
          return;
        }

        setStoredAgeConfirmation();
        hideGate();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialiseAgeGate);
    } else {
      initialiseAgeGate();
    }
  })();

  /* ========================================
     Commerce7 quantity counters
  ======================================== */

  (() => {
    const addToCartSelector = ['.product-detail-add-to-cart .c7-product__variant__add-to-cart', '.related-product-add-to-cart .c7-product__variant__add-to-cart', '.shop-product-add-to-cart .c7-product__variant__add-to-cart'].join(',');

    function updateQuantity(input, value) {
      const nextValue = Math.max(1, Number.parseInt(value, 10) || 1);

      const nativeValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

      if (nativeValueSetter) {
        nativeValueSetter.call(input, String(nextValue));
      } else {
        input.value = String(nextValue);
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function addQuantityCounters() {
      document.querySelectorAll(addToCartSelector).forEach((addToCartWrapper) => {
        if (addToCartWrapper.dataset.counterReady === 'true') return;

        const label = addToCartWrapper.querySelector('label');
        const input = label?.querySelector('input[name="quantity"]');

        if (!label || !input) return;

        addToCartWrapper.dataset.counterReady = 'true';

        const counter = document.createElement('div');
        counter.className = 'c7-quantity-counter';

        const decreaseButton = document.createElement('button');
        decreaseButton.type = 'button';
        decreaseButton.className = 'c7-quantity-button';
        decreaseButton.setAttribute('aria-label', 'Decrease quantity');
        decreaseButton.textContent = '−';

        const increaseButton = document.createElement('button');
        increaseButton.type = 'button';
        increaseButton.className = 'c7-quantity-button';
        increaseButton.setAttribute('aria-label', 'Increase quantity');
        increaseButton.textContent = '+';

        addToCartWrapper.insertBefore(counter, label);

        counter.appendChild(decreaseButton);
        counter.appendChild(label);
        counter.appendChild(increaseButton);

        decreaseButton.addEventListener('click', () => {
          const currentValue = Number.parseInt(input.value, 10) || 1;
          updateQuantity(input, currentValue - 1);
        });

        increaseButton.addEventListener('click', () => {
          const currentValue = Number.parseInt(input.value, 10) || 1;
          updateQuantity(input, currentValue + 1);
        });

        input.addEventListener('blur', () => {
          const normalisedValue = Math.max(1, Number.parseInt(input.value, 10) || 1);

          if (input.value !== String(normalisedValue)) {
            updateQuantity(input, normalisedValue);
          }
        });
      });
    }

    function initialiseCounters() {
      addQuantityCounters();

      let count = 0;

      const observer = new MutationObserver(() => {
        count++;
        addQuantityCounters();

        if (count % 100 === 0) {
          console.log('MutationObserver fired:', count);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialiseCounters);
    } else {
      initialiseCounters();
    }
  })();

  /* ========================================
     Move Commerce7 header actions
     between desktop and mobile slots
  ======================================== */

  (() => {
    const actions = document.querySelector('[data-c7-header-actions]');
    const desktopSlot = document.querySelector('[data-c7-actions-desktop]');
    const mobileSlot = document.querySelector('[data-c7-actions-mobile]');
    const mobileQuery = window.matchMedia('(max-width: 991px)');

    function placeCommerce7Actions() {
      if (!actions || !desktopSlot || !mobileSlot) return;

      const targetSlot = mobileQuery.matches ? mobileSlot : desktopSlot;

      if (actions.parentElement !== targetSlot) {
        targetSlot.appendChild(actions);
      }
    }

    placeCommerce7Actions();

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', placeCommerce7Actions);
    } else {
      mobileQuery.addListener(placeCommerce7Actions);
    }
  })();

  /* ========================================
     Close C7 cart before mobile menu opens
  ======================================== */

  (() => {
    const menuButton = document.querySelector('.wrapper-button-menu');

    if (!menuButton) return;

    function closeCommerce7Cart() {
      const cartCloseButton = document.querySelector('.c7-cart__close');

      if (!cartCloseButton) return;

      const isVisible = cartCloseButton.offsetParent !== null && window.getComputedStyle(cartCloseButton).visibility !== 'hidden';

      if (isVisible) {
        cartCloseButton.click();
      }
    }

    menuButton.addEventListener('pointerdown', closeCommerce7Cart, true);

    menuButton.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          closeCommerce7Cart();
        }
      },
      true,
    );
  })();

  /* ========================================
     Mobile add-to-cart confirmation
  ======================================== */

  (() => {
    const mobileQuery = window.matchMedia('(max-width: 991px)');

    const addButtonSelector = ['.product-detail-add-to-cart .c7-button', '.related-product-add-to-cart .c7-button', '.shop-product-add-to-cart .c7-button'].join(',');

    let toast;
    let hideTimer;
    let pendingRequest = 0;

    let cartTrigger;
    let cartTriggerOriginalParent;
    let cartTriggerOriginalNextSibling;

    function getCartSnapshot() {
      const cartWidget = document.querySelector('#c7-cart');

      return (cartWidget?.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function getRealCartTrigger() {
      const cartWidget = document.querySelector('#c7-cart');

      if (!cartWidget) return null;

      return cartWidget.querySelector('a:not(.c7-cart__close), button:not(.c7-cart__close), [role="button"]:not(.c7-cart__close)');
    }

    function mountRealCartTrigger() {
      const slot = toast?.querySelector('[data-c7-confirmation-cart-slot]');
      const trigger = getRealCartTrigger();

      if (!slot || !trigger) {
        console.warn('Commerce7 cart trigger not found.');
        return;
      }

      if (!cartTriggerOriginalParent) {
        cartTriggerOriginalParent = trigger.parentNode;
        cartTriggerOriginalNextSibling = trigger.nextSibling;
      }

      cartTrigger = trigger;
      cartTrigger.classList.add('c7-add-confirmation__real-cart-trigger');

      slot.appendChild(cartTrigger);

      cartTrigger.addEventListener(
        'click',
        () => {
          setTimeout(hideToast, 0);
        },
        { once: true },
      );
    }

    function restoreRealCartTrigger() {
      if (!cartTrigger || !cartTriggerOriginalParent) return;

      cartTrigger.classList.remove('c7-add-confirmation__real-cart-trigger');

      if (cartTriggerOriginalNextSibling && cartTriggerOriginalNextSibling.parentNode === cartTriggerOriginalParent) {
        cartTriggerOriginalParent.insertBefore(cartTrigger, cartTriggerOriginalNextSibling);
      } else {
        cartTriggerOriginalParent.appendChild(cartTrigger);
      }

      cartTrigger = null;
    }

    function createToast() {
      if (toast) return toast;

      toast = document.createElement('div');
      toast.className = 'c7-add-confirmation';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      toast.innerHTML = `
        <p class="c7-add-confirmation__title">
          Added to cart
        </p>

        <div class="c7-add-confirmation__actions">
          <div
            class="c7-add-confirmation__button is-primary c7-add-confirmation__cart-slot"
            data-c7-confirmation-cart-slot>
          </div>

          <button
            type="button"
            class="c7-add-confirmation__button is-secondary"
            data-c7-confirmation-continue>
            Continue shopping
          </button>
        </div>
      `;

      document.body.appendChild(toast);

      toast.querySelector('[data-c7-confirmation-continue]').addEventListener('click', hideToast);

      return toast;
    }

    function closeCommerce7Cart() {
      const closeButton = document.querySelector('.c7-cart__close');

      if (closeButton && closeButton.offsetParent !== null) {
        closeButton.click();
      }
    }

    function hideToast() {
      if (!toast) return;

      toast.classList.remove('is-visible');
      clearTimeout(hideTimer);

      restoreRealCartTrigger();
    }

    function showToast() {
      if (!mobileQuery.matches) return;

      const confirmation = createToast();

      closeCommerce7Cart();
      setTimeout(closeCommerce7Cart, 250);

      setTimeout(() => {
        mountRealCartTrigger();

        confirmation.classList.add('is-visible');

        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideToast, 6000);
      }, 300);
    }

    function waitForCartUpdate(previousSnapshot, requestId, attempt = 0) {
      if (requestId !== pendingRequest) return;

      const currentSnapshot = getCartSnapshot();

      if (currentSnapshot && currentSnapshot !== previousSnapshot) {
        showToast();
        return;
      }

      if (attempt < 40) {
        setTimeout(() => {
          waitForCartUpdate(previousSnapshot, requestId, attempt + 1);
        }, 100);
      }
    }

    document.addEventListener(
      'click',
      (event) => {
        const addButton = event.target.closest(addButtonSelector);

        if (!addButton || !mobileQuery.matches) return;

        const previousSnapshot = getCartSnapshot();
        const requestId = ++pendingRequest;

        setTimeout(() => {
          waitForCartUpdate(previousSnapshot, requestId);
        }, 100);
      },
      true,
    );
  })();
  (function () {
    function updateC7LoginIconState() {
      document.querySelectorAll('#c7-login').forEach(function (login) {
        var controls = login.querySelectorAll(':scope > a, :scope > button');
        var text = (login.textContent || '').toLowerCase();

        var looksLoggedIn = controls.length > 1 || text.includes('account') || text.includes('profile') || text.includes('logout') || text.includes('log out') || text.includes('my account');

        var looksLoggedOut = text.includes('login') || text.includes('log in') || text.includes('sign in');

        login.setAttribute('data-c7-login-state', looksLoggedIn && !looksLoggedOut ? 'logged-in' : 'logged-out');
      });
    }

    updateC7LoginIconState();

    var observer = new MutationObserver(updateC7LoginIconState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  })();

/* ========================================
     Carrick profile + login layout
     Runs site-wide, guarded by DOM presence,
     so it survives C7's client-side view swaps
  ======================================== */

  (() => {
    function wrapCarrickAccountHeader() {
      const section = document.querySelector('#c7-content > section');
      if (!section || section.querySelector(':scope > .carrick-account-header')) return;

      const title = section.querySelector(':scope > h1');
      const menu = section.querySelector(':scope > .c7-account-menu');
      if (!title || !menu) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'carrick-account-header';
      section.insertBefore(wrapper, title);
      wrapper.appendChild(title);
      wrapper.appendChild(menu);
    }

     function wrapCarrickDashboardIntro() {
      const dashboard = document.querySelector('.c7-account__dashboard');
      if (!dashboard || dashboard.querySelector(':scope > .carrick-dashboard-intro')) return;

      const heading = dashboard.querySelector(':scope > h2');
      const message = dashboard.querySelector(':scope > .c7-account__dashboard__message');
      if (!heading || !message) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'carrick-dashboard-intro';
      dashboard.insertBefore(wrapper, heading);
      wrapper.appendChild(heading);
      wrapper.appendChild(message);
    }

    function groupCarrickLoginMessages() {
      const section = document.querySelector('#c7-content > section');
      const security = document.querySelector('#c7-content .c7-message--login-security');
      const questions = document.querySelector('#c7-content .c7-message--login-questions');
      if (!section || !security || !questions) return;

      let group = section.querySelector(':scope > .carrick-login-messages');
      if (!group) {
        group = document.createElement('div');
        group.className = 'carrick-login-messages';
        section.appendChild(group);
      }
      if (security.parentElement !== group) group.appendChild(security);
      if (questions.parentElement !== group) group.appendChild(questions);
    }

    function markClubJoinButton() {
      document.querySelectorAll('.c7-account-tile').forEach((tile) => {
        const heading = tile.querySelector(':scope > h3');
        if (!heading || !/club/i.test(heading.textContent || '')) return;

        if (!tile.classList.contains('carrick-club-tile')) {
          tile.classList.add('carrick-club-tile');
        }

        const link = [...tile.querySelectorAll('a[class*="button"], button[class*="button"]')].find(
          (el) => !el.closest('.carrick-tile-row'),
        );
        if (!link) return;

        if (!link.classList.contains('carrick-club-join')) {
          link.classList.add('carrick-club-join');
        }

        if (link.textContent.trim() !== 'JOIN A CLUB') {
          link.textContent = 'JOIN A CLUB';
        }
      });
    }

    const ADDRESS_COUNTRIES = [
      'New Zealand',
      'Australia',
      'United States',
      'United Kingdom',
      'Canada',
    ];

    function splitConcatenatedAddressSegment(text) {
      return text
        .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=\d)/)
        .map((part) => part.trim())
        .filter(Boolean);
    }

    function parseAddressDetailLines(rawText) {
      let text = rawText.replace(/\s+/g, ' ').trim();
      if (!text) return [];

      let isDefault = false;
      if (/\(Default\)/i.test(text)) {
        isDefault = true;
        text = text.replace(/\s*\(Default\)\s*/gi, ' ').trim();
      }

      let phone = '';
      const phoneMatch = text.match(/Phone:\s*(.+)$/i);
      if (phoneMatch) {
        phone = `Phone: ${phoneMatch[1].trim()}`;
        text = text.slice(0, phoneMatch.index).trim();
      }

      let country = '';
      for (const countryName of ADDRESS_COUNTRIES) {
        if (text.endsWith(countryName)) {
          country = countryName;
          text = text.slice(0, -countryName.length).trim();
          break;
        }
      }

      let postal = '';
      const postalMatch = text.match(/(\d{4,10})$/);
      if (postalMatch) {
        postal = postalMatch[1];
        text = text.slice(0, postalMatch.index).trim();
      }

      const lines = splitConcatenatedAddressSegment(text);

      if (postal && lines.length) {
        lines[lines.length - 1] = `${lines[lines.length - 1]} ${postal}`;
      } else if (postal) {
        lines.push(postal);
      }

      if (country) lines.push(country);
      if (phone) lines.push(phone);
      if (isDefault) lines.push('(Default)');

      return lines;
    }

    function collectAddressDetailText(details) {
      let text = '';

      details.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
          text += '\n';
          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'EM') {
          text += `\n${node.textContent.trim()}\n`;
          return;
        }

        text += (node.textContent || '').trim();
      });

      return text
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .trim();
    }

    function formatAddressDetailsText(details) {
      if (details.dataset.carrickFormatted === 'true') return;

      const rawText = collectAddressDetailText(details);
      if (!rawText) return;

      let lines = rawText.includes('\n')
        ? rawText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : [];

      if (lines.length <= 1) {
        lines = parseAddressDetailLines(rawText);
      } else {
        lines = lines.flatMap((line) =>
          /(?<=[a-z])(?=[A-Z])/.test(line) && line.length > 24
            ? parseAddressDetailLines(line)
            : [line],
        );
      }

      if (!lines.length) return;

      details.textContent = '';
      details.dataset.carrickFormatted = 'true';

      lines.forEach((line) => {
        if (/^\(Default\)$/i.test(line)) {
          const defaultLine = document.createElement('em');
          defaultLine.textContent = '(Default)';
          details.appendChild(defaultLine);
          return;
        }

        const addressLine = document.createElement('span');
        addressLine.className = 'carrick-list-tile__line';
        addressLine.textContent = line;
        details.appendChild(addressLine);
      });
    }

    function formatCreditCardDetailsText(details) {
      if (details.dataset.carrickFormatted === 'true') return;

      const rawText = details.textContent.replace(/\s+/g, ' ').trim();
      const endingMatch = rawText.match(/Card ending in\s*(\d{4})/i);
      if (!endingMatch) return;

      const expMatch = rawText.match(/Exp\.?\s*(\d{1,2})\/(\d{2,4})/i);
      const isDefault = /\(Default\)/i.test(rawText);

      details.textContent = '';
      details.dataset.carrickFormatted = 'true';

      const endingLabel = document.createElement('span');
      endingLabel.className =
        'carrick-credit-card__line carrick-credit-card__line--ending-label';
      endingLabel.textContent = 'Card ending in';
      details.appendChild(endingLabel);

      const endingNumber = document.createElement('span');
      endingNumber.className = 'carrick-credit-card__line';
      endingNumber.textContent = endingMatch[1];
      details.appendChild(endingNumber);

      if (expMatch) {
        const month = expMatch[1].padStart(2, '0');
        const year = expMatch[2].slice(-2);
        const expLine = document.createElement('span');
        expLine.className = 'carrick-credit-card__line';
        expLine.textContent = `Exp ${month}/${year}`;
        details.appendChild(expLine);
      }

      if (isDefault) {
        const defaultLine = document.createElement('em');
        defaultLine.textContent = '(Default)';
        details.appendChild(defaultLine);
      }
    }

    function structureCreditCardTile() {
      document.querySelectorAll('.c7-account-tile').forEach((tile) => {
        const heading = tile.querySelector(':scope > h3');
        if (!heading || !/credit card/i.test(heading.textContent || '')) return;
        if (tile.querySelector(':scope .carrick-tile-row--credit')) return;

        const section = tile.querySelector(':scope > .c7-account-tile__section');
        if (!section) return;

        const existingRow = section.querySelector(':scope > .carrick-tile-row');
        if (existingRow) {
          const existingLink = existingRow.querySelector(
            'a[class*="button"], button[class*="button"]',
          );
          const existingContent = existingRow.querySelector('.carrick-tile-row__content');
          if (existingContent) {
            while (existingContent.firstChild) {
              section.insertBefore(existingContent.firstChild, existingRow);
            }
          }
          if (existingLink && existingLink.parentElement === existingRow) {
            section.insertBefore(existingLink, existingRow);
          }
          existingRow.remove();
        }

        const link = section.querySelector(
          ':scope a[class*="button"], :scope button[class*="button"]',
        );
        if (!link) return;

        const nodes = [...section.childNodes].filter(
          (node) =>
            node !== link &&
            (node.nodeType === Node.ELEMENT_NODE ||
              (node.nodeType === Node.TEXT_NODE && node.textContent.trim())),
        );

        while (section.firstChild) {
          section.removeChild(section.firstChild);
        }

        const row = document.createElement('div');
        row.className = 'carrick-tile-row carrick-tile-row--credit';

        const body = document.createElement('div');
        body.className = 'carrick-credit-card__body';

        const brand = document.createElement('div');
        brand.className = 'carrick-credit-card__brand';

        const details = document.createElement('div');
        details.className = 'carrick-credit-card__details';

        nodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
            brand.appendChild(node);
            return;
          }

          if (
            node.nodeType === Node.ELEMENT_NODE &&
            /^(STRONG|SPAN)$/i.test(node.tagName) &&
            /visa|mastercard|amex|discover/i.test(node.textContent || '')
          ) {
            brand.appendChild(node);
            return;
          }

          details.appendChild(node);
        });

        formatCreditCardDetailsText(details);

        if (brand.childNodes.length) body.appendChild(brand);
        if (details.childNodes.length) body.appendChild(details);

        row.appendChild(body);
        row.appendChild(link);
        section.appendChild(row);

        setEditLabel(link);
        tile.classList.add('carrick-credit-card-tile');
      });
    }

    function setEditLabel(link) {
      if (link.textContent.trim() !== 'EDIT') {
        link.textContent = 'EDIT';
      }
    }

    function absorbTileActionLink(row, link, boundary) {
      const linkWrapper = link.parentElement;
      row.appendChild(link);
      if (
        linkWrapper &&
        linkWrapper !== boundary &&
        linkWrapper !== row &&
        !linkWrapper.textContent.trim() &&
        !linkWrapper.querySelector('img, input, iframe, svg')
      ) {
        linkWrapper.remove();
      }
    }

    function pruneEmptyTileSectionNodes(section) {
      section.querySelectorAll(':scope > p').forEach((paragraph) => {
        if (
          !paragraph.textContent.trim() &&
          !paragraph.querySelector('img, input, iframe, svg')
        ) {
          paragraph.remove();
        }
      });

      [...section.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
          node.remove();
        }
      });

      while (section.lastChild) {
        const trailing = section.lastChild;
        if (trailing.nodeType === Node.TEXT_NODE && !trailing.textContent.trim()) {
          trailing.remove();
          continue;
        }
        if (trailing.nodeType === Node.ELEMENT_NODE && trailing.tagName === 'BR') {
          trailing.remove();
          continue;
        }
        break;
      }
    }

    function structureProfileSection(section) {
      if (section.querySelector(':scope > .carrick-tile-row')) return;

      const link = section.querySelector(':scope a[class*="button"]');
      if (!link) return;

      const strong = section.querySelector(':scope > strong');
      if (strong) {
        const row = document.createElement('div');
        row.className = 'carrick-tile-row';
        section.insertBefore(row, strong);
        row.appendChild(strong);
        absorbTileActionLink(row, link, section);
        setEditLabel(link);

        const details = document.createElement('div');
        details.className = 'carrick-profile-details';
        while (row.nextSibling) {
          details.appendChild(row.nextSibling);
        }
        if (details.childNodes.length) {
          section.appendChild(details);
        }
        pruneEmptyTileSectionNodes(section);
        return;
      }

      const row = document.createElement('div');
      row.className = 'carrick-tile-row carrick-tile-row--password';
      const content = document.createElement('div');
      content.className = 'carrick-tile-row__content';
      while (section.firstChild && section.firstChild !== link) {
        content.appendChild(section.firstChild);
      }
      row.appendChild(content);
      absorbTileActionLink(row, link, section);
      section.appendChild(row);
      setEditLabel(link);
      pruneEmptyTileSectionNodes(section);
    }

    function structureProfileTile() {
      document.querySelectorAll('.c7-account-tile').forEach((tile) => {
        const heading = tile.querySelector(':scope > h3');
        if (!heading || !/profile/i.test(heading.textContent || '')) return;
        if (tile.dataset.carrickProfileReady === 'true') return;

        const sections = [...tile.querySelectorAll(':scope > .c7-account-tile__section')];
        if (!sections.length) return;

        if (sections.length >= 2) {
          sections.forEach(structureProfileSection);
          tile.dataset.carrickProfileReady = 'true';
          return;
        }

        const section = sections[0];
        const links = [...section.querySelectorAll(':scope > a[class*="button"]')];
        if (links.length < 2) {
          structureProfileSection(section);
          tile.dataset.carrickProfileReady = 'true';
          return;
        }

        [...section.querySelectorAll(':scope > .carrick-tile-row, :scope > .carrick-profile-details')].forEach((wrapper) => {
          while (wrapper.firstChild) {
            section.insertBefore(wrapper.firstChild, wrapper);
          }
          wrapper.remove();
        });

        const nodes = [...section.childNodes].filter(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE ||
            (node.nodeType === Node.TEXT_NODE && node.textContent.trim()),
        );
        const strong = section.querySelector(':scope > strong');
        const accountLink = links[0];
        const passwordLink = links[1];
        const accountLinkIdx = nodes.indexOf(accountLink);
        const passwordLinkIdx = nodes.indexOf(passwordLink);

        while (section.firstChild) {
          section.removeChild(section.firstChild);
        }

        if (strong) {
          const nameRow = document.createElement('div');
          nameRow.className = 'carrick-tile-row';
          nameRow.appendChild(strong);
          nameRow.appendChild(accountLink);
          setEditLabel(accountLink);
          section.appendChild(nameRow);

          const details = document.createElement('div');
          details.className = 'carrick-profile-details';
          const strongIdx = nodes.indexOf(strong);
          for (let i = strongIdx + 1; i < accountLinkIdx; i += 1) {
            details.appendChild(nodes[i]);
          }
          if (details.childNodes.length) {
            section.appendChild(details);
          }
        }

        const passwordRow = document.createElement('div');
        passwordRow.className = 'carrick-tile-row carrick-tile-row--password';
        const passwordContent = document.createElement('div');
        passwordContent.className = 'carrick-tile-row__content';
        for (let i = accountLinkIdx + 1; i < passwordLinkIdx; i += 1) {
          passwordContent.appendChild(nodes[i]);
        }
        passwordRow.appendChild(passwordContent);
        passwordRow.appendChild(passwordLink);
        setEditLabel(passwordLink);
        section.appendChild(passwordRow);

        tile.dataset.carrickProfileReady = 'true';
      });
    }

    function getSubpageHeading(block) {
      return (
        block.querySelector(':scope > h2') ||
        block.querySelector(':scope > .carrick-page-intro > h2')
      );
    }

    function wrapAccountSubpageIntro(block, includeAddRow) {
      const heading = getSubpageHeading(block);
      if (!heading) return;

      let intro = block.querySelector(':scope > .carrick-page-intro');
      if (!intro) {
        intro = document.createElement('div');
        intro.className = 'carrick-page-intro';
        block.insertBefore(intro, heading);
      }

      if (heading.parentElement !== intro) {
        intro.appendChild(heading);
      }

      const addRow = block.querySelector(':scope > .c7-account-row--add');
      if (includeAddRow && addRow) {
        if (addRow.parentElement !== intro) {
          intro.appendChild(addRow);
        }
      } else if (addRow && addRow.parentElement === intro) {
        block.appendChild(addRow);
      }
    }

    function structureAddressBookTile(tile) {
      if (tile.dataset.carrickListTileReady === 'true') return;
      if (tile.querySelector(':scope > .carrick-tile-row')) {
        tile.dataset.carrickListTileReady = 'true';
        return;
      }

      const link = tile.querySelector('a[class*="button"], button[class*="button"]');
      const strong = tile.querySelector(':scope > strong');
      if (!link || !strong) return;

      const row = document.createElement('div');
      row.className = 'carrick-tile-row';
      row.appendChild(strong);
      row.appendChild(link);
      setEditLabel(link);

      const details = document.createElement('div');
      details.className = 'carrick-list-tile__details';

      [...tile.childNodes].forEach((node) => {
        if (node === strong || node === link) return;
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') return;
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        details.appendChild(node);
      });

      tile.textContent = '';
      tile.appendChild(row);
      if (details.childNodes.length) {
        formatAddressDetailsText(details);
        tile.appendChild(details);
      }
      tile.dataset.carrickListTileReady = 'true';
    }

    function buildCreditCardRow(nodes, link) {
      const row = document.createElement('div');
      row.className = 'carrick-tile-row carrick-tile-row--credit';

      const body = document.createElement('div');
      body.className = 'carrick-credit-card__body';

      const brand = document.createElement('div');
      brand.className = 'carrick-credit-card__brand';

      const details = document.createElement('div');
      details.className = 'carrick-credit-card__details';

      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
          brand.appendChild(node);
          return;
        }

        if (
          node.nodeType === Node.ELEMENT_NODE &&
          /^(STRONG|SPAN)$/i.test(node.tagName) &&
          /visa|mastercard|amex|discover/i.test(node.textContent || '')
        ) {
          brand.appendChild(node);
          return;
        }

        details.appendChild(node);
      });

      formatCreditCardDetailsText(details);

      if (brand.childNodes.length) body.appendChild(brand);
      if (details.childNodes.length) body.appendChild(details);

      row.appendChild(body);
      row.appendChild(link);
      return row;
    }

    function structureCreditCardListTile(tile) {
      if (tile.dataset.carrickListTileReady === 'true') return;
      if (tile.querySelector(':scope .carrick-tile-row--credit')) {
        tile.dataset.carrickListTileReady = 'true';
        return;
      }

      const link = tile.querySelector('a[class*="button"], button[class*="button"]');
      if (!link) return;

      const nodes = [...tile.childNodes].filter(
        (node) =>
          node !== link &&
          (node.nodeType === Node.ELEMENT_NODE ||
            (node.nodeType === Node.TEXT_NODE && node.textContent.trim())),
      );

      tile.textContent = '';
      tile.appendChild(buildCreditCardRow(nodes, link));
      setEditLabel(link);
      tile.classList.add('carrick-credit-card-tile');
      tile.dataset.carrickListTileReady = 'true';
    }

    function setSubpageAddLabel(link, label) {
      if (!link) return;
      link.classList.add('carrick-subpage-add');
      if (link.textContent.trim().toUpperCase() !== label) {
        link.textContent = label;
      }
    }

    function structureClubsPage() {
      const block = document.querySelector('.c7-account__clubs');
      if (!block) return;

      const heading = getSubpageHeading(block);
      const isClubsPage =
        heading && /^\s*club memberships\s*$/i.test(heading.textContent || '');

      if (!isClubsPage) {
        block.classList.remove(
          'carrick-account-subpage',
          'carrick-clubs-page',
          'carrick-clubs-page--empty',
        );
        block.querySelector(':scope > .c7-account__dashboard__message.carrick-clubs-empty')?.remove();
        return;
      }

      block.classList.add('carrick-account-subpage', 'carrick-clubs-page');

      const membershipRows = [
        ...block.querySelectorAll(':scope > .c7-account-row:not(.c7-account-row--add)'),
      ];
      const hasMemberships = membershipRows.some((row) => row.querySelector('.c7-account-tile'));

      wrapAccountSubpageIntro(block, hasMemberships);

      const addRow = block.querySelector(':scope > .c7-account-row--add');
      const addLink = addRow?.querySelector('a[class*="button"], button[class*="button"]');

      if (!hasMemberships) {
        block.classList.add('carrick-clubs-page--empty');

        let message = block.querySelector(':scope > .c7-account__dashboard__message.carrick-clubs-empty');
        if (!message) {
          message = document.createElement('div');
          message.className = 'c7-account__dashboard__message carrick-clubs-empty';
          const copy = document.createElement('p');
          copy.textContent = 'Join one of our exclusive experience club benefits today.';
          message.appendChild(copy);
          block.appendChild(message);
        }

        let joinLink = message.querySelector(':scope > a.carrick-clubs-join');
        if (!joinLink) {
          joinLink = addLink ? addLink.cloneNode(true) : document.createElement('a');
          joinLink.className = 'c7-button carrick-clubs-join';
          if (!joinLink.getAttribute('href') && addLink?.getAttribute('href')) {
            joinLink.href = addLink.getAttribute('href');
          }
          message.appendChild(joinLink);
        }

        joinLink.textContent = 'VIEW & JOIN CLUB MEMBERSHIP';
      } else {
        block.classList.remove('carrick-clubs-page--empty');
        block.querySelector(':scope > .c7-account__dashboard__message.carrick-clubs-empty')?.remove();
        setSubpageAddLabel(addLink, 'ADD A NEW CLUB MEMBERSHIP');
      }
    }

    function structureAddressBookPage() {
      const block = document.querySelector('.c7-account__address-book');
      if (!block) return;

      const heading = getSubpageHeading(block);
      const isAddressBook =
        heading && /^\s*address book\s*$/i.test(heading.textContent || '');

      if (!isAddressBook) {
        block.classList.remove('carrick-account-subpage', 'carrick-address-book-page');
        return;
      }

      block.classList.add('carrick-account-subpage', 'carrick-address-book-page');
      wrapAccountSubpageIntro(block, true);

      const addLink = block.querySelector(
        ':scope .c7-account-row--add a[class*="button"], :scope .c7-account-row--add button[class*="button"]',
      );
      setSubpageAddLabel(addLink, 'ADD A NEW ADDRESS');
      block.querySelectorAll('.c7-account-tile').forEach((tile) => {
        structureAddressBookTile(tile);
        const details = tile.querySelector(':scope > .carrick-list-tile__details');
        if (details) {
          formatAddressDetailsText(details);
        }
      });
    }

    function structureCreditCardsPage() {
      const block = document.querySelector('.c7-account__credit-cards');
      if (!block) return;

      const heading = getSubpageHeading(block);
      const isCreditCardsPage =
        heading && /^\s*credit cards\s*$/i.test(heading.textContent || '');

      if (!isCreditCardsPage) {
        block.classList.remove('carrick-account-subpage', 'carrick-credit-cards-page');
        return;
      }

      block.classList.add('carrick-account-subpage', 'carrick-credit-cards-page');
      wrapAccountSubpageIntro(block, true);

      const addLink = block.querySelector(
        ':scope .c7-account-row--add a[class*="button"], :scope .c7-account-row--add button[class*="button"]',
      );
      setSubpageAddLabel(addLink, 'ADD A NEW CARD');
      block.querySelectorAll('.c7-account-tile').forEach(structureCreditCardListTile);
    }

    function structureOrderHistoryPage() {
      const block = document.querySelector('.c7-account__order-history');
      if (!block) return;

      const heading = block.querySelector(':scope > h2');
      const isOrderHistory =
        heading && /^\s*order history\s*$/i.test(heading.textContent || '');

      if (!isOrderHistory) {
        delete block.dataset.carrickOrderHistoryReady;
        block.classList.remove('carrick-order-history-page');
        return;
      }

      block.classList.add('carrick-order-history-page');

      const message = block.querySelector(':scope > .c7-account__dashboard__message');
      if (!message) return;

      let shopLink = message.querySelector(':scope > a.carrick-order-history-shop');
      if (!shopLink) {
        shopLink = document.createElement('a');
        shopLink.href = '/shop';
        shopLink.className = 'c7-button carrick-order-history-shop';
        shopLink.textContent = 'VIEW SHOP';
        message.appendChild(shopLink);
      }

      block.dataset.carrickOrderHistoryReady = 'true';
    }

    function structureAccountInformationPage() {
      const block = document.querySelector('.c7-account__information');
      if (!block) return;

      const addressSection = block.querySelector('.c7-account__information__address');
      const passwordSection = block.querySelector('.c7-account__information__password');
      if (!addressSection || !passwordSection) {
        delete block.dataset.carrickInformationReady;
        return;
      }

      if (block.dataset.carrickInformationReady === 'true') return;

      let structured = false;

      const addressLink = addressSection.querySelector('a[class*="button"]');
      if (addressLink && !addressSection.querySelector(':scope > .carrick-tile-row')) {
        const addressLinkWrap = addressLink.closest('p');
        const addressRow = document.createElement('div');
        addressRow.className = 'carrick-tile-row';
        const addressDetails = document.createElement('div');
        addressDetails.className = 'carrick-account-info__details';

        [...addressSection.childNodes].forEach((node) => {
          if (node === addressLinkWrap || node === addressLink) return;
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'STRONG') return;
          if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
          addressDetails.appendChild(node);
        });

        if (addressDetails.childNodes.length) {
          addressRow.appendChild(addressDetails);
          addressRow.appendChild(addressLink);
          addressSection.textContent = '';
          addressSection.appendChild(addressRow);
          setEditLabel(addressLink);
          structured = true;
        }
      }

      const passwordLink = passwordSection.querySelector('a[class*="button"]');
      const passwordPara = passwordSection.querySelector('p');
      if (
        passwordLink &&
        passwordPara &&
        !passwordSection.querySelector(':scope > .carrick-tile-row')
      ) {
        const passwordRow = document.createElement('div');
        passwordRow.className = 'carrick-tile-row carrick-tile-row--password-info';
        const passwordContent = document.createElement('div');
        passwordContent.className = 'carrick-account-info__password';

        const passwordText = passwordPara.textContent.replace(/\s+/g, ' ').trim();
        const passwordMatch = passwordText.match(/^Password:\s*(.+)$/i);
        if (passwordMatch) {
          const label = document.createElement('span');
          label.className = 'carrick-account-info__label';
          label.textContent = 'Password';

          const value = document.createElement('span');
          value.className = 'carrick-account-info__value';
          value.textContent = passwordMatch[1];

          passwordContent.appendChild(label);
          passwordContent.appendChild(value);
        } else {
          passwordContent.textContent = passwordText;
        }

        passwordRow.appendChild(passwordContent);
        passwordRow.appendChild(passwordLink);
        passwordSection.textContent = '';
        passwordSection.appendChild(passwordRow);
        setEditLabel(passwordLink);
        structured = true;
      }

      if (structured) {
        block.dataset.carrickInformationReady = 'true';
      }
    }

    function wrapAccountTileActionRows() {
      document.querySelectorAll('.c7-account-tile__section').forEach((section) => {
        const tile = section.closest('.c7-account-tile');
        const heading = tile?.querySelector(':scope > h3');
        if (heading && (/profile/i.test(heading.textContent || '') || /credit card/i.test(heading.textContent || '') || /club/i.test(heading.textContent || ''))) return;

        if (section.querySelector(':scope > .carrick-tile-row')) {
          pruneEmptyTileSectionNodes(section);
          return;
        }

        const link = section.querySelector(':scope a[class*="button"], :scope button[class*="button"]');
        if (!link) return;

        const row = document.createElement('div');
        row.className = 'carrick-tile-row';

        const strong = section.querySelector(':scope > strong');
        if (strong) {
          section.insertBefore(row, strong);
          row.appendChild(strong);
          absorbTileActionLink(row, link, section);
        } else {
          const content = document.createElement('div');
          content.className = 'carrick-tile-row__content';
          while (section.firstChild && section.firstChild !== link) {
            content.appendChild(section.firstChild);
          }
          row.appendChild(content);
          absorbTileActionLink(row, link, section);
          section.appendChild(row);
        }

        pruneEmptyTileSectionNodes(section);

        if (/edit/i.test(link.textContent || '')) {
          setEditLabel(link);
        }
      });

      structureProfileTile();
      structureCreditCardTile();
    }

    function run() {
      wrapCarrickAccountHeader();
      wrapCarrickDashboardIntro();
      structureClubsPage();
      structureAddressBookPage();
      structureCreditCardsPage();
      structureOrderHistoryPage();
      structureAccountInformationPage();
      wrapAccountTileActionRows();
      markClubJoinButton();
      groupCarrickLoginMessages();
    }

    let observer;
    let runQueued = false;

    function queueRun() {
      if (runQueued) return;
      runQueued = true;
      requestAnimationFrame(() => {
        runQueued = false;
        observer.disconnect();
        try {
          run();
        } finally {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }

    function init() {
      run();
      observer = new MutationObserver(queueRun);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
