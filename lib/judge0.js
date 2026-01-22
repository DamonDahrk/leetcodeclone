export function getJudge0LangId(language) {
const languageMap = {
    "PYTHON": 71,
    "JAVASCRIPT": 63,
    "JAVA": 62,
    "CPP": 54,
    "GO": 60,
};
return languageMap[language.toUpperCase()];
}

export async function submitBatch(submissions) {
const {data} = await axios.post( 
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
)

console.log("Judge0 Batch Submission Response:", data);
return data;
}

export async function pollBatchResults(tokens) {
    while(true){
        const {data} = await axios.get(
            `${process.env.JUDGE0_API_URL}/submissions/batch`,
            {
                params: {
                    tokens: tokens.join(","), 
                    base64_encoded: false,
                },
            }
        ); 
        console.log(data);
        const results = data.submissions;

        const isAllDone = results.every(
            (r)=>r.status.id !== 1 && 
        r.status.id !== 2) // get all the results where status id is not 1 or 2 

        if(isAllDone) return results; 

        await sleep(1000) // wait for 1 second before polling again so we dont get ddosed

        
         

    }
} // passing the tokens as a comma separated string 

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));