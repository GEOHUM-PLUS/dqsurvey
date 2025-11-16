// sections/section3.js
import { DataManager } from '../core/datamanager.js';
import { initializePage } from '../core/init.js';

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("section2_data"));
console.log("section 2 data in section 3: ",data);
  if (!data) return;

  document.getElementById("titlePreview").innerText = data.title;
  document.getElementById("evaluatorPreview").innerText = data.evaluator;
});


document.addEventListener('DOMContentLoaded', () => {
  initializePage('section3');

  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', () => {
      DataManager.save('section3', 'design', { [el.id]: el.value });
    });
  });
});
