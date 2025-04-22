// Calculating the score of the user based on the score of the user

const dictPhenomeToInt = {
    'AA0': 0, 'AA1': 1, 'AA2': 2,
    'AE0': 3, 'AE1': 4, 'AE2': 5,
    'AH0': 6, 'AH1': 7, 'AH2': 8,
    'AO0': 9, 'AO1': 10, 'AO2': 11,
    'AW0': 12, 'AW1': 13, 'AW2': 14,
    'AY0': 15, 'AY1': 16, 'AY2': 17,
    'B': 18,
    'CH': 19,
    'D': 20,
    'DH': 21,
    'EH0': 22, 'EH1': 23, 'EH2': 24,
    'ER0': 25, 'ER1': 26, 'ER2': 27,
    'EY0': 28, 'EY1': 29, 'EY2': 30,
    'F': 31,
    'G': 32,
    'HH': 33,
    'IH0': 34, 'IH1': 35, 'IH2': 36,
    'IY0': 37, 'IY1': 38, 'IY2': 39,
    'JH': 40,
    'K': 41,
    'L': 42,
    'M': 43,
    'N': 44,
    'NG': 45,
    'OW0': 46, 'OW1': 47, 'OW2': 48,
    'OY0': 49, 'OY1': 50, 'OY2': 51,
    'P': 52,
    'R': 53,
    'S': 54,
    'SH': 55,
    'T': 56,
    'TH': 57,
    'UH0': 58, 'UH1': 59, 'UH2': 60,
    'UW0': 61, 'UW1': 62, 'UW2': 63,
    'V': 64,
    'W': 65,
    'Y': 66,
    'Z': 67,
    'ZH': 68
}

const helperlcsWithTolerance = (arr1, arr2, tolerance, dp, i, j, used1 = new Set(), used2 = new Set()) => {
    if (i === 0 || j === 0 || tolerance < 0) {
        return 0;
    }
    if (dp[i][j][tolerance] !== -1) {
        return dp[i][j][tolerance];
    }
    
    if (arr1[i-1] === arr2[j-1] && !used1.has(i-1) && !used2.has(j-1)) {
        // Exact match, no tolerance used
        used1.add(i-1);
        used2.add(j-1);
        dp[i][j][tolerance] = 1 + helperlcsWithTolerance(arr1, arr2, tolerance, dp, i - 1, j - 1, used1, used2);
        used1.delete(i-1);
        used2.delete(j-1);
    } else {
        // No match, try skipping in either sequence
        dp[i][j][tolerance] = Math.max(
            helperlcsWithTolerance(arr1, arr2, tolerance-1, dp, i - 1, j, used1, used2),
            helperlcsWithTolerance(arr1, arr2, tolerance-1, dp, i, j - 1, used1, used2)
        );
    }
    return dp[i][j][tolerance];
}

const lcsWithTolerance = (arr1, arr2, tolerance) => {
    // Initialize 3D DP array
    const dp = Array.from({ length: arr1.length + 1 }, () => 
        Array.from({ length: arr2.length + 1 }, () => 
            Array(tolerance + 1).fill(-1)
        )
    );
    return helperlcsWithTolerance(arr1, arr2, tolerance, dp, arr1.length, arr2.length);
}

const phenomesToIntArray = (phenomes) => {
    const intArray = [];
    for (const phenome of phenomes) {
        intArray.push(dictPhenomeToInt[phenome]);
    }
    return intArray;
}

export const calculateScore = (userPhenomes, expectedPhenomes, tolerance = 2) => {
    const userIntArray = phenomesToIntArray(userPhenomes);
    const expectedIntArray = phenomesToIntArray(expectedPhenomes);
    
    // Find first LCS
    const firstLCS = lcsWithTolerance(userIntArray, expectedIntArray, tolerance);
    
    // Find second LCS (after removing characters from first LCS)
    const secondLCS = lcsWithTolerance(userIntArray, expectedIntArray, tolerance);
    
    // Calculate total score based on both LCS
    const totalScore = (firstLCS + secondLCS) / (expectedIntArray.length * 2) * 100;
    return totalScore;
}




