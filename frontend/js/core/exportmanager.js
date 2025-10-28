// core/exportManager.js
export const ExportManager = {
  generateXLSX(surveyData) {
    const wb = XLSX.utils.book_new();

    const addSheet = (name, data) => {
      const flat = Array.isArray(data) ? data : [data];
      const ws = XLSX.utils.json_to_sheet(flat);
      XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
    };

    addSheet('Section1', surveyData.section1 || {});
    addSheet('Section2', surveyData.section2 || {});
    addSheet('Section3', surveyData.section3 || {});
    addSheet('Section4', surveyData.section4 || {});
    addSheet('Section5', surveyData.section5 || {});
    addSheet('Scores', surveyData.scores.bySectionAverage || {});

    const title = surveyData.section1?.basic?.datasetTitle || 'Survey';
    XLSX.writeFile(wb, `${title.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  },

  async generateJSONZip(surveyData) {
    const zip = new JSZip();
    Object.entries(surveyData).forEach(([key, value]) => {
      zip.file(`${key}.json`, JSON.stringify(value, null, 2));
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Survey_JSONs.zip";
    a.click();
    URL.revokeObjectURL(url);
  }
};
