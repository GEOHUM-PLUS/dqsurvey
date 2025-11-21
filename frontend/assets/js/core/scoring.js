// core/scoring.js
export function calculateScores(surveyData) {
  const sectionScores = {};

  // Calculate average score per section
  Object.entries(surveyData.scores.bySection).forEach(([section, fields]) => {
    const values = Object.values(fields)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
    sectionScores[section] = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : null;
  });

  // Editable weighting formula
  const weights = {
    section1: 0.15,
    section2: 0.15,
    section3: 0.30,
    section4: 0.25,
    section5: 0.15
  };

  let weightedSum = 0;
  let totalWeight = 0;
  Object.entries(sectionScores).forEach(([sec, avg]) => {
    if (avg !== null && weights[sec]) {
      weightedSum += avg * weights[sec];
      totalWeight += weights[sec];
    }
  });

  surveyData.scores.bySectionAverage = sectionScores;
  surveyData.scores.overall = totalWeight ? weightedSum / totalWeight : null;
  return surveyData;
}
