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
    static unpackFragment = (fragment, marker) => {
        const parent = marker.parentNode
        marker.after(fragment)
        const markup = parent.getElementsByTagName("markup");
        const style = parent.getElementsByTagName("style");
        if (!markup || 0 === markup.length) {
            console.error(`Failed to register component. Could not find markup tag.`)
            return
        }
        let nodes = []
        const length = markup[0].children.length
        for (let loop = length - 1; loop >= 0; loop--) {
            const node = markup[0].children[loop]
            nodes.push(node)
            marker.after(node)
        }
        if (style && 0 < style.length) {
            marker.before(style[0])
        }
        markup[0].remove()
        return nodes.reverse()
    }
    static registerComponent = (id, componentObject, nodes) => {
        if (!id) { return false }
        if (!document.$vanilla) { document.$vanilla = {} }
        if (!document.$vanilla.registry) { document.$vanilla.registry = new Map() }
        ;
        const node = document.querySelectorAll(`[component-id="${id}"]`)
        if (!node || 0 === node.length) {
            console.error(`Failed to register component. Could not find ${id}.`)
            return
        }
        document.$vanilla.registry.set(id, {componentObject, nodes})
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
        const length = componentInfo.nodes.length
        for (let loop = length - 1; loop >= 0; loop--) {
            const node = componentInfo.nodes[loop]
            if (marker.nextSibling){ 
                marker.parentNode.insertBefore(node, marker.nextSibling);
            } else {
                marker.parentNode.appendChild(node);
            }
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
        const length = componentInfo.nodes.length
        for (let loop = length - 1; loop >= 0; loop--) {
            const node = componentInfo.nodes[loop]
            marker.parentNode.removeChild( node );
        }
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
        let includeId = include.attributes[`include-id`]?.value
        let node = includeTree.hasNode(includeId)? includeTree.getNodeByName(includeId) : new IncludeNode(includeId)
        includeTree.addNode(node)
        includeTree.toString(``)
        console.log(`includeId ${includeId} src ${src} node.hasAncestor(src) ${node.hasAncestor(src)}`)
        if (node.hasAncestor(src)) {
            console.error(`Include tag causes infinite recursion. Include processing halted. Id of the bad include tag: ${includeId}. Include file causing recursion: ${src}.`)
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

const loadIncludeComponents = () => {
    const _validateIncudeComponentAttributes = (attributes) => {
        if (!attributes) {
            console.error(`Include-component missing required attributes 'src', 'component-id', 'component', and 'component-id'. Include-component processing halted.`)
            return false
        }

        let src = attributes.src?.value
        let componentId = attributes[`component-id`].value
        let component = attributes.component?.value
        let id = attributes[`component-id`].value

        if (!src) {
            console.error(`Include-component missing required attribute 'src'. Include-component processing halted. Id of the the bad include-component tag: ${componentId}.`)
            return false
        }
        if (!componentId) {
            console.error(`Include-component missing required attribute 'componentId'. Include-component processing halted. Include file causing recursion: ${src}.`)
            return false
        }
        if (!component) {
            console.error(`Include-component missing required attribute 'component'. Include-component processing halted. Id of the bad include-component tag: ${componentId}. Include file causing recursion: ${src}.`)
            return false
        }
        if (!id) {
            console.error(`Include-component missing required attribute 'component-id'. Include-component processing halted. Id of the bad include-component tag: ${componentId}. Include file causing recursion: ${src}.`)
            return false
        }
        return [src, componentId, component]
    }
    const _loadIncludeComponents = (previousIncludeTree) => {
        let includes = document.getElementsByTagName('include-component')
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree
        let include = includes[0]
        let [src, componentId, component, repeat] = _validateIncudeComponentAttributes(include.attributes)
        if (!src || !componentId || !component) {return}
        let node = includeTree.hasNode(componentId)? includeTree.getNodeByName(componentId) : new IncludeNode(componentId)
        includeTree.addNode(node)
        includeTree.toString(``)
        if (node.hasAncestor(src)) {
            console.error(`Include-component tag causes infinite recursion. Include-component processing halted. Id of the bad include-component tag: ${componentId}. Include file causing recursion: ${src}.`)
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
                console.error(`Include-component tag failed to create script node.`)
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
                console.error(`Failed to create component. Include-component processing halted. Component name: ${component}. Id of the bad include tag: ${componentId}. Include file causing recursion: ${src}.`)
                return
            }
            componentObject.initialize()
            VanillaComponent.wrapVars(componentObject, frag)
            VanillaComponent.wrapProps(componentObject, frag)
            componentObject.beforeMount()
            let marker = document.createElement('script')
            marker.id = `-VanillaComponent${componentId}`
            marker.type = 'text/javascript'
            include.after(marker)
            const nodes = VanillaComponent.unpackFragment(frag, marker)
        
            VanillaComponent.registerComponent(componentId, componentObject, nodes)
            componentObject.afterMount()
            include.remove()

            _loadIncludeComponents(includeTree)
        })
    }
    _loadIncludeComponents(new IncludeTree())
}

document.addEventListener(`DOMContentLoaded`, loadIncludes)
document.addEventListener(`DOMContentLoaded`, loadIncludeComponents)
