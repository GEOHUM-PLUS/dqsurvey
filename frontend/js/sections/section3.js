// sections/section3.js
import { DataManager } from '../core/datamanager.js';
import { initializePage } from '../core/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage('section3');

  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', () => {
      DataManager.save('section3', 'design', { [el.id]: el.value });
    });
  });
});
