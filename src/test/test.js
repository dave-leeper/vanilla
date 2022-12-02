function it (name, description, test) {
  console.log(`${name} ${description}`)
  try {
    test()
    console.log(`\t${name} passed.`) 
  } catch (e) {
    console.log(`\t${name} failed.`) 
  }
}

function assert(isTrue) {
  if (!isTrue) {
    throw new Error();
  }
}