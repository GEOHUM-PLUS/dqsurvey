// sections/section2.js
import { DataManager } from '../core/datamanager.js';
import { initializePage } from '../core/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage('section2');

  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', () => {
      DataManager.save('section2', 'descriptives', { [el.id]: el.value });
    });
  });
});
