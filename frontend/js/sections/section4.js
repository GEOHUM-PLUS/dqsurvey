// sections/section4.js
import { DataManager } from '../core/dataManager.js';
import { initializePage } from '../core/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage('section4');

  const processingLevel = localStorage.getItem('dataProcessingLevel');
  const conformanceBlock = document.getElementById('conformance');

  if (processingLevel === 'primary' && conformanceBlock) {
    conformanceBlock.style.display = 'none';
  }

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
      DataManager.save('section4', 'conformance', { [el.id]: el.value });
    });
  });
});
