import { calculateScore } from './scoreCalculator.js';

// Test cases for phoneme scoring with longer sequences
const testCases = [
    {
        name: "Perfect match with long sequence",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
    },
    {
        name: "Few mismatches in long sequence",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['AA1', 'B', 'CH', 'DH', 'EH0', 'F', 'G', 'HH', 'IH1', 'JH', 'K', 'L', 'M', 'N', 'NG'],
    },
    {
        name: "Multiple stress level variations",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['AA1', 'B', 'CH', 'D', 'EH2', 'F', 'G', 'HH', 'IH1', 'JH', 'K', 'L', 'M', 'N', 'NG'],
    },
    {
        name: "Different phonemes with similar sounds",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['AA0', 'P', 'SH', 'T', 'EH0', 'V', 'K', 'HH', 'IH0', 'CH', 'G', 'R', 'M', 'N', 'NG'],
    },
    {
        name: "Completely different sequence",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['ZH', 'W', 'Y', 'TH', 'UH0', 'UW1', 'OY2', 'ER0', 'AW1', 'AY2', 'OW0', 'EY1', 'AO2', 'AE1', 'AH0'],
    },
    {
        name: "Long sequence with tolerance test",
        userPhenomes: ['AA0', 'B', 'CH', 'D', 'EH0', 'F', 'G', 'HH', 'IH0', 'JH', 'K', 'L', 'M', 'N', 'NG'],
        expectedPhenomes: ['AA1', 'P', 'SH', 'T', 'EH2', 'V', 'K', 'HH', 'IH1', 'CH', 'G', 'R', 'M', 'N', 'NG'],
    }
];

// Run tests
console.log("Running Score Calculator Tests with Long Sequences:");
console.log("------------------------------------------------");

testCases.forEach((testCase, index) => {
    const score = calculateScore(testCase.userPhenomes, testCase.expectedPhenomes);
    const passed = Math.abs(score - testCase.expectedScore) < 0.01;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`User Phenomes: ${testCase.userPhenomes.join(', ')}`);
    console.log(`Expected Phenomes: ${testCase.expectedPhenomes.join(', ')}`);
    console.log(`Calculated Score: ${score.toFixed(2)}%`);
    console.log(`Status: ${passed ? 'PASSED' : 'FAILED'}`);
    console.log("------------------------------------------------");
}); 