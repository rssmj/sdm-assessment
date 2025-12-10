// Multi-select dropdown behaviour and basic form handling.
// Everything is wrapped in an IIFE to avoid leaking variables into the global scope.
(function () {
  // All multi-select dropdown widgets on the page.
  const dropdowns = Array.from(document.querySelectorAll('.multi-dropdown'));

  // Status bar at the bottom of the form (used for validation/info messages).
  const statusBar = document.getElementById('statusBar');

  /**
   * Close all open dropdown menus except an optional one to keep open.
   * Used both when clicking outside and when opening a different dropdown.
   */
  function closeAllDropdowns(except) {
    dropdowns.forEach((dd) => {
      if (dd !== except) {
        dd.classList.remove('open');
      }
    });
  }

  /**
   * Initialize a single multi-select dropdown:
   * - toggles the menu open/closed
   * - keeps a hidden input in sync with selected values
   * - updates the visible label with a joined list of selections
   */
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.multi-dropdown-toggle');
    const menu = dropdown.querySelector('.multi-dropdown-menu');
    const hidden = dropdown.querySelector('input[type="hidden"]');
    const placeholder = toggle.getAttribute('data-placeholder') || '';

    // Toggle open/close when clicking the main button.
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns(dropdown);
      dropdown.classList.toggle('open', !isOpen);
    });

    // When any checkbox in the menu changes, recompute the value + label.
    menu.addEventListener('change', () => {
      const checked = Array.from(
        menu.querySelectorAll('input[type="checkbox"]:checked')
      );
      const values = checked.map((c) => c.value);
      const label = values.length ? values.join(', ') : placeholder;

      // Update visible label and the hidden input (used by validation/payload).
      toggle.textContent = label || placeholder;
      hidden.value = values.join(', ');
    });
  });

  // Close any open dropdown when clicking anywhere outside.
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  /**
   * Collapsible section headers for the Application / Process cards.
   * Clicking the header toggles the corresponding body and updates the caret icon.
   */
  // document.querySelectorAll('.collapsible-header').forEach((header) => {
  //   const targetSelector = header.getAttribute('data-target');
  //   const target = document.querySelector(targetSelector);
  //   const icon = header.querySelector('.collapse-icon');

  //   if (!target) return;

  //   header.addEventListener('click', (e) => {
  //     // Ignore clicks on other buttons inside the header (e.g. future actions),
  //     // but allow clicks directly on the collapse icon itself.
  //     if (e.target.closest('button') && e.target !== icon) return;

  //     const isHidden = target.style.display === 'none';
  //     target.style.display = isHidden ? '' : 'none';
  //     icon.textContent = isHidden ? '▾' : '▸';
  //   });
  // });

  /**
   * Validate all fields marked with .required-field.
   * Adds .field-error to the field and its dropdown wrapper (if any),
   * and displays a single message in the status bar if anything is missing.
   */
  function validateRequired() {
    let valid = true;
    clearValidation();

    const requiredFields = document.querySelectorAll('.required-field');

    requiredFields.forEach((el) => {
      const value = (el.value || '').trim();
      if (!value) {
        valid = false;

        // Mark the raw field as invalid.
        el.classList.add('field-error');

        // If this required field is part of a multi-select, also mark the wrapper
        // so the toggle button border turns red.
        const wrapper = el.closest('.multi-dropdown');
        if (wrapper) {
          wrapper.classList.add('field-error');
        }
      }
    });

    if (!valid) {
      setStatus('Please complete all required fields before saving.', 'error');
    }

    return valid;
  }

  /**
   * Clear all .field-error markers from inputs and dropdowns.
   */
  function clearValidation() {
    document
      .querySelectorAll('.field-error')
      .forEach((el) => el.classList.remove('field-error'));
  }

  /**
   * Update the status bar text and visual style.
   * level: 'info' | 'error' | null
   */
  function setStatus(message, level) {
    if (!statusBar) return;

    statusBar.textContent = message || '';
    statusBar.classList.remove('info', 'error');

    if (level) {
      statusBar.classList.add(level);
    }
  }

  /**
   * Gather a nested payload object representing the current form values.
   * This is only logged to the console (no persistence) to show that the form
   * handles arbitrary / large input without errors.
   */
  function buildPayload() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const getHidden = (name) => {
      const el = document.querySelector(
        `.multi-dropdown input[type="hidden"][name="${name}"]`
      );
      return el ? el.value : '';
    };

    return {
      sheetType: getHidden('sheetType'),
      company: getHidden('company'),
      location: getHidden('location'),
      layout: getHidden('layout'),
      application: {
        equipmentId: getVal('equipmentId'),
        // NOTE: In the HTML the hidden field has id="equipmentType".
        // This getter uses 'equipmentTypeInput', so the payload field will
        // currently be empty unless the id is updated to match.
        equipmentType: getVal('equipmentTypeInput'),
        equipmentReference: getVal('equipmentReference'),
        department: getVal('department'),
        pipingDiagram: getVal('pipingDiagram'),
        tankId: getVal('tankId'),
      },
      process: {
        product: getVal('product'),
        chemicalMakeup: {
          constituents: getVal('constituents'),
          concentration: getVal('concentration'),
        },
        solidsByVolume: {
          min: getVal('solidsVolumeMin'),
          max: getVal('solidsVolumeMax'),
          normal: getVal('solidsVolumeNormal'),
        },
        solidsByWeight: {
          min: getVal('solidsWeightMin'),
          max: getVal('solidsWeightMax'),
          normal: getVal('solidsWeightNormal'),
        },
        dynamicViscosity: {
          min: getVal('viscosityMin'),
          max: getVal('viscosityMax'),
          normal: getVal('viscosityNormal'),
        },
        specificGravity: {
          min: getVal('sgMin'),
          max: getVal('sgMax'),
          normal: getVal('sgNormal'),
        },
      },
    };
  }

  /**
   * Reset all form inputs and dropdowns back to a clean state.
   * - Clears validation and status
   * - Clears all text inputs
   * - Resets dropdowns to placeholders, with defaults for sheetType/layout
   *   to match the reference UI.
   */
  function resetForm() {
    clearValidation();
    setStatus('', null);

    // Clear all text inputs (including very long / unusual values).
    document
      .querySelectorAll('input[type="text"]')
      .forEach((input) => (input.value = ''));

    // Reset each dropdown and re-apply default selections where appropriate.
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.multi-dropdown-toggle');
      const hidden = dropdown.querySelector('input[type="hidden"]');
      const menu = dropdown.querySelector('.multi-dropdown-menu');
      const placeholder = toggle.getAttribute('data-placeholder') || '';

      if (!toggle || !hidden || !menu) return;

      // Uncheck all items.
      menu
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));

      // Default sheet type: first option checked.
      if (dropdown.dataset.name === 'sheetType') {
        const first = menu.querySelector('input[type="checkbox"]');
        if (first) {
          first.checked = true;
          hidden.value = first.value;
          toggle.textContent = first.value;
          return;
        }
      }

      // Default layout: "4 Per Row" checked.
      if (dropdown.dataset.name === 'layout') {
        const layout4 = Array.from(
          menu.querySelectorAll('input[type="checkbox"]')
        ).find((cb) => cb.value === '4 Per Row');
        if (layout4) {
          layout4.checked = true;
          hidden.value = layout4.value;
          toggle.textContent = layout4.value;
          return;
        }
      }

      // All other dropdowns: no selection; show placeholder.
      hidden.value = '';
      toggle.textContent = placeholder;
    });
  }

  // Top-level toolbar buttons.
  const btnSave = document.getElementById('btnSave');
  const btnNew = document.getElementById('btnNew');
  const btnCancel = document.getElementById('btnCancel');

  /**
   * Save: validate required fields, then log payload to console.
   * This is a purely client-side "save" to satisfy the spec without a backend.
   */
  if (btnSave) {
    btnSave.addEventListener('click', (e) => {
      e.preventDefault();

      if (!validateRequired()) {
        return;
      }

      const payload = buildPayload();

      // Demonstrate that the form can handle large/unusual input
      // by logging the full object to the console without errors.
      console.log(
        'Form payload (simulated save). No data is persisted.',
        payload
      );

      setStatus(
        'Form validated locally (simulated save). Check console for payload.',
        'info'
      );
    });
  }

  /**
   * New: clear everything and show an informational status.
   */
  if (btnNew) {
    btnNew.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
      setStatus('Form cleared for a new entry.', 'info');
    });
  }

  /**
   * Cancel: same behavior as New — treat it as "reset current edits".
   */
  if (btnCancel) {
    btnCancel.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
      setStatus('Edits cancelled. Form reset.', 'info');
    });
  }

  // Initial state on page load.
  resetForm();
})();
