export async function POST(request) {
    try{

        const userRole = await currentUserRole();
        const user = await getCurrentUser();

        if(userRole !== UserRole.ADMIN){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const {
  title,
  description,
  difficulty,
  tags,
  examples,
  constraints,
  testCases,
  codeSnippets,
  referenceSolutions,
} = body;

//Basic Validations
if (!title || !description || !difficulty || !testCases || !codeSnippets || !referenceSolutions) {
            return NextResponse.json({error: "Missing required fields"},
                { status: 400}
            );
        }

// Validate testcases 
if (!Array.isArray(testCases) || testCases.length === 0) {
    return NextResponse.json(
        { error: "Test cases must be a non-empty array" },
        { status: 400 }
    );
}

//Validate reference Solutions same way 
if (!referenceSolutions || typeof referenceSolutions !== 'object'){
    return NextResponse.json(
    { error: "Reference solutions must be provided for all supported languages" },
    { status: 400 }
);
}
// for all the lanuages mentioned in reference solutions run the loop:

for(const [language, solutionCode] of Object.entries(referenceSolutions)){
    // Get Judge0 Lang ID for the current language 
    const languageId = getJudge0LanguageId() 
    if(!languageId){ 
        return NextResponse.json(
            { error: `Unsupported language: ${language}` },
            { status: 400 }
        );
    }
    // adding multiple if cases to make our system more resilient 

    // Prepare Judge0 submissions for all the testcases

    const submissions = testCases.map((input, output)=> ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output
    }))

    //Submit All testcases in one batch
    const submissionsResults = await submitBatch(submissions)

    const tokens = submissionsResults.map((res) => res.token);
    // we only mapping and making a new array of tokens thats it

    const results = await pollBatchResults(tokens);

    for (let i=0; i<results.length; i++){
        const result = results[i]; 
        if (result.status.id !== 3) { //submissions is wrong if status id is not 3
        return NextResponse.json(
      {
        error: `Validation failed for ${language}`,
        testCase: {
          input: submissions[i].stdin,
          expectedOutput: submissions[i].expected_output,
          actualOutput: result.stdout,
          error: result.stderr || result.compile_output,
        },
        details: result,
      },
      { status: 400 }
    );
  }
    }
}

//step 3 save the problem to the db 
const newProblem = await db.problem.create({

    data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases, 
        codeSnippets,
        referenceSolutions,
        userId: user.id,
    }
})

return NextResponse.json({
    success: true,
    message: "Problem created successfully",
    data: newProblem,
}, {status: 201} );


        // get all the fields from the clientside
        // Basic Validations 
        // run a loop for all the languages  ---> number of testcases
        //eg. for python , javascript , etc testcases run concurrently
        // get judge0 lang id for the currentlang 
        // prepare judge0 submissions for all the testcases 

        // submit all the testcases in one batch  
        // extract tokens from responses
        
    } catch (error) {
        console.error("❌ Error creating problem:", error);
        return NextResponse.json(
            { error: "Failed to save problem into db" },
            { status: 500 }
        );

    }
}