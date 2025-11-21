// core/dataManager.js
export const DataManager = {
  init() {
    if (!localStorage.getItem('surveyData')) {
      const initialData = {
        section1: {},
        section2: {},
        section3: {},
        section4: {},
        section5: {},
        scores: { bySection: {}, byGroup: {}, bySectionAverage: {}, overall: null },
        timestamps: {
          created: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };
      localStorage.setItem('surveyData', JSON.stringify(initialData));
    }
  },

  get() {
    return JSON.parse(localStorage.getItem('surveyData') || '{}');
  },

  save(section, subsection, data) {
    const surveyData = this.get();
    if (!surveyData[section]) surveyData[section] = {};
    if (subsection) {
      surveyData[section][subsection] = { ...surveyData[section][subsection], ...data };
    } else {
      surveyData[section] = { ...surveyData[section], ...data };
    }
    surveyData.timestamps.lastModified = new Date().toISOString();
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
  },

  clearAll() {
    localStorage.removeItem('surveyData');
    localStorage.removeItem('dataType');
    localStorage.removeItem('evaluationType');
    localStorage.removeItem('dataProcessingLevel');
  }
};
