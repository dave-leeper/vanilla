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
    hasChild(name) {
        let node = this.getChildByName(name);
        return (null !== node); 
    }
    getChildByName(name) {
        for (let node of this.children) {
            if (node.name === name) { return node; }
        }
        return null;
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
        includeTree.addNode(node);
        if (node.hasAncestor(src)) {
            console.error("Include tag causes infinite recursion. Include processing halted. File containg the bad include tag: " + filename + ". Include file causing recursion: " + src);
            return;
        }
        _loadFile(include.attributes.src.value, function(text){
            include.insertAdjacentHTML('afterend', text);
            include.remove();
            _loadIncludes(includeTree);
        });
    }
    const _validateVIncudeAttributes = (attributes) => {
        let src = attributes?.src?.value;
        let filename = attributes?.filename?.value;
        let component = attributes?.component?.value;
        let id = attributes?.id?.value;

        if (!src) {
            console.error("V-include missing required attribute 'src'. V-include processing halted. File containg the bad include tag: " + filename + ".");
            return false;
        }
        if (!filename) {
            console.error("V-include missing required attribute 'filename'. V-include processing halted. Include file causing recursion: " + src);
            return false;
        }
        if (!component) {
            console.error("V-include missing required attribute 'component'. V-include processing halted. File containg the bad include tag: " + filename + ". Include file causing recursion: " + src + ".");
            return false;
        }
        return [src, filename, component, id]
    };
    const _replaceNodeValue = (node, vars, member) => {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }

            const matches = node.originalNodeValue.match(/[^{]+(?=\})/g)
            if (matches && matches.includes(member)) {
                node.nodeValue = node.originalNodeValue.replaceAll(`{${member}}`, vars[member])
            }
        }
        for (let child of node.childNodes) {
            _replaceNodeValue(child, vars, member)
        }
    }
    const _replaceAttributeValue = (node, vars, member) => {
        if (node.attributes) {
            for (const attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
                const matches = attr.originalAttributeValue.match(/[^{]+(?=\})/g)
                if (matches && matches.includes(member)) {
                    attr.value = attr.originalAttributeValue.replaceAll(`{${member}}`, vars[member])
                }
            }
        }
        for (let child of node.childNodes) {
            _replaceAttributeValue(child, vars, member)
        }
    }
    const _wrapVars = (componentObject, fragment) => {
        let members = Object.getOwnPropertyNames(componentObject.vars);

        componentObject.vars.___varsStore___ = {...componentObject.vars}
        for (let member of members) {
            Object.defineProperty(componentObject.vars, member, {
                get: function() {
                    return componentObject.vars.___varsStore___[member];
                },
                set: function(newValue) {
                    componentObject.vars.___varsStore___[member] = newValue;
                    _replaceNodeValue(fragment, componentObject.vars, member)
                    _replaceAttributeValue(fragment, componentObject.vars, member)
                }
            })
            _replaceNodeValue(fragment, componentObject.vars, member)
            _replaceAttributeValue(fragment, componentObject.vars, member)
        }
    }
    const _registerComponent = (id, componentObject) => {
        if (!id) { return false }
        if (!document.___vanilla___) { document.___vanilla___ = {} }
        if (!document.___vanilla___.registry) { document.___vanilla___.registry = new Map(); }
        document.___vanilla___.registry.set(id, componentObject)
        const button = document.___vanilla___.registry.get(id)
        return true
    }
    const _loadVIncludes = (previousIncludeTree) => {
        let includes = document.getElementsByTagName('v-include');
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree;
        let include = includes[0];
        let [src, filename, component, id] = _validateVIncudeAttributes(include.attributes)
        if (!src || !filename || !component) {return}
        let node = includeTree.hasNode(filename)? includeTree.getNodeByName(filename) : new IncludeNode(filename);
        let childNode = node.addChild(src);
        includeTree.addNode(node);
        if (node.hasAncestor(src)) {
            console.error("V-include tag causes infinite recursion. V-include processing halted. File containg the bad include tag: " + filename + ". Include file causing recursion: " + src + ".");
            return;
        }
        _loadFile(include.attributes.src.value, function(text){
            var frag = document.createDocumentFragment();

            frag.append(...new DOMParser().parseFromString(text, "text/html").body.childNodes);
            const scripts = frag.querySelectorAll("script")
            try {
                var script_tag = document.createElement('script');
                script_tag.type = 'text/javascript';
                script_tag.appendChild(document.createTextNode(scripts[0].innerText));
                include.after(script_tag);
            } catch (e) {
                console.error(`V-include tag failed to create script node.`);
                return;
            }
            for (let scriptNode of scripts){
                scriptNode.remove()
            }
            let componentObject = eval(` new ${component}()`);
            if (!componentObject) {
                console.error("Failed to create component. V-include processing halted. Component name: " + component + ". File containg the bad include tag: " + filename + ". Include file causing recursion: " + src + ".");
                return;
            }
            _registerComponent(id, componentObject)
            _wrapVars(componentObject, frag)
            
            componentObject.initialize();
            componentObject.beforeMount();
            include.after(frag);
            include.remove();
            componentObject.afterMount();
            _loadVIncludes(includeTree);
        });
    }
    _loadIncludes(new IncludeTree());
    _loadVIncludes(new IncludeTree());
}

document.addEventListener("DOMContentLoaded", loadIncludes);
