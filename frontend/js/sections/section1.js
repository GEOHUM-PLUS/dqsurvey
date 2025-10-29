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

// api exmaple for dataset submission
document.addEventListener("DOMContentLoaded", () => {
  initializePage("section1");
  // 🔴 Submit handler
  const submitBtn = document.getElementById("submitDataset");
  submitBtn?.addEventListener("click", async (e) => {
      console.log('button clicked');
    e.preventDefault();

    // Gather field values
    const title = document.getElementById("datasetTitle").value.trim();
    const evaluator = document.getElementById("evaluatorName").value.trim();
    const affiliation = document.getElementById("evaluatorOrg").value.trim();
    const data_processing_level =
      document.getElementById("dataprocessinglevel").value === "primary"
        ? "primary data"
        : "data product";
    const data_type = document.getElementById("dataType").value.trim();
    const evaluation_type =
      document.getElementById("evaluationType").value === "general-quality"
        ? "general data quality"
        : "use case specific";

    // evaluation_id (0 = general, 1 = use case)
    const evaluation_id = evaluation_type === "general data quality" ? 0 : 1;

    // Prepare request payload
    const payload = {
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      evaluation_id,
      evaluation_type,
    };

    console.log("📤 Sending payload:", payload);

    try {
      const response = await fetch("http://localhost:8020/dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Dataset saved successfully!");
        console.log(result);
      } else {
        alert("⚠️ Validation failed: " + (result.message || "Check input"));
        console.error(result);
      }
    } catch (error) {
      console.error("❌ Error connecting to backend:", error);
      alert("Failed to connect to server. Please check if backend is running.");
    }
  });
});

