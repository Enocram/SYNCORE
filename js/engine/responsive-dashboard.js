// ============================================================
// RESPONSIVE DASHBOARD – Colunas dinâmicas e lazy loading
// ============================================================

export function initResponsiveDashboard() {
  applyDashboardLayout();
  window.addEventListener('breakpointChange', () => applyDashboardLayout());
  observeDashboardWidgets();
}

function applyDashboardLayout() {
  const kpiGrid = document.querySelector('.kpi-grid');
  if (!kpiGrid) return;
  const width = window.innerWidth;
  
  if (width < 480) kpiGrid.classList.add('grid-1');
  else if (width < 768) kpiGrid.classList.add('grid-2');
  else if (width < 1024) kpiGrid.classList.add('grid-3');
  else if (width < 1440) kpiGrid.classList.add('grid-4');
  else kpiGrid.classList.add('grid-5');
}

function observeDashboardWidgets() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const widget = entry.target;
        if (widget.dataset.lazy === 'true') {
          // Carrega conteúdo dinâmico (ex: gráficos)
          widget.dataset.lazy = 'false';
          widget.classList.add('loaded');
        }
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.dashboard-section, .chart-box, .activity-card').forEach(el => {
    el.setAttribute('data-lazy', 'true');
    observer.observe(el);
  });
}