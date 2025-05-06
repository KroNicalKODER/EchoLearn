import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Utility to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Phoneme to Integer Mapping
const dictPhenomeToInt = {
  AA0: 0,
  AA1: 1,
  AA2: 2,
  AE0: 3,
  AE1: 4,
  AE2: 5,
  AH0: 6,
  AH1: 7,
  AH2: 8,
  AO0: 9,
  AO1: 10,
  AO2: 11,
  AW0: 12,
  AW1: 13,
  AW2: 14,
  AY0: 15,
  AY1: 16,
  AY2: 17,
  B: 18,
  CH: 19,
  D: 20,
  DH: 21,
  EH0: 22,
  EH1: 23,
  EH2: 24,
  ER0: 25,
  ER1: 26,
  ER2: 27,
  EY0: 28,
  EY1: 29,
  EY2: 30,
  F: 31,
  G: 32,
  HH: 33,
  IH0: 34,
  IH1: 35,
  IH2: 36,
  IY0: 37,
  IY1: 38,
  IY2: 39,
  JH: 40,
  K: 41,
  L: 42,
  M: 43,
  N: 44,
  NG: 45,
  OW0: 46,
  OW1: 47,
  OW2: 48,
  OY0: 49,
  OY1: 50,
  OY2: 51,
  P: 52,
  R: 53,
  S: 54,
  SH: 55,
  T: 56,
  TH: 57,
  UH0: 58,
  UH1: 59,
  UH2: 60,
  UW0: 61,
  UW1: 62,
  UW2: 63,
  V: 64,
  W: 65,
  Y: 66,
  Z: 67,
  ZH: 68,
};

// Parse TextGrid format
async function parseTextGrid(text) {
  const lines = text.split("\n").map((line) => line.trim());
  let json = {
    fileType: "ooTextFile",
    objectClass: "TextGrid",
    xmin: 0,
    xmax: 0,
    tiers: [],
    totalDuration: 0,
  };

  let currentTier = null;
  let interval = null;
  let insideIntervals = false;

  for (let line of lines) {
    if (line.startsWith("xmin = "))
      json.xmin = parseFloat(line.split("=")[1].trim());
    if (line.startsWith("xmax = ")) {
      const xmax = parseFloat(line.split("=")[1].trim());
      json.xmax = xmax;
      json.totalDuration = xmax - json.xmin;
    }

    if (line.startsWith("item [")) {
      if (currentTier) json.tiers.push(currentTier);
      currentTier = { class: "", name: "", xmin: 0, xmax: 0, intervals: [] };
      insideIntervals = false;
    }

    if (line.startsWith("class = "))
      currentTier.class = line.split("=")[1].trim().replace(/"/g, "");
    if (line.startsWith("name = "))
      currentTier.name = line.split("=")[1].trim().replace(/"/g, "");
    if (line.startsWith("xmin = ") && currentTier && !insideIntervals)
      currentTier.xmin = parseFloat(line.split("=")[1].trim());
    if (line.startsWith("xmax = ") && currentTier && !insideIntervals)
      currentTier.xmax = parseFloat(line.split("=")[1].trim());

    if (line.startsWith("intervals: size = ")) insideIntervals = true;

    if (insideIntervals && line.startsWith("xmin = ")) {
      interval = {
        xmin: parseFloat(line.split("=")[1].trim()),
        duration: 0,
      };
    }

    if (insideIntervals && line.startsWith("xmax = ")) {
      interval.xmax = parseFloat(line.split("=")[1].trim());
      interval.duration = interval.xmax - interval.xmin;
    }

    if (insideIntervals && line.startsWith("text = ")) {
      interval.text = line.split("=")[1].trim().replace(/"/g, "");
      currentTier.intervals.push(interval);
    }
  }

  if (currentTier) json.tiers.push(currentTier);
  return json;
}

// Convert phoneme array to integer array
const phenomesToIntArray = (phenomes) => {
  return phenomes.map((p) =>
    dictPhenomeToInt.hasOwnProperty(p) ? dictPhenomeToInt[p] : -1
  );
};

// Recursive helper for LCS with tolerance
const helperlcsWithTolerance = (
  arr1,
  arr2,
  tolerance,
  dp,
  i,
  j,
  used1 = new Set(),
  used2 = new Set()
) => {
  if (i === 0 || j === 0 || tolerance < 0) return 0;
  if (dp[i][j][tolerance] !== -1) return dp[i][j][tolerance];

  if (arr1[i - 1] === arr2[j - 1] && !used1.has(i - 1) && !used2.has(j - 1)) {
    used1.add(i - 1);
    used2.add(j - 1);
    dp[i][j][tolerance] =
      1 +
      helperlcsWithTolerance(
        arr1,
        arr2,
        tolerance,
        dp,
        i - 1,
        j - 1,
        used1,
        used2
      );
    used1.delete(i - 1);
    used2.delete(j - 1);
  } else {
    dp[i][j][tolerance] = Math.max(
      helperlcsWithTolerance(
        arr1,
        arr2,
        tolerance - 1,
        dp,
        i - 1,
        j,
        used1,
        used2
      ),
      helperlcsWithTolerance(
        arr1,
        arr2,
        tolerance - 1,
        dp,
        i,
        j - 1,
        used1,
        used2
      )
    );
  }

  return dp[i][j][tolerance];
};

const lcsWithTolerance = (arr1, arr2, tolerance) => {
  const dp = Array.from({ length: arr1.length + 1 }, () =>
    Array.from({ length: arr2.length + 1 }, () => Array(tolerance + 1).fill(-1))
  );
  return helperlcsWithTolerance(
    arr1,
    arr2,
    tolerance,
    dp,
    arr1.length,
    arr2.length
  );
};

export const calculateScore = (userData, expectedData, tolerance = 2) => {
  const getTier = (data) => data.tiers.find((t) => t.name === "phones");
  const extractPhonemes = (tier) =>
    tier.intervals.filter((i) => i.text && i.text !== "").map((i) => i.text);
  const extractDurations = (tier) =>
    tier.intervals
      .filter((i) => i.text && i.text !== "")
      .map((i) => i.duration);

  const userTier = getTier(userData);
  const expectedTier = getTier(expectedData);
  const userPhenomes = extractPhonemes(userTier);
  const expectedPhenomes = extractPhonemes(expectedTier);
  const userDurations = extractDurations(userTier);
  const expectedDurations = extractDurations(expectedTier);

  const userIntArray = phenomesToIntArray(userPhenomes);
  const expectedIntArray = phenomesToIntArray(expectedPhenomes);

  const lcs1 = lcsWithTolerance(userIntArray, expectedIntArray, tolerance);
  const lcs2 = lcsWithTolerance(expectedIntArray, userIntArray, tolerance);
  const phenomeScore =
    ((lcs1 + lcs2) / (userIntArray.length + expectedIntArray.length)) * 100;

  let durationScore = 0;
  if (userDurations.length === expectedDurations.length) {
    const totalDiff = userDurations.reduce(
      (acc, dur, i) => acc + Math.abs(dur - expectedDurations[i]),
      0
    );
    const avgDiff = totalDiff / userDurations.length;
    durationScore = Math.max(0, 100 - avgDiff * 100);
  }

  const totalDiff = Math.abs(
    userData.totalDuration - expectedData.totalDuration
  );
  const timingScore = Math.max(0, 100 - totalDiff * 10);

  const finalScore =
    phenomeScore * 0.4 + durationScore * 0.5 + timingScore * 0.5;

  return {
    finalScore,
    breakdown: { phenomeScore, durationScore, timingScore },
  };
};

export default async function convertTextGridToJSON() {
  const inputFile1 = path.join(__dirname, "audio.TextGrid");
  const inputFile2 = path.join(__dirname, "audio1.TextGrid");
  const outputFile1 = path.join(__dirname, "output.json");
  const outputFile2 = path.join(__dirname, "output1.json");

  try {
    const data = await fs.readFile(inputFile1, "utf8");
    const data1 = await fs.readFile(inputFile2, "utf8");

    const jsonData = await parseTextGrid(data);
    const jsonData1 = await parseTextGrid(data1);

    // await fs.writeFile(outputFile1, JSON.stringify(jsonData, null, 2));
    // await fs.writeFile(outputFile2, JSON.stringify(jsonData1, null, 2));

    const score = calculateScore(jsonData, jsonData1);

    console.log("✅ JSON files created and score calculated.");

    return {
      code: 200,
      data: jsonData,
      data1: jsonData1,
      score,
    };
  } catch (error) {
    console.error("❌ Error processing files:", error.message);
    return {
      code: 400,
      error: "Error processing the file",
      details: error.message,
    };
  }
}
