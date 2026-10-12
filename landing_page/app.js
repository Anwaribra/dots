/**
 * DOTS — Interactive Logic
 * Fully deterministic front-end simulation, accessible accordion,
 * waitlist prototype validation, and responsive navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSimulation();
  initFaqAccordion();
  initWaitlistValidation();
});

/* ==========================================================================
   1. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    navMenu.classList.toggle('mobile-open');
  });

  // Close mobile drawer when an anchor link is clicked
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('mobile-open');
    });
  });
}

/* ==========================================================================
   2. INTERACTIVE PRODUCT DEMONSTRATION ("A plan that adapts")
   ========================================================================== */
function initSimulation() {
  const triggerBtn = document.getElementById('demo-trigger-btn');
  const approveBtn = document.getElementById('demo-approve-btn');
  const resetBtn = document.getElementById('demo-reset-btn');
  const statusPill = document.getElementById('demo-status-pill');
  const announcer = document.getElementById('demo-announcer');

  // Interactive Block Elements
  const urgentItem = document.getElementById('sim-item-urgent');
  const researchItem = document.getElementById('sim-item-research');
  const adminItem = document.getElementById('sim-item-admin');
  const researchTime = document.getElementById('sim-time-research');
  const adminTime = document.getElementById('sim-time-admin');
  const researchBadge = document.getElementById('sim-badge-research');
  const adminBadge = document.getElementById('sim-badge-admin');
  const researchMeta = document.getElementById('sim-meta-research');
  const adminMeta = document.getElementById('sim-meta-admin');
  const urgentBadge = document.getElementById('sim-badge-urgent');

  // Sidebar Elements
  const reasonLabel = document.getElementById('reasoning-label');
  const reasonDesc = document.getElementById('reasoning-desc');
  const reasonPoints = document.getElementById('reasoning-points');

  if (!triggerBtn || !approveBtn || !resetBtn) return;

  // State: 'initial' | 'proposed' | 'approved'
  let currentState = 'initial';

  function renderState(state) {
    currentState = state;

    if (state === 'initial') {
      // Buttons
      triggerBtn.disabled = false;
      approveBtn.disabled = true;
      resetBtn.disabled = false;

      // Status Tag
      statusPill.textContent = 'Active Plan';
      statusPill.className = 'board-status-tag status-active-plan';

      // Blocks
      urgentItem.style.display = 'none';
      urgentItem.className = 'sim-block sim-proposed-insert';

      researchItem.style.display = 'grid';
      researchItem.className = 'sim-block sim-flexible';
      researchTime.textContent = '12:30 – 14:30';
      researchBadge.textContent = 'Flexible';
      researchBadge.className = 'badge badge-neutral';
      researchMeta.textContent = 'Flexible research session (2h)';

      adminItem.className = 'sim-block sim-flexible';
      adminTime.textContent = '15:00 – 16:00';
      adminBadge.textContent = 'Routine';
      adminBadge.className = 'badge badge-neutral';
      adminMeta.textContent = 'Flexible routine (60m)';

      // Sidebar
      reasonLabel.textContent = 'Engine State: Baseline Stable';
      reasonLabel.style.color = 'var(--lime)';
      reasonDesc.textContent = 'Schedule is balanced. All tasks fit comfortably within today\'s available capacity with reality buffers intact.';
      reasonPoints.innerHTML = `
        <li>Client Review Call is locked and protected.</li>
        <li>Interview synthesis scheduled for afternoon slot.</li>
        <li>Click "Simulate Urgent Task" to test how Dots adapts.</li>
      `;

      announcer.textContent = 'Baseline plan restored.';
    } else if (state === 'proposed') {
      // Buttons
      triggerBtn.disabled = true;
      approveBtn.disabled = false;
      resetBtn.disabled = false;

      // Status Tag
      statusPill.textContent = 'Proposed Plan';
      statusPill.className = 'board-status-tag status-proposed-plan';

      // Blocks
      urgentItem.style.display = 'grid';
      urgentItem.className = 'sim-block sim-proposed-insert';
      urgentBadge.textContent = 'Proposed';
      urgentBadge.className = 'badge badge-lime';

      researchItem.style.display = 'grid';
      researchItem.className = 'sim-block sim-proposed-move';
      researchTime.textContent = 'Tomorrow (09:30)';
      researchBadge.textContent = 'Deferred';
      researchBadge.className = 'badge badge-neutral';
      researchMeta.textContent = 'Shifted to open morning window tomorrow';

      adminItem.className = 'sim-block sim-proposed-shorten';
      adminTime.textContent = '15:00 – 15:30';
      adminBadge.textContent = 'Shortened (-30m)';
      adminBadge.className = 'badge badge-lime';
      adminMeta.textContent = 'Trimmed to 30m to preserve evening commitments';

      // Sidebar
      reasonLabel.textContent = 'Engine State: Adjustment Proposed';
      reasonLabel.style.color = 'var(--lime)';
      reasonDesc.textContent = 'Urgent 2h request accommodated. Fixed meetings remain untouched. Flexible interview synthesis shifted to tomorrow morning; admin trimmed by 30m.';
      reasonPoints.innerHTML = `
        <li><strong>Inserted:</strong> Urgent Board Deck Revisions (12:30–14:30).</li>
        <li><strong>Deferred:</strong> User Interview Synthesis to Wednesday morning.</li>
        <li><strong>Shortened:</strong> Admin session reduced from 60m to 30m.</li>
        <li><strong>Protected:</strong> Client Review & Standup untouched.</li>
      `;

      announcer.textContent = 'Urgent task arrived. Dots proposes shifting research block to tomorrow and trimming admin by 30 minutes.';
    } else if (state === 'approved') {
      // Buttons
      triggerBtn.disabled = true;
      approveBtn.disabled = true;
      resetBtn.disabled = false;

      // Status Tag
      statusPill.textContent = 'Approved Plan';
      statusPill.className = 'board-status-tag status-approved-plan';

      // Blocks
      urgentItem.style.display = 'grid';
      urgentItem.className = 'sim-block sim-approved-item';
      urgentBadge.textContent = 'Locked';
      urgentBadge.className = 'badge badge-dark-lime';

      researchItem.style.display = 'none'; // Deferred away from today's view

      adminItem.className = 'sim-block sim-flexible';
      adminTime.textContent = '15:00 – 15:30';
      adminBadge.textContent = '30m Focus';
      adminBadge.className = 'badge badge-neutral';
      adminMeta.textContent = 'Active adjusted focus session';

      // Sidebar
      reasonLabel.textContent = 'Engine State: Changes Locked';
      reasonLabel.style.color = '#A39BFF';
      reasonDesc.textContent = 'Plan updated and locked for today. No data sent to external servers (local demo simulation).';
      reasonPoints.innerHTML = `
        <li>Urgent Board Deck Revisions confirmed for 12:30–14:30.</li>
        <li>Interview Synthesis queued in tomorrow’s plan.</li>
        <li>Reality buffer preserved for late afternoon.</li>
      `;

      announcer.textContent = 'Schedule adjustments approved and locked into today\'s plan.';
    }
  }

  // Event Listeners
  triggerBtn.addEventListener('click', () => renderState('proposed'));
  approveBtn.addEventListener('click', () => renderState('approved'));
  resetBtn.addEventListener('click', () => renderState('initial'));
}

/* ==========================================================================
   3. ACCESSIBLE FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      // Toggle current panel
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) {
        panel.setAttribute('data-open', String(!isExpanded));
      }
    });

    // Keyboard navigation (Enter / Space standard)
    trigger.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}

/* ==========================================================================
   4. WAITLIST VALIDATION & PROTOTYPE DISCLAIMER
   ========================================================================== */
function initWaitlistValidation() {
  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('waitlist-email');
  const errorMsg = document.getElementById('waitlist-feedback-error');
  const protoMsg = document.getElementById('waitlist-feedback-proto');

  if (!form || !emailInput || !errorMsg || !protoMsg) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = emailInput.value.trim();

    // Reset feedback
    errorMsg.style.display = 'none';
    protoMsg.style.display = 'none';
    emailInput.removeAttribute('aria-invalid');

    if (!value || !emailRegex.test(value)) {
      emailInput.setAttribute('aria-invalid', 'true');
      errorMsg.style.display = 'block';
      emailInput.focus();
      return;
    }

    // Format is valid -> Show honest prototype notification
    // As per prompt: Never submit, store, or claim to have registered an email.
    protoMsg.style.display = 'block';
  });

  // Clear errors upon typing
  emailInput.addEventListener('input', () => {
    if (emailInput.getAttribute('aria-invalid') === 'true') {
      emailInput.removeAttribute('aria-invalid');
      errorMsg.style.display = 'none';
    }
  });
}
