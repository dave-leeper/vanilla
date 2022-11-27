const loadIncludes = () => {
    let includes = document.getElementsByTagName('include');
    /*
    for(var i=0; i<includes.length; i++){
        let include = includes[i];
        loadFile(include.attributes.src.value, function(text){
            include.insertAdjacentHTML('afterend', text);
            include.remove();
        });
    }
    */
   if (0 === includes.length) {return}
    let include = includes[0];
    loadFile(include.attributes.src.value, function(text){
        include.insertAdjacentHTML('afterend', text);
        include.remove();
        loadIncludes();
    });
}

const loadFile = (filename, callback) => {
    fetch(filename).then(response => response.text()).then(text => callback(text));
}

document.addEventListener("DOMContentLoaded", loadIncludes);