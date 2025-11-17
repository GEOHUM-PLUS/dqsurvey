// sections/section2.js
import { DataManager } from '../core/datamanager.js';
import { initializePage } from '../core/init.js';

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("section1_data"));
console.log(data);
  if (!data) return;

  document.getElementById("titlePreview").innerText = data.title;
  document.getElementById("evaluatorPreview").innerText = data.evaluator;
});



// document.addEventListener("DOMContentLoaded", () => {
//   initializePage('section2');

//   // Prefill fields if data exists
//   const section2Data = DataManager.get().section2?.descriptives || {};
//   Object.keys(section2Data).forEach((id) => {
//     const el = document.getElementById(id);
//     if (el) el.value = section2Data[id];
//   });

//   // // Listen to changes and save immediately
//   // document.querySelectorAll('input, select, textarea').forEach(el => {
//   //   el.addEventListener('change', () => {
//   //     DataManager.save('section2', 'descriptives', { [el.id]: el.value });
//   //   });
//   // });
//   // Generic listener for inputs, selects, textareas (except special checkboxes/radios)
// document.querySelectorAll('input, select, textarea').forEach(el => {
//   if (
//     el.classList.contains('access-check') ||
//     el.classList.contains('api-radio') ||
//     el.name === 'usageRights' ||
//     el.name === 'formatStandards'
//   ) return; // skip special inputs

//   el.addEventListener('change', () => {
//     DataManager.save('section2', 'descriptives', { [el.id]: el.value });
//   });
// });


// // Handle Access Restrictions checkboxes
// const accessChecks = document.querySelectorAll('.access-check');
// accessChecks.forEach(cb => {
//   cb.addEventListener('change', () => {
//     const selected = Array.from(accessChecks)
//       .filter(chk => chk.checked)
//       .map(chk => chk.value);
//     DataManager.save('section2', 'descriptives', { access_restrictions: selected.join(', ') });
//   });
// });

// // Handle API Availability radios
// const apiRadios = document.querySelectorAll('.api-radio');
// apiRadios.forEach(rb => {
//   rb.addEventListener('change', () => {
//     const selected = Array.from(apiRadios).find(r => r.checked)?.value || '';
//     DataManager.save('section2', 'descriptives', { api_availability: selected });
//   });
// });

// // Usage Rights radios
// const usageRadios = document.querySelectorAll('input[name="usageRights"]');
// usageRadios.forEach(rb => {
//   rb.addEventListener('change', () => {
//     const selected = Array.from(usageRadios).find(r => r.checked)?.value || '';
//     DataManager.save('section2', 'descriptives', { usage_rights: selected });
//   });
// });

// // Format Standards radios
// const formatRadios = document.querySelectorAll('input[name="formatStandards"]');
// formatRadios.forEach(rb => {
//   rb.addEventListener('change', () => {
//     const selected = Array.from(formatRadios).find(r => r.checked)?.value || '';
//     DataManager.save('section2', 'descriptives', { format_standards: selected });
//   });
// });  // Handle Next button click
//   const nextBtn = document.getElementById("nextSection2");
//   nextBtn?.addEventListener('click', (e) => {
//     e.preventDefault();

//     // Optional: validate required fields here

//     // All data is already saved in localStorage
//     console.log("Section 2 saved locally:", DataManager.get().section2);
// localStorage.setItem("section1_data", JSON.stringify(payload));
//     // Go to next section
//     window.location.href = "section3.html";
//   });
// });




document.addEventListener("DOMContentLoaded", () => {
  initializePage('section2');

  // Prefill fields from DataManager
  const section2Data = DataManager.get().section2?.descriptives || {};
  Object.keys(section2Data).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === "checkbox") el.checked = section2Data[id] === el.value;
      else if (el.type === "radio") el.checked = section2Data[id] === el.value;
      else el.value = section2Data[id];
    }
  });

  // Build payload on Next button click
  const nextBtn = document.getElementById("nextSection2");
  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    // Metadata Documentation
    const identifier = document.getElementById("identifier").value.trim();
    const dataset_description = document.getElementById("datasetDescription").value.trim();
    const dataset_description_link = document.getElementById("datasetDescriptionLink").value.trim();
    const language = document.getElementById("languageDropdown").value === "other"
      ? document.getElementById("languageOtherInput").value.trim()
      : document.getElementById("languageDropdown").value;
    const metadata_documentation = document.getElementById("metadataDoc").value.trim();
    const metadata_standards = document.getElementById("metadata-conformance").value;
    const score_metadata_documentation = document.querySelector('.score-field[data-scoregroup="descriptives"]').value;

    // Accessibility
    const access_restrictions = Array.from(document.querySelectorAll('.access-check'))
      .filter(cb => cb.checked).map(cb => cb.value).join(", ");
    const api_availability = Array.from(document.querySelectorAll('.api-radio'))
      .find(rb => rb.checked)?.value || "";
    const usage_rights = Array.from(document.querySelectorAll('input[name="usageRights"]'))
      .find(rb => rb.checked)?.value || "";
    const data_format = document.getElementById("dataFormat").value;
    const format_standards = Array.from(document.querySelectorAll('input[name="formatStandards"]'))
      .find(rb => rb.checked)?.value || "";
    const score_accessibility = document.querySelector('.score-field[data-scoregroup="accessibility"]').value;

    // Spatial Accuracy
    const crs = document.getElementById("crsSelect").value;
    const positional_accuracy = document.getElementById("positionalAccuracy").value.trim();
    const spatial_uncertainty = document.getElementById("spatialUncertainty").value.trim();
    const score_spatial_accuracy = document.querySelector('.score-field[data-scoregroup="spatial-accuracy"]').value;

    // Build payload similar to section1
    const payload = {
      identifier,
      dataset_description,
      dataset_description_link,
      language,
      metadata_documentation,
      metadata_standards,
      score_metadata_documentation,

      access_restrictions,
      api_availability,
      usage_rights,
      data_format,
      format_standards,
      score_accessibility,

      crs,
      positional_accuracy,
      spatial_uncertainty,
      score_spatial_accuracy
    };

    // Save to DataManager and localStorage
    DataManager.save("section2", "descriptives", payload);
    localStorage.setItem("section2_data", JSON.stringify(payload));

    console.log("📤 Section 2 payload:", payload);

    // Go to next section
    window.location.href = "section3.html";
  });
});
