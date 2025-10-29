// sections/section1.js
import { DataManager } from '../core/datamanager.js';
import { initializePage } from '../core/init.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage('section1');

  const submitBtn = document.getElementById('submitForm');
  if (submitBtn) {
    submitBtn.addEventListener('click', e => {
      e.preventDefault();
      alert('Survey submitted successfully!');
      DataManager.clearAll();
      location.reload();
    });
  }
});


// sections/section1.js
import { DataManager } from "../core/dataManager.js";
import { initializePage } from "../core/init.js";

document.addEventListener("DOMContentLoaded", () => {
  initializePage("section1");

  const evalType = document.getElementById("evaluationType");
  const useCaseSection = document.getElementById("use-case-section");
  const dataProcessing = document.getElementById("dataprocessinglevel");
  const navConformance = document.getElementById("nav-conformance");

  const dataType = document.getElementById("dataType");
  const dataTypeOther = document.getElementById("datatype-other-container");

  // toggle Use-case vs General
  evalType?.addEventListener("change", () => {
    useCaseSection.style.display = evalType.value === "use-case-adequacy" ? "block" : "none";
    DataManager.save("section1", "basic", { evaluationType: evalType.value });
  });

  // toggle data type "Other"
  dataType?.addEventListener("change", () => {
    dataTypeOther.style.display = dataType.value === "other" ? "block" : "none";
    DataManager.save("section1", "basic", { dataType: dataType.value });
  });

  // 🧩 toggle Conformance section visibility
  dataProcessing?.addEventListener("change", () => {
    localStorage.setItem("dataProcessingLevel", dataProcessing.value);
    navConformance.style.display = dataProcessing.value === "primary" ? "none" : "block";
  });

  // 🧩 AOI selection logic
  const aoiType = document.getElementById("aoiType");
  const aoiDropdown = document.getElementById("aoi-dropdown");
  const aoiCoords = document.getElementById("aoi-coordinates");
  const aoiUpload = document.getElementById("aoi-upload");
  aoiType?.addEventListener("change", () => {
    [aoiDropdown, aoiCoords, aoiUpload].forEach(d => (d.style.display = "none"));
    if (aoiType.value === "dropdown") aoiDropdown.style.display = "block";
    if (aoiType.value === "coordinates") aoiCoords.style.display = "block";
    if (aoiType.value === "upload") aoiUpload.style.display = "block";
  });
});
