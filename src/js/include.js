class IncludeNode {
    constructor(name) {
        this.name = name
        this.children = []
        this.parent = null
    }
    addChild(child) {
        let node = new IncludeNode(child)
        node.parent = this
        this.children.push(node)
        return node
    }
    hasChild(name) {
        let node = this.getChildByName(name)
        return (null !== node) 
    }
    getChildByName(name) {
        for (let node of this.children) {
            if (node.name === name) { return node }
        }
        return null
    }
    hasAncestor(ancestorName) {
        let node = this.getAncestor(ancestorName)
        return (null !== node)
    }
    getAncestor(ancestorName) {
        if (!this.parent) {return null}
        if (this.parent.name === ancestorName) {return this.parent}
        return this.parent.getAncestor(ancestorName)
    }
    hasDescendant(descendantName) {
        let node = this.getDescendant(descendantName)
        return (null !== node)
    }
    getDescendant(descendantName) {
        for (let node of this.children) {
            if (node.name === descendantName) { return node }
            let descendant = node.getDescendant(descendantName)
            if (descendant) { return descendant }
        }
        return null
    }
    toString(prefix) {
        let result = `${prefix}${this.name} (parent: ${this.parent?.name})\n`
        prefix += `\t`
        for (let node of this.children) {
            result += node.toString(prefix)
        }
        return result
    }
}
class IncludeTree {
    constructor() {
        this.nodes = []
    }
    addNode(node) {
        if (this.hasNode(node.name)) { return }
        this.nodes.push(node)
    }
    hasNode(name) {
        let node = this.getNodeByName(name)
        return (null !== node) 
    }
    getNodeByName(name) {
        for (let node of this.nodes) {
            if (node.name === name) { return node }
            let descendant = node.getDescendant(name)
            if (descendant) { return descendant }
        }
        return null
    }
    toString(prefix) {
        let result = ``
        for (let node of this.nodes) {
            result += node.toString(prefix)
        }
        return result
    }
}

class VanillaComponent {
    static replaceNodeValue = (node, data, member) => {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }

            const matches = node.originalNodeValue.match(/[^{]+(?=\})/g)
            if (matches && matches.includes(member)) {
                node.nodeValue = node.originalNodeValue.replaceAll(`{${member}}`, data[member])
            }
        }
        for (let child of node.childNodes) {
            VanillaComponent.replaceNodeValue(child, data, member)
        }
    }
    static replaceAttributeValue = (node, data, member) => {
        if (node.attributes) {
            for (const attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
                const matches = attr.originalAttributeValue.match(/[^{]+(?=\})/g)
                if (matches && matches.includes(member)) {
                    attr.value = attr.originalAttributeValue.replaceAll(`{${member}}`, data[member])
                }
            }
        }
        for (let child of node.childNodes) {
            VanillaComponent.replaceAttributeValue(child, data, member)
        }
    }
    static wrapProps = (componentObject, fragment) => {
        let members = Object.getOwnPropertyNames(componentObject.props)

        componentObject.props.$propsStore = {...componentObject.props}
        for (let member of members) {
            Object.defineProperty(componentObject.props, member, {
                get: function() {
                    return componentObject.props.$propsStore[member]
                },
                set: function(newValue) {
                }
            })
            VanillaComponent.replaceNodeValue(fragment, componentObject.props, member)
            VanillaComponent.replaceAttributeValue(fragment, componentObject.props, member)
        }
    }
    static wrapVars = (componentObject, fragment) => {
        let members = Object.getOwnPropertyNames(componentObject.vars)

        componentObject.vars.$varsStore = {...componentObject.vars}
        for (let member of members) {
            Object.defineProperty(componentObject.vars, member, {
                get: function() {
                    return componentObject.vars.$varsStore[member]
                },
                set: function(newValue) {
                    componentObject.vars.$varsStore[member] = newValue
                    VanillaComponent.replaceNodeValue(fragment, componentObject.vars, member)
                    VanillaComponent.replaceAttributeValue(fragment, componentObject.vars, member)
                }
            })
            VanillaComponent.replaceNodeValue(fragment, componentObject.vars, member)
            VanillaComponent.replaceAttributeValue(fragment, componentObject.vars, member)
        }
    }
    static registerComponent = (id, componentObject) => {
        if (!id) { return false }
        if (!document.$vanilla) { document.$vanilla = {} }
        if (!document.$vanilla.registry) { document.$vanilla.registry = new Map() }
        const node = document.getElementById(id)
        if (!node) {
            console.error(`Failed to register component. Could not find ${id}.`)
            return
        }
        document.$vanilla.registry.set(id, {componentObject, node})
        return true
    }
    static mountComponent = (id) => {
        const componentInfo = document.$vanilla.registry.get(id)
        if (!componentInfo) {
            console.error(`Failed to mount component. Could not find ${id}.`)
            return
        }
        const marker = document.getElementById(`-VanillaComponent${id}`)
        if (!marker) {
            console.error(`Failed to mount component. Could not find DOM location of ${id}.`)
            return
        }
        componentInfo.componentObject.beforeMount()
        if (marker.nextSibling){ 
            marker.parentNode.insertBefore(componentInfo.node, marker.nextSibling);
            console.log(`insertBefore`)
        } else {
            marker.parentNode.appendChild(componentInfo.node);
            console.log(`appendChild`)

        }
        componentInfo.componentObject.afterMount()
    }
    static unmountComponent = (id) => {
        const componentInfo = document.$vanilla.registry.get(id)
        if (!componentInfo) {
            console.error(`Failed to unmount component. Could not find ${id}.`)
            return
        }
        const marker = document.getElementById(`-VanillaComponent${id}`)
        if (!marker) {
            console.error(`Failed to unmount component. Could not find DOM location of ${id}.`)
            return
        }
        componentInfo.componentObject.beforeUnmount()
        marker.parentNode.removeChild( marker.nextSibling );
        componentInfo.componentObject.afterUnmount()
    }
}

const loadFile = (filename, callback) => {
    fetch(filename)
        .then(response => response.text())
        .then(text => callback(text))
}

const loadIncludes = () => {
    const _loadIncludes = (previousIncludeTree) => {
        let includes = document.getElementsByTagName('include')
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree
        let include = includes[0]
        let src = include.attributes?.src?.value
        let thisfile = include.attributes?.thisfile?.value
        let node = includeTree.hasNode(thisfile)? includeTree.getNodeByName(thisfile) : new IncludeNode(thisfile)
        includeTree.addNode(node)
        if (node.hasAncestor(src)) {
            console.error(`Include tag causes infinite recursion. Include processing halted. File containg the bad include tag: ${thisfile}. Include file causing recursion: ${src}.`)
            return
        }
        loadFile(include.attributes.src.value, function(text){
            include.insertAdjacentHTML('afterend', text)
            include.remove()
            _loadIncludes(includeTree)
        })
    }
    _loadIncludes(new IncludeTree())
}

const loadVIncludes = () => {
    const _validateVIncudeAttributes = (attributes) => {
        let src = attributes?.src?.value
        let thisfile = attributes?.thisfile?.value
        let component = attributes?.component?.value
        let id = attributes?.id?.value

        if (!src) {
            console.error(`V-include missing required attribute 'src'. V-include processing halted. File containing the bad include tag: ${thisfile}.`)
            return false
        }
        if (!thisfile) {
            console.error(`V-include missing required attribute 'thisfile'. V-include processing halted. Include file causing recursion: ${src}.`)
            return false
        }
        if (!component) {
            console.error(`V-include missing required attribute 'component'. V-include processing halted. File containing the bad include tag: ${thisfile}. Include file causing recursion: ${src}.`)
            return false
        }
        return [src, thisfile, component, id]
    }
    const _loadVIncludes = (previousIncludeTree) => {
        let includes = document.getElementsByTagName('v-include')
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree
        let include = includes[0]
        let [src, thisfile, component, id, repeat] = _validateVIncudeAttributes(include.attributes)
        if (!src || !thisfile || !component) {return}
        let node = includeTree.hasNode(thisfile)? includeTree.getNodeByName(thisfile) : new IncludeNode(thisfile)
        includeTree.addNode(node)
        if (node.hasAncestor(src)) {
            console.error(`V-include tag causes infinite recursion. V-include processing halted. File containing the bad include tag: ${thisfile}. Include file causing recursion: ${src}.`)
            return
        }
        loadFile(include.attributes.src.value, function(text){
            var frag = document.createDocumentFragment()

            frag.append(...new DOMParser().parseFromString(text, `text/html`).body.childNodes)
            const scripts = frag.querySelectorAll(`script`)
            const tests = frag.querySelectorAll(`test`)
            try {
                var script_tag = document.createElement('script')
                script_tag.type = 'text/javascript'
                script_tag.appendChild(document.createTextNode(scripts[0].innerText))
                include.after(script_tag)
            } catch (e) {
                console.error(`V-include tag failed to create script node.`)
                return
            }
            for (let scriptNode of scripts){
                scriptNode.remove()
            }
            for (let testNode of tests){
                testNode.remove()
            }
            
            let componentObject = eval(` new ${component}()`)
            if (!componentObject) {
                console.error(`Failed to create component. V-include processing halted. Component name: ${component}. File containing the bad include tag: ${thisfile}. Include file causing recursion: ${src}.`)
                return
            }
            componentObject.initialize()
            VanillaComponent.wrapVars(componentObject, frag)
            VanillaComponent.wrapProps(componentObject, frag)
            componentObject.beforeMount()
            include.after(frag)
            let marker = document.createElement('script')
            marker.id = `-VanillaComponent${id}`
            marker.type = 'text/javascript'
            include.after(marker)
            
            VanillaComponent.registerComponent(id, componentObject)
            componentObject.afterMount()
            include.remove()

            _loadVIncludes(includeTree)
        })
    }
    _loadVIncludes(new IncludeTree())
}

document.addEventListener(`DOMContentLoaded`, loadIncludes)
document.addEventListener(`DOMContentLoaded`, loadVIncludes)
