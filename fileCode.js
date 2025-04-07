const fs = require('fs');

function simplifyJson(inputJson) {
    const simplifiedResults = [];

    inputJson.results.forEach(result => {
        // Ensure alternatives exist and are not empty
        if (result.alternatives && result.alternatives.length > 0) {
            const firstAlternative = result.alternatives[0];

            // Ensure 'words' exists in the alternative and is not empty
            if (firstAlternative.words && firstAlternative.words.length > 0) {
                const simplifiedResult = {
                    alternatives: [
                        {
                            transcript: firstAlternative.transcript
                        }
                    ],
                    resultStartTime: firstAlternative.words[0].startTime,
                    resultEndTime: result.resultEndTime || null // Use fallback if 'resultEndTime' is not present
                };
                simplifiedResults.push(simplifiedResult);
            }
        }
    });

    return simplifiedResults;
}
let data1={}
fs.readFile('input.json', '', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    try {
        data1=JSON.parse(data)
        const simplifiedJsonString = JSON.stringify(simplifyJson(data1.transcriptions[0].result), null, 2);
        console.log(JSON.parse(simplifiedJsonString))

        let inputObject = {
            "transcriptions": JSON.parse(simplifiedJsonString),
            "log_id": data1.transcriptions[0].log_id,
            "tasks": data1.tasks,
        }

        fs.writeFile('output.json', JSON.stringify(inputObject), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('File has been written successfully!');
            }
        });
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
})






