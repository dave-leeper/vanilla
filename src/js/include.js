class IncludeNode {
    constructor(name) {
        this.name = name;
        this.children = [];
        this.parent = null;
    }
    addChild(child) {
        let node = new IncludeNode(child);
        node.parent = this;
        this.children.push(node);
        return node;
    }
    hasAncestor(ancestorName) {
        let node = this.getAncestor(ancestorName)
        return (null !== node)
    }
    getAncestor(ancestorName) {
        if (!this.parent) {return null;}
        if (this.parent.name === ancestorName) {return this.parent;}
        return this.parent.getAncestor(ancestorName);
    }
    hasDescendant(descendantName) {
        let node = this.getDescendant(descendantName)
        return (null !== node)
    }
    getDescendant(descendantName) {
        for (let node of this.children) {
            if (node.name === descendantName) { return node; }
            let descendant = node.getDescendant(descendantName);
            if (descendant) { return descendant; }
        }
        return null;
    }
    toString(prefix) {
        let result = "" + prefix + this.name + " (parent: " + this.parent?.name + ")\n";
        prefix += "\t";
        for (let node of this.children) {
            result += node.toString(prefix);
        }
        return result;
    }
}
class IncludeTree {
    constructor() {
        this.nodes = [];
    }
    addNode(node) {
        if (this.hasNode(node.name)) { return }
        this.nodes.push(node);
    }
    hasNode(name) {
        let node = this.getNodeByName(name);
        return (null !== node); 
    }
    getNodeByName(name) {
        for (let node of this.nodes) {
            if (node.name === name) { return node; }
            let descendant = node.getDescendant(name);
            if (descendant) { return descendant; }
        }
        return null;
    }
    toString(prefix) {
        let result = ""
        for (let node of this.nodes) {
            result += node.toString(prefix)
        }
        return result;
    }
}
  
  const loadIncludes = () => {
    const _loadFile = (filename, callback) => {
        fetch(filename)
            .then(response => response.text())
            .then(text => callback(text));
    };
    const _loadIncludes = (previousIncludeTree) => {
        let includes = document.getElementsByTagName('include');
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree;
        let include = includes[0];
        let src = include.attributes?.src?.value;
        let filename = include.attributes?.filename?.value;
        let node = includeTree.hasNode(filename)? includeTree.getNodeByName(filename) : new IncludeNode(filename);
        let childNode = node.addChild(src);
        includeTree.addNode(node);
        if (node.hasAncestor(src)) {
            console.error("Include tag causes infinite recursion. Include processing halted. filename: " + filename + ", src: " + src);
            return;
        }
        _loadFile(include.attributes.src.value, function(text){
            include.insertAdjacentHTML('afterend', text);
            include.remove();
            _loadIncludes(includeTree);
        });
    }
    _loadIncludes(new IncludeTree());
}

document.addEventListener("DOMContentLoaded", loadIncludes);