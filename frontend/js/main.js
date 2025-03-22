  tippy('[data-tippy-content]', {
    placement: 'bottom',
    theme: 'light-border'
  });

  // Initialize tooltips on buttons
  tippy('#calendarButton', {
    content: 'Remyan Calendar',
    placement: 'bottom',
    theme: 'light-border'
  });

  tippy('#sidebarButton', {
    content: 'Sidebar Menu',
    placement: 'left',
    theme: 'light-border'
  });

  // Initialize tooltips on sidebar menu items
  tippy('.menu-item a', {
    content(reference) {
      return reference.getAttribute('href').replace('pages/', '').replace('.html', '').replace(/-/g, ' ').toUpperCase();
    },
    placement: 'left',
    theme: 'light-border'
  });
