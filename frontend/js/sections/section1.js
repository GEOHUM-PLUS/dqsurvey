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
    useCaseSection.style.display =
      evalType.value === "use-case-adequacy" ? "block" : "none";
    DataManager.save("section1", "basic", { evaluationType: evalType.value });
  });

  // toggle data type "Other"
  dataType?.addEventListener("change", () => {
    dataTypeOther.style.display = dataType.value === "other" ? "block" : "none";
    DataManager.save("section1", "basic", { dataType: dataType.value });
  });

  // toggle Conformance section
  dataProcessing?.addEventListener("change", () => {
    localStorage.setItem("dataProcessingLevel", dataProcessing.value);
    navConformance.style.display =
      dataProcessing.value === "primary" ? "none" : "block";
  });

  // AOI selection logic
  const aoiType = document.getElementById("aoiType");
  const aoiDropdown = document.getElementById("aoi-dropdown");
  const aoiCoords = document.getElementById("aoi-coordinates");
  const aoiUpload = document.getElementById("aoi-upload");

  aoiType?.addEventListener("change", () => {
    [aoiDropdown, aoiCoords, aoiUpload].forEach((d) => (d.style.display = "none"));
    if (aoiType.value === "dropdown") aoiDropdown.style.display = "block";
    if (aoiType.value === "coordinates") aoiCoords.style.display = "block";
    if (aoiType.value === "upload") aoiUpload.style.display = "block";
  });

    //----API SUBMISSION 
  const submitBtn = document.getElementById("Initial-info");

  submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Submit clicked");

    // Basic fields
    const title = document.getElementById("datasetTitle").value.trim();
    const evaluator = document.getElementById("evaluatorName").value.trim();
    const affiliation = document.getElementById("evaluatorOrg").value.trim();

    const data_processing_level =
      dataProcessing.value === "primary" ? "primary data" : "data product";

    let data_type = dataType.value;
    let other_data_type = null;

    if (data_type === "other") {
      other_data_type = document.getElementById("dataTypeOtherInput").value.trim();
    }

    const evaluation_type =
      evalType.value === "general-quality"
        ? "general data quality"
        : "use case specific";

    const evaluation_id = evaluation_type === "general data quality" ? 0 : 1;

    // ------------------------------
    // ⭐ Use-case specific fields ⭐
    // ------------------------------
    let use_case_description = null;
    let optimum_data_collection = null;
    let aoi_input_method = null;
    let aoi_coordinates = null;
    let aoi_file = null;
    let aoi_geographical_identifier = null;
    let other_requirements = null;

    if (evaluation_id === 1) {
      use_case_description = document.getElementById("useCaseDescription").value.trim();
      optimum_data_collection = document.getElementById("optimumDataCollection").value;

      // AOI
      const aoiTypeValue = document.getElementById("aoiType").value;

      if (aoiTypeValue === "dropdown") {
        aoi_input_method = "dropdown";
        aoi_geographical_identifier =
          document.getElementById("aoiDropdown").value || null;
      }

      if (aoiTypeValue === "coordinates") {
        aoi_input_method = "coordinates";
        const minLat = document.getElementById("minLat").value;
        const maxLat = document.getElementById("maxLat").value;
        const minLon = document.getElementById("minLon").value;
        const maxLon = document.getElementById("maxLon").value;

        aoi_coordinates = JSON.stringify({
          minLat,
          maxLat,
          minLon,
          maxLon,
        });
      }

      if (aoiTypeValue === "upload") {
        aoi_input_method = "upload";
        const fileInput = document.getElementById("aoiFile");
        aoi_file = fileInput.files.length > 0 ? fileInput.files[0].name : null;
      }

      other_requirements = document.getElementById("otherRequirements").value.trim();
    }

    // ------------------------------
    // Build payload
    // ------------------------------
    const payload = {
      title,
      evaluator,
      affiliation,
      data_processing_level,
      data_type,
      other_data_type,
      evaluation_id,
      evaluation_type,

      // Use-case fields
      use_case_description,
      optimum_data_collection,
      aoi_input_method,
      aoi_coordinates,
      aoi_file,
      aoi_geographical_identifier,
      other_requirements
    };

    console.log("📤 Sending payload:", payload);

    // try {
    //   const response = await fetch("http://localhost:8020/dataset", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });

    //   const result = await response.json();
    //   console.log("📥 Response received:", result);

    //   if (!response.ok) {
    //     alert("⚠️ Error: " + result.message);
    //     return;
    //   }

    //   console.log(result);
    //   // ⭐ SUCCESS → Redirect to section2
    //   window.location.href = "section2.html";
    //   // alert("✅ Dataset saved!");

    // } 
    // catch (error) {
    //   console.error("❌ Backend error:", error);
    //   alert("Could not connect to server.");
    // }
      // ⭐ Save to LocalStorage
  localStorage.setItem("section1_data", JSON.stringify(payload));

  console.log("Saved to localStorage:", payload);
  // ⭐ Move to Section 2
  window.location.href = "section2.html";
  });

});


