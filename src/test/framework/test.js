const assert = (isTrue, optionalDescription) => {
  if (!isTrue) {
    throw new Error(optionalDescription);
  }
}

const it = (name, description, tests) => {
  let results = []

  results.push(`\t${name} ${description}`)
  try {
    for (let loop = 0; loop < tests.length; loop++) {
      tests[loop]()
    }
    results.push(`\t\t${name} passed.`)
  } catch (e) {
    results.push(`\t\t${name} failed. ${e.message}`)
  }
  return results
}

const suite = (name, description, testResults) => {
  console.log(`${name} ${description}`)
  for (let loop = 0; loop < testResults.length; loop++) {
    console.log(testResults[loop])
  }
}
