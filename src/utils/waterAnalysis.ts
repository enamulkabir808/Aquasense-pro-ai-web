import * as XLSX from 'xlsx';

export interface WaterAnalysisResult {
  waterType: string;
  clarityLevel: 'Low' | 'Medium' | 'High';
  clarityScore: number;
  clarityComment: string;
  turbidityLevel: 'Low' | 'Medium' | 'High';
  turbidityScore: number;
  turbidityComment: string;
  algaeLevel: 'Low' | 'Medium' | 'High';
  algaeScore: number;
  algaeComment: string;
  planktonProbability: number;
  fishFarmingLevel: string;
  fishFarmingScore: number;
  fishFarmingComment: string;
  drinkingWaterLevel: 'Low' | 'Medium' | 'High';
  drinkingWaterScore: number;
  drinkingWaterStatus: 'Maybe Safe (Needs Testing)' | 'Not Safe' | 'Dangerous';
  drinkingWaterComment: string;
  bacteriaRiskLevel: string;
  bacteriaRisk: number;
  bacteriaRiskComment: string;
  virusRiskLevel: string;
  virusRisk: number;
  virusRiskComment: string;
  phValue: number;
  phRangeLabel: string;
  phComment: string;
  estimatedDoMgL: number;
  estimatedTdsPpm: number;
  aquacultureStatus: 'Good for Fish Farming' | 'Needs Improvement' | 'Not Suitable';
  aquacultureAdvice: string;
  overallLevel: string;
  overallScore: number;
  finalStatus: 'Relatively Good Visual Quality' | 'Moderate Visual Quality' | 'Poor Visual Quality';
  brightness: number;
  sharpness: number;
  red: number;
  green: number;
  blue: number;
  redRatio: number;
  greenRatio: number;
  blueRatio: number;
  timestamp: string;
  sampleName: string;
  imageDataUrl: string;
}

export interface SystemStatistics {
  totalVisitors: number;
  totalUploads: number;
  avgUploadsPerPerson: number;
}

export function percentageLevel(value: number): 'Low' | 'Medium' | 'High' {
  if (value <= 30) return 'Low';
  if (value <= 60) return 'Medium';
  return 'High';
}

export function detailedScoreLevel(value: number): string {
  if (value <= 10) return 'Low';
  if (value <= 20) return 'Low-Mid';
  if (value <= 30) return 'Low-High';
  if (value <= 40) return 'Mid-Low';
  if (value <= 50) return 'Mid-Mid';
  if (value <= 60) return 'Mid-High';
  if (value <= 70) return 'High-Low';
  if (value <= 80) return 'High-Mid';
  if (value <= 95) return 'High';
  return 'High-High';
}

export function getClarityComment(level: 'Low' | 'Medium' | 'High'): string {
  const comments: Record<'Low' | 'Medium' | 'High', string> = {
    Low: 'Low Water Clarity means the water is cloudy or murky due to suspended particles, algae, or pollution. It can reduce water quality, harm aquatic life, and indicate possible contamination.',
    Medium:
      'Medium Water Clarity indicates that the water contains some visible cloudiness or suspended material. Regular monitoring is recommended.',
    High: 'High Water Clarity indicates that the water appears relatively clear with fewer visible suspended particles.',
  };
  return comments[level];
}

export function getTurbidityComment(level: 'Low' | 'Medium' | 'High'): string {
  const comments: Record<'Low' | 'Medium' | 'High', string> = {
    Low: 'Low estimated turbidity indicates relatively clear-looking water with limited visible suspended particles.',
    Medium:
      'Medium estimated turbidity indicates visible cloudiness or suspended material. Further water-quality testing is recommended.',
    High: 'High estimated turbidity indicates strongly cloudy or visually contaminated water. Additional investigation and appropriate treatment are recommended.',
  };
  return comments[level];
}

export function getAlgaeComment(level: 'Low' | 'Medium' | 'High'): string {
  const comments: Record<'Low' | 'Medium' | 'High', string> = {
    Low: 'Low algae/plankton probability. The image does not show strong green color dominance.',
    Medium:
      'Medium algae/plankton probability. Green coloration is present and biological growth may be possible.',
    High: 'High algae/plankton probability. Strong green coloration may indicate algae or plankton. Image analysis cannot confirm the exact biological organism.',
  };
  return comments[level];
}

export function getFishComment(score: number): string {
  const level = detailedScoreLevel(score);
  if (score >= 70) {
    return `${level} Fish Farming Water: The water appears relatively suitable for fish farming based on visual characteristics. Regular monitoring of oxygen, pollutants and other water parameters is recommended.`;
  }
  if (score >= 40) {
    return `${level} Fish Farming Water: The water may be acceptable for fish farming but needs regular monitoring. Improving oxygen levels and reducing pollutants can help maintain healthy fish growth.`;
  }
  return `${level} Fish Farming Water: The water shows significant visual-quality concerns. Full water-quality testing and appropriate treatment are recommended before use.`;
}

export function getDrinkingComment(status: string, percentage: number): string {
  if (percentage >= 70) {
    return 'The water appears visually cleaner based on the image. However, this percentage is only an AI-based visual estimation and does not confirm drinking-water safety.';
  }
  if (percentage >= 40) {
    return 'The water shows moderate visual-quality concerns. It should not be considered safe for drinking without proper laboratory testing.';
  }
  return 'The water shows significant visual-quality concerns. It should not be consumed based on this visual assessment. Laboratory testing is strongly recommended.';
}

export function getBacteriaComment(level: string, percentage: number): string {
  return `Bacteria Risk is estimated at ${percentage}%. Risk category: ${level}. This is a visual-risk estimation based on image characteristics and cannot directly detect or measure bacteria.`;
}

export function getVirusComment(level: string, percentage: number): string {
  return `Virus Risk is estimated at ${percentage}%. Risk category: ${level}. This is a visual-risk estimation and cannot directly detect viruses. Laboratory testing is required for actual virus detection.`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Exact port of AquaSense_Pro_AI_Upgraded.py OpenCV analysis + colorimetric pH & water measurements
 */
export async function analyzeWaterImage(
  imageDataUrl: string,
  sampleName = 'Water_Sample.jpg'
): Promise<WaterAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = 500;
        const height = 500;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const numPixels = width * height;

        const gray = new Float64Array(numPixels);
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumGray = 0;

        for (let i = 0; i < numPixels; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          sumR += r;
          sumG += g;
          sumB += b;

          // Standard OpenCV BGR2GRAY formula: 0.299*R + 0.587*G + 0.114*B
          const gVal = 0.299 * r + 0.587 * g + 0.114 * b;
          gray[i] = gVal;
          sumGray += gVal;
        }

        const rMean = sumR / numPixels;
        const gMean = sumG / numPixels;
        const bMean = sumB / numPixels;
        const brightness = sumGray / numPixels;

        // Compute 3x3 Laplacian variance matching cv2.Laplacian(gray, cv2.CV_64F).var()
        const laplacian = new Float64Array(numPixels);
        let lapSum = 0;
        let count = 0;

        for (let y = 1; y < height - 1; y++) {
          const rowOffset = y * width;
          for (let x = 1; x < width - 1; x++) {
            const idx = rowOffset + x;
            const val =
              gray[idx - width] +
              gray[idx - 1] -
              4 * gray[idx] +
              gray[idx + 1] +
              gray[idx + width];
            laplacian[count] = val;
            lapSum += val;
            count++;
          }
        }

        const lapMean = lapSum / count;
        let lapVarSum = 0;
        for (let i = 0; i < count; i++) {
          const diff = laplacian[i] - lapMean;
          lapVarSum += diff * diff;
        }
        const sharpness = lapVarSum / count;

        const totalRgb = rMean + gMean + bMean + 0.0001;
        const redRatio = (rMean / totalRgb) * 100;
        const greenRatio = (gMean / totalRgb) * 100;
        const blueRatio = (bMean / totalRgb) * 100;

        let waterType = 'Polluted / Dirty Water';
        if (bMean > rMean && bMean > gMean) {
          waterType = 'River / Sea Water';
        } else if (gMean > rMean) {
          waterType = 'Pond Water (Algae Possible)';
        } else {
          waterType = 'Polluted / Dirty Water';
        }

        const clarityScore = Math.floor(clamp((sharpness / 600) * 100, 1, 100));
        const clarityLevel = percentageLevel(clarityScore);

        const turbidityScore = Math.floor(clamp(100 - (brightness / 255) * 100, 1, 100));
        const turbidityLevel = percentageLevel(turbidityScore);

        const greenDifference = gMean - Math.max(rMean, bMean);
        let algaeScore = 0;
        if (greenDifference > 0) {
          algaeScore = Math.floor(clamp(50 + (greenDifference / 255) * 100, 1, 100));
        } else {
          algaeScore = Math.floor(clamp(20 + (greenDifference / 255) * 100, 1, 100));
        }
        const algaeLevel = percentageLevel(algaeScore);

        let fishScore = 100;
        if (turbidityLevel === 'High') fishScore -= 35;
        else if (turbidityLevel === 'Medium') fishScore -= 15;

        if (clarityLevel === 'Low') fishScore -= 25;
        else if (clarityLevel === 'Medium') fishScore -= 10;

        if (algaeLevel === 'High') fishScore -= 20;
        else if (algaeLevel === 'Medium') fishScore -= 10;

        fishScore = Math.floor(clamp(fishScore, 0, 100));
        const fishLevel = detailedScoreLevel(fishScore);

        const drinkingScore = Math.floor(
          clamp(
            fishScore * 0.55 + (100 - turbidityScore) * 0.25 + clarityScore * 0.2,
            1,
            100
          )
        );

        let drinkingStatus: 'Maybe Safe (Needs Testing)' | 'Not Safe' | 'Dangerous' = 'Dangerous';
        if (drinkingScore >= 70) {
          drinkingStatus = 'Maybe Safe (Needs Testing)';
        } else if (drinkingScore >= 40) {
          drinkingStatus = 'Not Safe';
        }
        const drinkingLevel = percentageLevel(drinkingScore);

        const bacteriaRisk = Math.floor(
          clamp(
            turbidityScore * 0.5 + algaeScore * 0.2 + (100 - clarityScore) * 0.3,
            1,
            95
          )
        );
        const bacteriaLevel = detailedScoreLevel(bacteriaRisk);

        const virusRisk = Math.floor(clamp(bacteriaRisk - 10, 10, 95));
        const virusLevel = detailedScoreLevel(virusRisk);

        const overallScore = Math.floor(
          clamp(
            fishScore * 0.4 +
              clarityScore * 0.2 +
              (100 - turbidityScore) * 0.2 +
              (100 - algaeScore) * 0.2,
            0,
            100
          )
        );
        const overallLevel = detailedScoreLevel(overallScore);

        let finalStatus:
          | 'Relatively Good Visual Quality'
          | 'Moderate Visual Quality'
          | 'Poor Visual Quality' = 'Poor Visual Quality';
        if (overallScore >= 70) {
          finalStatus = 'Relatively Good Visual Quality';
        } else if (overallScore >= 40) {
          finalStatus = 'Moderate Visual Quality';
        }

        let aquacultureStatus: 'Good for Fish Farming' | 'Needs Improvement' | 'Not Suitable' =
          'Not Suitable';
        let aquacultureAdvice =
          'Full water-quality assessment and treatment are recommended before using the water for fish farming.';
        if (fishScore >= 70) {
          aquacultureStatus = 'Good for Fish Farming';
          aquacultureAdvice =
            'Add/maintain aeration, monitor dissolved oxygen, control organic waste and perform regular water testing.';
        } else if (fishScore >= 40) {
          aquacultureStatus = 'Needs Improvement';
          aquacultureAdvice =
            'Use appropriate water-quality management, reduce waste, improve water circulation and monitor dissolved oxygen.';
        }

        const rawPh =
          7.15 +
          (greenRatio - 33.3) * 0.042 -
          (redRatio - 33.3) * 0.038 +
          (blueRatio - 33.3) * 0.012;
        const phValue = Number(clamp(rawPh, 5.5, 9.2).toFixed(2));

        let phRangeLabel = 'Neutral (Optimal)';
        let phComment =
          'Estimated pH is within the optimal neutral range (6.5–7.8) for freshwater ecosystems and aquaculture.';
        if (phValue < 6.5) {
          phRangeLabel = 'Slightly Acidic';
          phComment =
            'Visual colorimetric balance suggests slightly acidic conditions (often linked to organic decay or humic tannins). Agricultural lime treatment may be needed for fish ponds.';
        } else if (phValue > 8.0) {
          phRangeLabel = 'Alkaline (Algae Driven)';
          phComment =
            'Elevated pH estimation correlates with high photosynthetic green/algae signature. Monitor afternoon pH spikes and ammonia toxicity.';
        } else if (phValue > 7.5) {
          phRangeLabel = 'Mildly Alkaline (Healthy Pond)';
          phComment =
            'Ideal slightly alkaline range (7.5–8.0) well-suited for carp, tilapia, and general pond aquaculture.';
        }

        const estimatedDoMgL = Number(
          clamp(4.2 + (clarityScore / 100) * 3.6 - (turbidityScore / 100) * 1.8, 2.5, 8.9).toFixed(
            1
          )
        );
        const estimatedTdsPpm = Math.round(
          clamp(85 + turbidityScore * 4.5 + algaeScore * 1.8, 60, 850)
        );

        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        resolve({
          waterType,
          clarityLevel,
          clarityScore,
          clarityComment: getClarityComment(clarityLevel),
          turbidityLevel,
          turbidityScore,
          turbidityComment: getTurbidityComment(turbidityLevel),
          algaeLevel,
          algaeScore,
          algaeComment: getAlgaeComment(algaeLevel),
          planktonProbability: algaeScore,
          fishFarmingLevel: fishLevel,
          fishFarmingScore: fishScore,
          fishFarmingComment: getFishComment(fishScore),
          drinkingWaterLevel: drinkingLevel,
          drinkingWaterScore: drinkingScore,
          drinkingWaterStatus: drinkingStatus,
          drinkingWaterComment: getDrinkingComment(drinkingStatus, drinkingScore),
          bacteriaRiskLevel: bacteriaLevel,
          bacteriaRisk,
          bacteriaRiskComment: getBacteriaComment(bacteriaLevel, bacteriaRisk),
          virusRiskLevel: virusLevel,
          virusRisk,
          virusRiskComment: getVirusComment(virusLevel, virusRisk),
          phValue,
          phRangeLabel,
          phComment,
          estimatedDoMgL,
          estimatedTdsPpm,
          aquacultureStatus,
          aquacultureAdvice,
          overallLevel,
          overallScore,
          finalStatus,
          brightness: Number(brightness.toFixed(2)),
          sharpness: Number(sharpness.toFixed(2)),
          red: Number(rMean.toFixed(2)),
          green: Number(gMean.toFixed(2)),
          blue: Number(bMean.toFixed(2)),
          redRatio: Number(redRatio.toFixed(2)),
          greenRatio: Number(greenRatio.toFixed(2)),
          blueRatio: Number(blueRatio.toFixed(2)),
          timestamp,
          sampleName,
          imageDataUrl,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Unable to read the uploaded water image.'));
    img.src = imageDataUrl;
  });
}

export function getReportRows(r: WaterAnalysisResult) {
  return [
    {
      Parameter: 'Water Type',
      Level: '-',
      'Score / Result': r.waterType,
      Comment: 'Visual water-type classification.',
    },
    {
      Parameter: 'Estimated pH Level',
      Level: r.phRangeLabel,
      'Score / Result': `${r.phValue} pH`,
      Comment: r.phComment,
    },
    {
      Parameter: 'Clarity',
      Level: r.clarityLevel,
      'Score / Result': `${r.clarityScore}%`,
      Comment: r.clarityComment,
    },
    {
      Parameter: 'Turbidity',
      Level: r.turbidityLevel,
      'Score / Result': `${r.turbidityScore}%`,
      Comment: r.turbidityComment,
    },
    {
      Parameter: 'Algae Level',
      Level: r.algaeLevel,
      'Score / Result': `${r.algaeScore}%`,
      Comment: r.algaeComment,
    },
    {
      Parameter: 'Fish Farming Score',
      Level: r.fishFarmingLevel,
      'Score / Result': `${r.fishFarmingScore}%`,
      Comment: r.fishFarmingComment,
    },
    {
      Parameter: 'Drinking Water',
      Level: r.drinkingWaterLevel,
      'Score / Result': `${r.drinkingWaterScore}% (${r.drinkingWaterStatus})`,
      Comment: r.drinkingWaterComment,
    },
    {
      Parameter: 'Bacteria Risk',
      Level: r.bacteriaRiskLevel,
      'Score / Result': `${r.bacteriaRisk}%`,
      Comment: r.bacteriaRiskComment,
    },
    {
      Parameter: 'Virus Risk',
      Level: r.virusRiskLevel,
      'Score / Result': `${r.virusRisk}%`,
      Comment: r.virusRiskComment,
    },
    {
      Parameter: 'Aquaculture Status',
      Level: '-',
      'Score / Result': r.aquacultureStatus,
      Comment: r.aquacultureAdvice,
    },
    {
      Parameter: 'Overall Result',
      Level: r.overallLevel,
      'Score / Result': `${r.overallScore}%`,
      Comment: r.finalStatus,
    },
  ];
}

export function getCvRows(r: WaterAnalysisResult) {
  return [
    { 'Computer Vision Parameter': 'Brightness', Value: `${r.brightness}` },
    { 'Computer Vision Parameter': 'Sharpness', Value: `${r.sharpness}` },
    { 'Computer Vision Parameter': 'Red Channel', Value: `${r.red}` },
    { 'Computer Vision Parameter': 'Green Channel', Value: `${r.green}` },
    { 'Computer Vision Parameter': 'Blue Channel', Value: `${r.blue}` },
    { 'Computer Vision Parameter': 'Red Ratio', Value: `${r.redRatio}%` },
    { 'Computer Vision Parameter': 'Green Ratio', Value: `${r.greenRatio}%` },
    { 'Computer Vision Parameter': 'Blue Ratio', Value: `${r.blueRatio}%` },
    { 'Computer Vision Parameter': 'Colorimetric pH Est.', Value: `${r.phValue} pH` },
    { 'Computer Vision Parameter': 'Optical DO Est.', Value: `${r.estimatedDoMgL} mg/L` },
    { 'Computer Vision Parameter': 'Optical TDS Est.', Value: `${r.estimatedTdsPpm} ppm` },
  ];
}

export function getStatsRows(stats: SystemStatistics) {
  return [
    { Statistic: 'Total Visitor', Value: stats.totalVisitors },
    { Statistic: 'Total Image Upload', Value: stats.totalUploads },
    { Statistic: 'AVG Image Upload / Person', Value: Number(stats.avgUploadsPerPerson.toFixed(2)) },
  ];
}

export function downloadWaterReportCsv(r: WaterAnalysisResult) {
  const rows = getReportRows(r);
  const headers = ['Parameter', 'Level', 'Score / Result', 'Comment'];
  const escapeCsv = (val: string) => `"${String(val).replace(/"/g, '""')}"`;

  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        escapeCsv(row.Parameter),
        escapeCsv(row.Level),
        escapeCsv(row['Score / Result']),
        escapeCsv(row.Comment),
      ].join(',')
    ),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AquaSense_Water_Report.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCompleteExcel(r: WaterAnalysisResult, stats: SystemStatistics) {
  const wb = XLSX.utils.book_new();

  const reportWs = XLSX.utils.json_to_sheet(getReportRows(r));
  const statsWs = XLSX.utils.json_to_sheet(getStatsRows(stats));
  const cvWs = XLSX.utils.json_to_sheet(getCvRows(r));

  XLSX.utils.book_append_sheet(wb, reportWs, 'Water Report');
  XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');
  XLSX.utils.book_append_sheet(wb, cvWs, 'Computer Vision');

  XLSX.writeFile(wb, 'AquaSense_Complete_Report.xlsx');
}

export type ExampleWaterType = 'river_sea_1' | 'river_sea_2' | 'fish_pond_algae' | 'polluted_dirty';

/**
 * Generates high-resolution (900x600) example water images for the Top Bar Example Image Viewer Modal
 */
export function generateExampleWaterPhoto(preset: ExampleWaterType): {
  dataUrl: string;
  title: string;
  fileName: string;
  caption: string;
} {
  const width = 900;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (preset === 'river_sea_1') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.45, '#0369a1');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Sunlit ripples and natural river wave texture
    for (let y = 10; y < height; y += 14) {
      for (let x = 0; x < width; x += 48) {
        const wave = Math.sin(x * 0.03 + y * 0.05) * 6;
        ctx.strokeStyle =
          (x + y) % 28 === 0 ? 'rgba(224, 242, 254, 0.45)' : 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y + wave);
        ctx.quadraticCurveTo(x + 22, y - 5 + wave, x + 44, y + wave);
        ctx.stroke();
      }
    }

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.94),
      title: 'River / Sea Water (Sample 1)',
      fileName: 'River_Sea_Water_1.jpg',
      caption: 'Natural flowing blue river water with clear daylight wave reflections.',
    };
  }

  if (preset === 'river_sea_2') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0ea5e9');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#075985');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Shimmering open estuarine / sea water caustics
    for (let i = 0; i < 420; i++) {
      const x = (i * 67) % width;
      const y = (i * 43) % height;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(240, 249, 255, 0.5)' : 'rgba(14, 116, 144, 0.35)';
      ctx.lineWidth = 1.6 + (i % 3) * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 20, y - 8, x + 40, y + 8, x + 60, y - 2);
      ctx.stroke();
    }

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.94),
      title: 'River / Sea Water (Sample 2)',
      fileName: 'River_Sea_Water_2.jpg',
      caption: 'Deep coastal & wide river surface water with bright blue spectral dominance.',
    };
  }

  if (preset === 'fish_pond_algae') {
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      50,
      width * 0.5,
      height * 0.5,
      520
    );
    grad.addColorStop(0, '#2e7d32');
    grad.addColorStop(0.55, '#1b5e20');
    grad.addColorStop(1, '#144518');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Phytoplankton / green algae bloom texture & gentle pond ripples
    for (let i = 0; i < 550; i++) {
      const x = (i * 53) % width;
      const y = (i * 37) % height;
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(134, 239, 172, 0.25)'
          : i % 2 === 0
          ? 'rgba(74, 222, 128, 0.22)'
          : 'rgba(20, 83, 45, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + (i % 9), 3 + (i % 4), (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.94),
      title: 'Fish_Pond_Algae',
      fileName: 'Fish_Pond_Algae.jpg',
      caption: 'Green aquaculture pond water showing phytoplankton & algae bloom coloration.',
    };
  }

  // Polluted / Dirty Water
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#6b4f35');
  grad.addColorStop(0.5, '#543d28');
  grad.addColorStop(1, '#3e2c1c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Murky suspended sediment & organic runoff clouds
  for (let i = 0; i < 320; i++) {
    const x = (i * 71) % width;
    const y = (i * 47) % height;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(146, 112, 79, 0.24)' : 'rgba(58, 42, 29, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y, 18 + (i % 20), 9 + (i % 10), 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    title: 'Polluted / Dirty Water',
    fileName: 'Polluted_Dirty_Water.jpg',
    caption: 'High-turbidity, sediment-heavy murky water sample indicating visual contamination.',
  };
}
