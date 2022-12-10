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
        let cleanPrefix = (prefix)? prefix : ``
        let result = `${cleanPrefix}${this.name} (parent: ${this.parent?.name})\n`
        cleanPrefix += `\t`
        for (let node of this.children) {
            result += node.toString(cleanPrefix)
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

class VanillaComponentLifecycle {
    static replaceNodeValue = (node, data, member) => {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }

            const matches = node.originalNodeValue.match(/[^{]+(?=\})/g)
            if (matches && matches.includes(member)) {
                node.nodeValue = node.originalNodeValue.replaceAll(`{${member}}`, data[member])
            }
        }
        for (let child of node.childNodes) {
            VanillaComponentLifecycle.replaceNodeValue(child, data, member)
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
            VanillaComponentLifecycle.replaceAttributeValue(child, data, member)
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
            VanillaComponentLifecycle.replaceNodeValue(fragment, componentObject.props, member)
            VanillaComponentLifecycle.replaceAttributeValue(fragment, componentObject.props, member)
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
                    VanillaComponentLifecycle.replaceNodeValue(fragment, componentObject.vars, member)
                    VanillaComponentLifecycle.replaceAttributeValue(fragment, componentObject.vars, member)
                }
            })
            VanillaComponentLifecycle.replaceNodeValue(fragment, componentObject.vars, member)
            VanillaComponentLifecycle.replaceAttributeValue(fragment, componentObject.vars, member)
        }
    }
    static compile = (html) => {
        let fragment = document.createDocumentFragment()

        fragment.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        return fragment
    }
    static registerDOMFragment = (fragmentId, DOMFragment, includeTest) => {
        if (!fragmentId) { 
            console.error(`No fragment id provided for DOM fragment registration.`)
            return false 
        }
        if (!DOMFragment) { 
            console.error(`No DOM fragment provided for DOM fragment registration.`)
            return false 
        }
        if (window?.$vanilla?.fragmentRegistry?.has(fragmentId)) { 
            console.error(`DOM Fragment ${fragmentId} is already registered.`)
            return false 
        }

        let scripts = DOMFragment.querySelectorAll('script')
        let tests = DOMFragment.querySelectorAll('test')
        let styles = DOMFragment.querySelectorAll('style')
        let markup = DOMFragment.querySelectorAll('markup')

        if (1 !== scripts.length) {
            console.error(`Fragment must contain one and only one component script tag.`)
            return false
        }
        if (1 !== markup.length) {
            console.error(`Fragment must contain one and only one component markup tag.`)
            return false
        }
        if (1 < styles.length) {
            console.error(`Fragment can contain no more than one component style tag.`)
            return false
        }
        if (includeTest) {
            if (1 < tests.length) {
                console.error(`Fragment can contain no more than one component test tag.`)
                return false
            }   
        }
        let scriptTag = document.createElement('script')

        scriptTag.type = 'text/javascript'
        scriptTag.id = `ScriptTag${fragmentId}`
        scripts[0].remove()
        try {
            eval(`new ${fragmentId}`)
            scriptTag.appendChild(document.createTextNode(``))
        } catch (e) {
            scriptTag.appendChild(document.createTextNode(scripts[0].innerText))
        }
        document.head.appendChild(scriptTag);

        if (styles.length) {
            let styleTag = document.createElement('style')

            styleTag.id = `StyleTag${fragmentId}`
            styleTag.appendChild(document.createTextNode(styles[0].innerText))
            styles[0].remove()
            document.head.appendChild(styleTag);
        }
        if (tests.length) {
            if (includeTest) {
                let testTag = document.createElement('script')
                let tests = DOMFragment.querySelectorAll('test')

                testTag.type = 'text/javascript'
                testTag.id = `TestTag${fragmentId}`
                testTag.appendChild(document.createTextNode(tests[0].innerText))
                document.head.appendChild(testTag);
            }
            tests[0].remove()
        }
        if (!window.$vanilla) { window.$vanilla = {} }
        if (!window.$vanilla.fragmentRegistry) { window.$vanilla.fragmentRegistry = new Map() }
        window.$vanilla.fragmentRegistry.set(fragmentId, DOMFragment)

        return true
    }
    static unregisterDOMFragment = (fragmentId) => {
        if (!fragmentId) { 
            console.error(`No fragment id provided for unregistration.`)
            return false 
        }
        if (!window?.$vanilla?.fragmentRegistry?.has(fragmentId)) { 
            console.error(`DOM Fragment ${fragmentId} was not in registery.`)
            return false 
        }
        let componentScriptTag = document.getElementById(`ScriptTag${fragmentId}`)
        let componentStyleTag = document.getElementById(`StyleTag${fragmentId}`)
        let componentTestTag = document.getElementById(`TestTag${fragmentId}`)
        
        if (componentScriptTag) { componentScriptTag.remove() }
        if (componentStyleTag) { componentStyleTag.remove() }
        if (componentTestTag) { componentTestTag.remove() }
        window.$vanilla.fragmentRegistry.delete(fragmentId)
        return true
    }
    static createComponentObject = (componentClass, componentObjectId, fragmentId, includeComponentElement) => {
        if (!componentClass) { 
            console.error(`No component class provided for createComponentObject.`)
            return false 
        }
        if (!componentObjectId) { 
            console.error(`No component object id provided for createComponentObject.`)
            return false 
        }
        if (!fragmentId) { 
            console.error(`No fragment id provided for createComponentObject.`)
            return false 
        }
        if (!includeComponentElement) { 
            console.error(`No includeComponentElement provided for createComponentObject.`)
            return false 
        }

        let componentObject = eval(` new ${componentClass}()`)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let fragment =  window.$vanilla.fragmentRegistry.get(fragmentId)

        if (!marker) {
            let marker = document.createElement('script')

            marker.id = markerId
            marker.type = 'text/javascript'
            includeComponentElement.parentNode.replaceChild(marker, includeComponentElement);
        }
        if (componentObject.initialize) { componentObject.initialize() }
        VanillaComponentLifecycle.wrapVars(componentObject, fragment)
        VanillaComponentLifecycle.wrapProps(componentObject, fragment)

        return componentObject
    }
    static registerComponentObject = (componentObjectID, componentObject, fragmentId) => {
        if (!componentObjectID) { 
            console.error(`No component object id provided for component object registration.`)
            return false 
        }
        if (!componentObject) { 
            console.error(`No component object provided for component object registration.`)
            return false 
        }
        if (!fragmentId) { 
            console.error(`No fragment id provided for component object registration.`)
            return false 
        }
        if (window?.$vanilla?.objectRegistry?.has(componentObjectID)) { 
            console.error(`Component object ${componentObjectID} is already registered.`)
            return false 
        }
        if (!window.$vanilla) { window.$vanilla = {} }
        if (!window.$vanilla.objectRegistry) { window.$vanilla.objectRegistry = new Map() }
        window.$vanilla.objectRegistry.set(componentObjectID, {componentObject, fragmentId, mounted: false})
        return true
    }
    static unregisterComponentObject = (componentObjectID) => {
        if (!componentObjectID) { 
            console.error(`No component object id provided for registration.`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectID)) { 
            console.error(`Component object ${componentObjectID} was not in registery.`)
            return false 
        }
        window.$vanilla.objectRegistry.delete(componentObjectID)
        return true
    }
    static mount = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`No component object id provided for mount.`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Component object ${componentObjectId} was not in registery.`)
            return false 
        }

        let componentObjectInfo = window.$vanilla.objectRegistry.get(componentObjectId)
        let fragment = window.$vanilla.fragmentRegistry.get(componentObjectInfo.fragmentId)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)

        if (!fragment) { 
            console.error(`DOM fragment ${componentObjectInfo.fragmentId} is not in registery.`)
            return false 
        }
        if (!componentObjectInfo.componentObject) { 
            console.error(`Component object ${componentObjectId} is not in registery.`)
            return false 
        }
        if (componentObjectInfo.mounted) { 
            console.error(`Component object ${componentObjectId} is already mounted.`)
            return false 
        }
        if (!marker) { 
            console.error(`Marker for ${componentObjectId} is not in DOM.`)
            return false 
        }

        let clonedFragment = fragment.cloneNode(true)
        let markup = clonedFragment.querySelector(`markup`)

        if (!markup) { 
            console.error(`Markup for ${componentObjectId} not found.`)
            return false 
        }
        if (componentObjectInfo.componentObject.beforeMount) { componentObjectInfo.componentObject.beforeMount() }
        for (let loop = markup.children.length - 1; loop >= 0; loop--) {
            let child = markup.children[loop]

            marker.after(child)
        }
        componentObjectInfo.mounted = true
        window.$vanilla.objectRegistry.set(componentObjectId, componentObjectInfo)
        if (componentObjectInfo.componentObject.afterMount) { componentObjectInfo.componentObject.afterMount() }
        return true
    }
    static unmount = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`No component object id provided for mount.`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Component object ${componentObjectId} is not in registery.`)
            return false 
        }

        let componentObjectInfo = window?.$vanilla?.objectRegistry?.get(componentObjectId)

        if (!componentObjectInfo?.componentObject) { 
            console.error(`Component object ${componentObjectId} is not in registery.`)
            return false 
        }
        if (!componentObjectInfo.mounted) { 
            console.error(`Component object ${componentObjectId} was not mounted.`)
            return false 
        }

        let fragment = window.$vanilla.fragmentRegistry.get(componentObjectInfo.fragmentId)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let markup = fragment.querySelector(`markup`)

        if (!fragment) { 
            console.error(`Fragment ${componentObjectInfo.fragmentId} is not in registery.`)
            return false 
        }
        if (!marker) { 
            console.error(`Marker for ${componentObjectId} not in DOM.`)
            return false 
        }
        if (!markup) { 
            console.error(`Markup for ${componentObjectId} not found.`)
            return false 
        }

        if (componentObjectInfo.componentObject.beforeMount) { componentObjectInfo.componentObject.beforeUnmount() }        
        for (let loop = markup.children.length - 1; loop >= 0; loop--) {
            marker.nextSibling.remove()
        }
        componentObjectInfo.mounted = false
        window.$vanilla.objectRegistry.set(componentObjectId, componentObjectInfo)
        if (componentObjectInfo.componentObject.afterMount) { componentObjectInfo.componentObject.afterUnmount() }
        return true
    }
}

class Vanilla {
    static getComponentFragment = (fragmentId) => {
        if (!fragmentId) { 
            console.error(`No component fragment id provided.`)
            return null 
        }
        if (!window?.$vanilla?.fragmentRegistry?.has(fragmentId)) { 
            console.error(`Component fragment ${fragmentId} is not registered.`)
            return null 
        }
        
        let fragment = window.$vanilla.fragmentRegistry.get(fragmentId)
        return fragment
    }
    static getComponentObject = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`No component object id provided.`)
            return null 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Component object ${componentObjectId} is not registered.`)
            return null 
        }
        
        let componentObjectInfo = window.$vanilla.objectRegistry.get(componentObjectId)
        return componentObjectInfo.componentObject
    }
}

const loadFile = async function (filename) {
    try {
        let response = await fetch(filename)

        if (!response.ok) {
            throw new Error('Network response was not OK while loading ${filename}.');
        }
        return response.text
    } catch (e) {
        console.error(`Error fetching file ${filename}.`)
        return null
    }
}

const loadIncludes = async function () {
    const _loadIncludes = async function (previousIncludeTree) {
        let includes = document.getElementsByTagName('include')
        if (0 === includes.length) {return}
        let includeTree = previousIncludeTree
        let include = includes[0]
        let src = include.attributes?.src?.value
        let includeId = include.attributes[`include-id`]?.value
        let node = includeTree.hasNode(includeId)? includeTree.getNodeByName(includeId) : new IncludeNode(includeId)
        includeTree.addNode(node)
        includeTree.toString(``)
        if (node.hasAncestor(src)) {
            console.error(`Include tag causes infinite recursion. Include processing halted. Id of the bad include tag: ${includeId}. Include file causing recursion: ${src}.`)
            return
        }
        let text = await loadFile(include.attributes.src.value)
        include.insertAdjacentHTML('afterend', text)
        include.remove()
        _loadIncludes(includeTree)
    }
    _loadIncludes(new IncludeTree())
}

const loadIncludeComponents = async function () {
    const _validateIncudeComponentAttributes = (attributes) => {
        if (!attributes) {
            console.error(`Include-component missing required attributes 'src', 'component-id', 'component', and 'component-id'. Include-component processing halted.`)
            return false
        }

        let src = attributes.src?.value
        let componentObjectId = attributes[`component-id`].value
        let component = attributes.component?.value

        if (!src) {
            console.error(`Include-component missing required attribute 'src'. Include-component processing halted. Id of the the bad include-component tag: ${componentObjectId}.`)
            return false
        }
        if (!componentObjectId) {
            console.error(`Include-component missing required attribute 'componentId'. Include-component processing halted. Include file causing recursion: ${src}.`)
            return false
        }
        if (!component) {
            console.error(`Include-component missing required attribute 'component'. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return false
        }
        if (!id) {
            console.error(`Include-component missing required attribute 'component-id'. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return false
        }
        return [src, componentObjectId, component]
    }
    const _buildIncludeTree = (includeTree, componentObjectId, src) => {
        let node = null
        
        if (includeTree.hasNode(componentObjectId)) {
            node = includeTree.getNodeByName(componentObjectId)
        } else {
            node = new IncludeNode(componentObjectId)
            includeTree.addNode(node)
        }
        if (node.hasAncestor(src)) {
            return false
        }
        node.addChild(src)
        return true
    }
    const _loadIncludeComponents = async function (previousIncludeTree) {
        let includes = document.getElementsByTagName('include-component')

        if (0 === includes.length) {return}

        let includeTree = previousIncludeTree
        let include = includes[0]
        let [src, componentObjectId, fragmentId, repeat] = _validateIncudeComponentAttributes(include.attributes)

        if (!src) {
            console.error(`Include-component tag is missing required attribute 'src'. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }
        if (!componentObjectId) {
            console.error(`Include-component tag is missing required attribute 'component-id'. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }
        if (!fragmentId) {
            console.error(`Include-component tag is missing required attribute 'component'. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }

        let nodeAddedToIncludeTree = _buildIncludeTree(includeTree, componentObjectId, src)

        if (!nodeAddedToIncludeTree) {
            console.error(`Include-component tag causes infinite recursion. Include-component processing halted. Id of the bad include-component tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }

        let text = await loadFile(include.attributes.src.value)
        let fragment = VanillaComponentLifecycle.compile(text)
        let fragmentRegistered = VanillaComponentLifecycle.registerDOMFragment(fragmentId, fragment, false)

        if (!fragmentRegistered) {
            console.error(`Failed to register component fragment. Include-component processing halted. Component name: ${fragmentId}. Id of the bad include tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }

        let componentObject = VanillaComponentLifecycle.createComponentObject(fragmentId, componentObjectId, fragmentId, include)

        if (!componentObject) {
            console.error(`Failed to create component. Include-component processing halted. Component name: ${fragmentId}. Id of the bad include tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }

        let componentObjectRegistered = VanillaComponentLifecycle.registerComponentObject(componentObjectId, componentObject, fragmentId )

        if (!componentObjectRegistered) {
            console.error(`Failed to register component object. Include-component processing halted. Component name: ${fragmentId}. Id of the bad include tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }
        
        let componentMounted = VanillaComponentLifecycle.mount(componentObjectId)

        if (!componentMounted) {
            console.error(`Failed to mount component object. Include-component processing halted. Component name: ${fragmentId}. Id of the bad include tag: ${componentObjectId}. Include file causing recursion: ${src}.`)
            return
        }

        _loadIncludeComponents(includeTree)
    }
    _loadIncludeComponents(new IncludeTree())
}

document.addEventListener(`DOMContentLoaded`, loadIncludes)
document.addEventListener(`DOMContentLoaded`, loadIncludeComponents)
