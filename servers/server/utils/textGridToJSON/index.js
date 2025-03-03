import fs from 'fs/promises';

async function parseTextGrid(text) {
    const lines = text.split('\n').map(line => line.trim());
    let json = {
        fileType: "ooTextFile",
        objectClass: "TextGrid",
        xmin: 0,
        xmax: 0,
        tiers: []
    };

    let currentTier = null;
    let interval = null;
    let insideIntervals = false;

    for (let line of lines) {
        if (line.startsWith('xmin = ')) json.xmin = parseFloat(line.split('=')[1].trim());
        if (line.startsWith('xmax = ')) json.xmax = parseFloat(line.split('=')[1].trim());

        if (line.startsWith('item [')) {
            if (currentTier) json.tiers.push(currentTier);
            currentTier = { class: "", name: "", xmin: 0, xmax: 0, intervals: [] };
            insideIntervals = false;
        }

        if (line.startsWith('class = ')) currentTier.class = line.split('=')[1].trim().replace(/"/g, '');
        if (line.startsWith('name = ')) currentTier.name = line.split('=')[1].trim().replace(/"/g, '');
        if (line.startsWith('xmin = ') && currentTier && !insideIntervals) currentTier.xmin = parseFloat(line.split('=')[1].trim());
        if (line.startsWith('xmax = ') && currentTier && !insideIntervals) currentTier.xmax = parseFloat(line.split('=')[1].trim());

        if (line.startsWith('intervals: size = ')) insideIntervals = true;

        if (insideIntervals && line.startsWith('xmin = ')) {
            interval = { xmin: parseFloat(line.split('=')[1].trim()) };
        }

        if (insideIntervals && line.startsWith('xmax = ')) {
            interval.xmax = parseFloat(line.split('=')[1].trim());
        }

        if (insideIntervals && line.startsWith('text = ')) {
            interval.text = line.split('=')[1].trim().replace(/"/g, '');
            currentTier.intervals.push(interval);
        }
    }

    if (currentTier) json.tiers.push(currentTier);

    return json;
}

export default async function convertTextGridToJSON() {
    try {
        const data = await fs.readFile('./utils/textGridToJSON/audio1.TextGrid', 'utf8');
        const jsonData = await parseTextGrid(data);
        await fs.writeFile('./utils/textGridToJSON/output.json', JSON.stringify(jsonData, null, 2));
        console.log('JSON file has been saved.');
        return { code: 200, data: jsonData };
    } catch (error) {
        console.error('Error:', error);
        return { code: 400, error: 'Error processing the file' };
    }
}

export async function getScore(userPhones, expectedPhones){
    const totalPoints = 0;
    
}
