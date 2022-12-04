const assert = (isTrue, optionalDescription) => {
  if (!isTrue) {
    throw new Error(optionalDescription);
  }
}

const test = (name, description, tests) => {
  let results = []

  results.push(`\tTest: ${name} ${description}`)
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
  console.log(`Suite: ${name} ${description}`)
  for (let loop = 0; loop < testResults.length; loop++) {
    let results = testResults[loop]
    for (let loop2 = 0; loop2 < results.length; loop2++) {
      console.log(results[loop2])
    }
  }
}
