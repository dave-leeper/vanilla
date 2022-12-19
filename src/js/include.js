class IncludeNode {
    constructor(name) {
        this.name = name
        this.children = []
        this.parent = null
    }
    addChild(child) {
        let childNode = new IncludeNode(child)
        childNode.parent = this
        this.children.push(childNode)
        return childNode
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

/*
    FRAGRMENT STATE             FRAGMENT STATE                      NOTES
    (Transitions flow down)     (Transitions flow left/right)
    -------------------------   ----------------------------------  ---------------------------------------------------------
    Compile                                                         Creates document fragment from text.
    Register Dom Fragment       <--> Unregister Dom Fragment        Document fragment put in registry, script tags moved to <HEAD>.

    COMPONENT STATE             COMPONENT STATE                     NOTES
    (Transitions flow down)     (Transitions flow left/right)
    -------------------------   ----------------------------------  ---------------------------------------------------------
    Create Component Object                                         Object instantiated from the class representing the component.
                                                                    Object initialized. Vars and props are wrapped. Node values and
                                                                    attribute values are replaced for the first time.
    Register Component Object   <--> Unregister Component Object    Object placed in registery. Has a unique ID and knows the id
                                                                    of its associated fragment.
    mount                       <--> unmount                        Component placed in DOM, rendered to screen.
    update                                                          Set vars to replace node and attribute values.
*/
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
    static wrapProps = (componentFragment, componentObject) => {
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
            VanillaComponentLifecycle.replaceNodeValue(componentFragment, componentObject.props, member)
            VanillaComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.props, member)
        }
    }
    static wrapVars = (componentFragment, componentObject) => {
        let members = Object.getOwnPropertyNames(componentObject.vars)

        componentObject.vars.$varsStore = {...componentObject.vars}
        for (let member of members) {
            Object.defineProperty(componentObject.vars, member, {
                get: function() {
                    return componentObject.vars.$varsStore[member]
                },
                set: function(newValue) {
                    componentObject.vars.$varsStore[member] = newValue
                    VanillaComponentLifecycle.replaceNodeValue(componentFragment, componentObject.vars, member)
                    VanillaComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.vars, member)
                }
            })
            VanillaComponentLifecycle.replaceNodeValue(componentFragment, componentObject.vars, member)
            VanillaComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.vars, member)
        }
    }
    static compile = (html) => {
        let fragment = document.createDocumentFragment()

        fragment.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        return fragment
    }
    static registerDOMFragment = (componentClass, componentFragment, includeTest) => {
        if (!componentClass) { 
            console.error(`registerDOMFragment: No component class provided for DOM fragment registration.`)
            return false 
        }
        if (!componentFragment) { 
            console.error(`registerDOMFragment: No DOM fragment provided for DOM fragment registration.`)
            return false 
        }
        if (window?.$vanilla?.fragmentRegistry?.has(componentClass)) { 
            console.error(`registerDOMFragment: DOM Fragment ${componentClass} is already registered.`)
            return false 
        }

        let scripts = componentFragment.querySelectorAll('script')
        let tests = componentFragment.querySelectorAll('test-script')
        let styles = componentFragment.querySelectorAll('style')
        let markup = componentFragment.querySelectorAll('component-markup')

        if (1 !== scripts.length) {
            console.error(`registerDOMFragment: Fragment must contain one and only one component script tag.`)
            return false
        }
        if (1 !== markup.length) {
            console.error(`registerDOMFragment: Fragment must contain one and only one component markup tag.`)
            return false
        }
        if (1 < styles.length) {
            console.error(`registerDOMFragment: Fragment can contain no more than one component style tag.`)
            return false
        }
        if (includeTest) {
            if (1 < tests.length) {
                console.error(`registerDOMFragment: Fragment can contain no more than one component test tag.`)
                return false
            }   
        }
        let scriptTag = document.createElement('script')

        scriptTag.type = 'text/javascript'
        scriptTag.id = `ScriptTag${componentClass}`
        scripts[0].remove()
        try {
            eval(`new ${componentClass}`)
            scriptTag.appendChild(document.createTextNode(``))
        } catch (e) {
            scriptTag.appendChild(document.createTextNode(scripts[0].innerText))
        }
        document.head.appendChild(scriptTag);

        if (styles.length) {
            let styleTag = document.createElement('style')

            styleTag.id = `StyleTag${componentClass}`
            styleTag.appendChild(document.createTextNode(styles[0].innerText))
            styles[0].remove()
            document.head.appendChild(styleTag);
        }
        if (tests.length) {
            if (includeTest) {
                let tests = componentFragment.querySelectorAll('test-script')
                let testTag = document.createElement('test-script')

                testTag.type = 'text/javascript'
                testTag.id = `TestTag${componentClass}`
                testTag.appendChild(document.createTextNode(tests[0].innerText))
                document.head.appendChild(testTag);
            }
            tests[0].remove()
        }
        if (!window.$vanilla) { window.$vanilla = {} }
        if (!window.$vanilla.fragmentRegistry) { window.$vanilla.fragmentRegistry = new Map() }
        window.$vanilla.fragmentRegistry.set(componentClass, componentFragment)

        return true
    }
    static unregisterDOMFragment = (componentClass) => {
        if (!componentClass) { 
            console.error(`unregisterDOMFragment: No component class provided for unregistration.`)
            return false 
        }
        if (!window?.$vanilla?.fragmentRegistry?.has(componentClass)) { 
            console.error(`unregisterDOMFragment: DOM Fragment ${componentClass} was not in registery.`)
            return false 
        }
        let componentScriptTag = document.getElementById(`ScriptTag${componentClass}`)
        let componentStyleTag = document.getElementById(`StyleTag${componentClass}`)
        let componentTestTag = document.getElementById(`TestTag${componentClass}`)
        
        if (componentScriptTag) { componentScriptTag.remove() }
        if (componentStyleTag) { componentStyleTag.remove() }
        if (componentTestTag) { componentTestTag.remove() }
        window.$vanilla.fragmentRegistry.delete(componentClass)
        return true
    }
    static createComponentObject = (componentClass, componentObjectId, includeElement) => {
        if (!componentClass) { 
            console.error(`createComponentObject: No component class provided for createComponentObject.`)
            return false 
        }
        if (!componentObjectId) { 
            console.error(`createComponentObject: No component object id provided for createComponentObject.`)
            return false 
        }
        if (!includeElement) { 
            console.error(`createComponentObject: No includeComponentElement provided for createComponentObject.`)
            return false 
        }

        let componentObject = eval(` new ${componentClass}()`)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let componentFragment =  window.$vanilla.fragmentRegistry.get(componentClass)

        if (!marker) {
            let marker = document.createElement('script')

            marker.id = markerId
            marker.type = 'text/javascript'
            includeElement.parentNode.replaceChild(marker, includeElement);
        }
        if (includeElement.attributes && includeElement.attributes[`props`] && includeElement.attributes[`props`].value) {
            let props = JSON.parse(includeElement.attributes[`props`].value)

            componentObject.props = {...componentObject.props, ...props}
        }
        if (includeElement.attributes && includeElement.attributes[`vars`] && includeElement.attributes[`vars`].value) {
            let vars = JSON.parse(includeElement.attributes[`vars`].value)

            componentObject.vars = {...componentObject.vars, ...vars}
        }
        if (componentObject.initialize) { componentObject.initialize() }
        VanillaComponentLifecycle.wrapVars(componentFragment, componentObject)
        VanillaComponentLifecycle.wrapProps(componentFragment, componentObject)
        return componentObject
    }
    static registerComponentObject = (componentClass, componentObjectID, componentObject) => {
        if (!componentObjectID) { 
            console.error(`registerComponentObject: No component object id provided for component object registration.`)
            return false 
        }
        if (!componentObject) { 
            console.error(`registerComponentObject: No component object provided for component object registration.`)
            return false 
        }
        if (!componentClass) { 
            console.error(`registerComponentObject: No fragment id provided for component object registration.`)
            return false 
        }
        if (window?.$vanilla?.objectRegistry?.has(componentObjectID)) { 
            console.error(`Component object ${componentObjectID} is already registered.`)
            return false 
        }
        if (!window.$vanilla) { window.$vanilla = {} }
        if (!window.$vanilla.objectRegistry) { window.$vanilla.objectRegistry = new Map() }
        window.$vanilla.objectRegistry.set(componentObjectID, {componentObject: componentObject, componentClass, mounted: false})
        return true
    }
    static unregisterComponentObject = (componentObjectID) => {
        if (!componentObjectID) { 
            console.error(`unregisterComponentObject: No component object id provided for registration.`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectID)) { 
            console.error(`unregisterComponentObject: Component object ${componentObjectID} was not in registery.`)
            return false 
        }
        window.$vanilla.objectRegistry.delete(componentObjectID)
        return true
    }
    static mount = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`Mount: No component object id provided for mount.`)
            console.log(`1`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Mount: Component object ${componentObjectId} was not in registery.`)
            console.log(`2`)
            return false 
        }

        let componentObjectInfo = window.$vanilla.objectRegistry.get(componentObjectId)
        let fragment = window.$vanilla.fragmentRegistry.get(componentObjectInfo.componentClass)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)

        if (!fragment) { 
            console.error(`Mount: DOM fragment ${componentObjectInfo.componentClass} is not in registery.`)
            console.log(`3`)
            return false 
        }
        if (!componentObjectInfo.componentObject) { 
            console.error(`Mount: Component object ${componentObjectId} is not in registery.`)
            console.log(`4`)
            return false 
        }
        if (componentObjectInfo.mounted) { 
            console.error(`Mount: Component object ${componentObjectId} is already mounted.`)
            console.log(`5`)
            return false 
        }
        if (!marker) { 
            console.error(`Mount: Marker for ${componentObjectId} is not in DOM.`)
            console.log(`6`)
            return false 
        }

        let clonedFragment = fragment.cloneNode(true)
        let markup = clonedFragment.querySelector(`component-markup`)

        if (!markup) { 
            console.error(`Mount: Markup for ${componentObjectId} not found.`)
            console.log(`7`)
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
            console.error(`Unmount: No component object id provided for mount.`)
            return false 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false 
        }

        let componentObjectInfo = window?.$vanilla?.objectRegistry?.get(componentObjectId)

        if (!componentObjectInfo?.componentObject) { 
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false 
        }
        if (!componentObjectInfo.mounted) { 
            console.error(`Unmount: Component object ${componentObjectId} was not mounted.`)
            return false 
        }

        let fragment = window.$vanilla.fragmentRegistry.get(componentObjectInfo.componentClass)
        let markerId = `-VanillaComponentMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let markup = fragment.querySelector(`component-markup`)

        if (!fragment) { 
            console.error(`Unmount: Fragment ${componentObjectInfo.componentClass} is not in registery.`)
            return false 
        }
        if (!marker) { 
            console.error(`Unmount: Marker for ${componentObjectId} not in DOM.`)
            return false 
        }
        if (!markup) { 
            console.error(`Unmount: Markup for ${componentObjectId} not found.`)
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
    static getComponentFragment = (componentClass) => {
        if (!componentClass) { 
            console.error(`getComponentFragment: No component fragment id provided.`)
            return null 
        }
        if (!window?.$vanilla?.fragmentRegistry?.has(componentClass)) { 
            console.error(`getComponentFragment: Component fragment ${componentClass} is not registered.`)
            return null 
        }
        
        let fragment = window.$vanilla.fragmentRegistry.get(componentClass)
        return fragment
    }
    static getComponentObject = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`getComponentObject: No component object id provided.`)
            return null 
        }
        if (!window?.$vanilla?.objectRegistry?.has(componentObjectId)) { 
            console.error(`getComponentObject: Component object ${componentObjectId} is not registered.`)
            return null 
        }
        
        let componentObjectInfo = window.$vanilla.objectRegistry.get(componentObjectId)
        return componentObjectInfo.componentObject
    }
}

class Loader {
    static includeTree = new IncludeTree()
    static get tree() { return Loader.includeTree }
    
    static loadFile = async (filename) => {
        let response = await fetch(filename)
    
        if (!response.ok) {
            let error = `loadFile: Network response was not OK while loading ${filename}.`
    
            console.error(error)
            throw new Error(error);
        }
    
        let text = await response.text()

        return text
    }
    static updateIncludeTree = (parentName, childName) => {
        let node = null
        
        if (Loader.tree.hasNode(parentName)) {
            node = Loader.tree.getNodeByName(parentName)
        } else {
            node = new IncludeNode(parentName)
            Loader.tree.addNode(node)
        }
        if (node.hasAncestor(childName)) {
            console.error(`updateIncludeTree: Include tag causes infinite recursion. Include processing halted. Parent name is ${parentName}. Child name is ${childName}`)
            return null
        }
        let childNode = node.addChild(childName)
        return childNode
    }
    static validateIncludeAttributes = (attributes) => {
        // <include include-in="index.html" src="./header.html"></include>
        // <include include-in="index.html" src="./button.html" component-class="Button" component-id="Button1"></include>
        const badReturn = [null, null, null, null, null]

        if (!attributes) {
            console.error(`validateIncludeAttributes: Include missing required attributes 'include-in' and 'src'. Include processing halted.`)
            return badReturn
        }

        let src = attributes.src?.value
        let includeIn = attributes[`include-in`]?.value
        let componentClass = attributes[`component-class`]?.value
        let componentObjectId = attributes[`component-id`]?.value  
        let repeatAttributValue = attributes[`repeat`]?.value
        let repeat = (repeatAttributValue)? parseInt(repeatAttributValue) : 1

        if (!src) {
            console.error(`validateIncludeAttributes: Include tag missing required attribute 'src'. Include processing halted. File containing bad include tag is ${includeIn}.`)
            return badReturn
        }
        if (!includeIn) {
            console.error(`validateIncludeAttributes: Include tag missing required attribute 'include-in'. Include processing halted. Included file is ${src}.`)
            return badReturn
        }
        if (componentClass && !componentObjectId) {
            console.error(`validateIncludeAttributes: Include tag missing required attribute 'component-id'. Include processing halted. File containing bad include tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (!componentClass && componentObjectId) {
            console.error(`validateIncludeAttributes: Include tag missing required attribute 'component-class'. Include processing halted. File containing bad include tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (0 !== repeat && !repeat) {
            console.error(`validateIncludeAttributes: Include tag 'repeat' attribute is not a number. Include processing halted. File containing bad include tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (1 > repeat) {
            console.error(`validateIncludeAttributes: Include tag 'repeat' attribute must be greater than zero. Include processing halted. File containing bad include tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        return [src, includeIn, componentClass, componentObjectId, repeat]
    }
    static loadInclude = async function (include) {
        let [src, includeIn, componentClass, componentObjectId, repeat] = Loader.validateIncludeAttributes(include.attributes)

        if (!src || !includeIn) { return false }

        let nodeAddedToIncludeTree = Loader.updateIncludeTree(includeIn, src)

        if (!nodeAddedToIncludeTree) { return false }

        let text = await Loader.loadFile(include.attributes.src.value)

        for (let loop = 0; loop < repeat; loop++) {
            if (!componentClass) {
                include.insertAdjacentHTML('afterend', text)
            } else {
                let loadIncludeComponentResult = await Loader.loadIncludeComponent(text, src, includeIn, componentClass, componentObjectId, include)
                if (!loadIncludeComponentResult) { return false }
            }
        }
        include.remove()

        return true
    }
    static loadIncludeComponent = async function (text, src, includeIn, componentClass, componentObjectId, include) {
        let fragment = VanillaComponentLifecycle.compile(text)
        let fragmentRegistered = VanillaComponentLifecycle.registerDOMFragment(componentClass, fragment, false)

        if (!fragmentRegistered) {
            console.error(`loadIncludeComponent: Failed to register component fragment. Include processing halted. Component class: ${componentClass}. File containing bad include tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        let componentObject = VanillaComponentLifecycle.createComponentObject(componentClass, componentObjectId, include)

        if (!componentObject) {
            console.error(`loadIncludeComponent: Failed to create component. Include processing halted. Component class: ${componentClass}. File containing bad include tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        let componentObjectRegistered = VanillaComponentLifecycle.registerComponentObject(componentClass, componentObjectId, componentObject)

        if (!componentObjectRegistered) {
            console.error(`loadIncludeComponent: Failed to register component object. Include processing halted. Component class: ${componentClass}. File containing bad include tag is ${includeIn}. Include file is ${src}.`)
            return false
        }
        
        let componentMounted = VanillaComponentLifecycle.mount(componentObjectId)

        if (!componentMounted) {
            console.error(`loadIncludeComponent: Failed to mount component object ${componentObjectId}. Include processing halted. File containing bad include tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        return true
    }
    static loadIncludes = async function () {
        let includes = document.getElementsByTagName('include')

        if (0 === includes.length) { return }
        for (let include of includes) {
            let result = await Loader.loadInclude(include)
            if (!result) { return }
        }
        // Includes can contain includes.
        await Loader.loadIncludes()
    }
    static registerCustomTags = function () {
        customElements.define('vanilla-component', VanillaComponent, { extends: `div` });
        customElements.define('test-srcipt', TestScript, { extends: `script` });
        customElements.define('component-markup', ComponentMarkup, { extends: `div` });
    }
}

class VanillaComponent extends HTMLElement {
    constructor() {
        super()
        this.style.display = `none`
    }
}

class TestScript extends HTMLScriptElement {
    constructor() {super()}
}

class ComponentMarkup extends HTMLElement {
    constructor() {
        super()
        this.style.display = `none`
    }
}

document.addEventListener(`DOMContentLoaded`, () => { Loader.registerCustomTags(); Loader.loadIncludes() })
