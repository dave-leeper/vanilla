const assert = (isTrue, optionalDescription) => {
  if (!isTrue) {
    throw new Error(optionalDescription);
  }
}

const test = (name, description, tests) => {
  let results = []
  let result = {
    name,
    description,
    passed: false,
    duration: 0
  }
  try {
    for (let loop = 0; loop < tests.length; loop++) {
      let start = Date.now()
      tests[loop]()
      result.duration = Date.now() - start
      result.passed = true
      results.push(result)
    }
  } catch (e) {
    results.push(result)
  }
  return results
}

const suite = (name, description, testResults) => {
  let suiteText = `Suite: ${name} ${description}`
  let suiteDiv = document.createElement('div')
  let suitePassed = true

  for (let loop = 0; loop < testResults.length; loop++) {
    let testResultArray = testResults[loop]
    for (let loop2 = 0; loop2 < testResultArray.length; loop2++) {
      let testResult = testResultArray[loop2]
      if (!testResult.passed) {
        suitePassed = false
        break
      }
    }
  }

  let suiteTextColor = suitePassed? "green-7" : "red-f"
  suiteDiv.id = `Suite${name}`
  suiteDiv.className = `flex-col caption-1 ${suiteTextColor}`
  suiteDiv.innerText = suiteText
  document.getElementById(`TextTestingResults`).appendChild(suiteDiv);
  console.log(suiteText)
  for (let loop = 0; loop < testResults.length; loop++) {
    let results = testResults[loop]
    for (let loop2 = 0; loop2 < results.length; loop2++) {
      let testTextColor = results[loop2].passed? "green-7" : "red-f"
      let testWrapperDiv = document.createElement('div')
      testWrapperDiv.id = `TestWrapper${results[loop2].name}`
      testWrapperDiv.className = `flex-row caption-2 ${testTextColor}`
      suiteDiv.appendChild(testWrapperDiv);
      
      let testNameDiv = document.createElement('div')
      testNameDiv.id = `TestName${results[loop2].name}`
      testNameDiv.className = `margin-l-10 ${testTextColor}`
      testNameDiv.innerText = results[loop2].name
      testWrapperDiv.appendChild(testNameDiv);

      let testDescriptionDiv = document.createElement('div')
      testDescriptionDiv.id = `TestDescription${results[loop2].name}`
      testDescriptionDiv.className = `margin-l-10 ${testTextColor}`
      testDescriptionDiv.innerText = results[loop2].description
      testWrapperDiv.appendChild(testDescriptionDiv);

      let testDurationDiv = document.createElement('div')
      testDurationDiv.id = `TestDuration${results[loop2].name}`
      testDurationDiv.className = `margin-l-10 ${testTextColor}`
      testDurationDiv.innerText = "" + results[loop2].duration + "ms"
      testWrapperDiv.appendChild(testDurationDiv);

      let testPassedDiv = document.createElement('div')
      testPassedDiv.id = `TestPassed${results[loop2].name}`
      testPassedDiv.className = `margin-l-10 ${testTextColor}`
      testPassedDiv.innerText = results[loop2].passed? "Passed" : "Failed"
      testWrapperDiv.appendChild(testPassedDiv);

      console.log(results[loop2])
    }
  }
}
