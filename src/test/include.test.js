document.addEventListener('DOMContentLoaded', async () => {
suite(`Test IncludeNode`, `Ensure IncludeNode is working.`, [
    await test (`Create`, `Ensure IncludeNode objects are properly created.`, [async () => {
        let includeNode = new IncludeNode(`TestIncludeNode`)
        let results = []

        assert(includeNode,                                                 `includeNode created.`, results)
        assert(includeNode.name == `TestIncludeNode`,                       `includeNode name set.`, results)
        assert(includeNode.children !== undefined,                          `includeNode children not undefined.`, results)
        assert(includeNode.children !== null,                               `includeNode children not null.`, results)
        assert(includeNode.children.length === 0,                           `includeNode children array is empty.`, results)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`, results)

        return results
    }]),
    await test (`Add child nodes`, `Ensure adding child nodes works correctly.`, [async () => {
        let includeNode = new IncludeNode(`TestIncludeNode`)
        let results = []

        includeNode.addChild(`TestIncludeNodeChild`)
        assert(includeNode.children.length === 1,                           `includeNode children has one child.`, results)
        assert(includeNode.children[0].name === `TestIncludeNodeChild`,     `includeNode child is named TestIncludeNodeChild.`, results)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`, results)
        assert(includeNode.children[0].parent === includeNode,              `Child's parent is includeNode.`, results)
        assert(includeNode.hasChild(`TestIncludeNodeChild`),                `includeNode has child TestIncludeNodeChild.`, results)
        assert(includeNode.getChildByName(`TestIncludeNodeChild`).name === `TestIncludeNodeChild`,
                                                                            `includeNode can return child node object by name.`, results)

        return results                                                                    
    }]),
    await test (`Ancestors`, `Ensure ancestor nodes works correctly.`, [async () => {
        let includeNode = new IncludeNode(`TestIncludeNode`)
        let results = []

        includeNode.addChild(`TestIncludeNodeChild`)
        includeNode.children[0].addChild(`TestIncludeNodeGrandchild`)
        const child = includeNode.children[0]
        const grandchild = child.children[0]

        assert(includeNode.children.length === 1,                           `includeNode children has one child.`, results)
        assert(includeNode.children[0].name ===                             `TestIncludeNodeChild`, `includeNode child is named TestIncludeNodeChild.`, results)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`, results)
        assert(includeNode.children[0].parent === includeNode,              `Child's parent is includeNode.`, results)
        assert(includeNode.hasChild(`TestIncludeNodeChild`),                `includeNode has child TestIncludeNodeChild.`, results)
        assert(includeNode.getChildByName(`TestIncludeNodeChild`).name === `TestIncludeNodeChild`,
                                                                            `includeNode can return child node object by name.`, results)
        assert(child.children.length === 1,                                 `TestIncludeNodeChild children has one child.`, results)
        assert(child.children[0].name ===                                   `TestIncludeNodeGrandchild`, `TestIncludeNodeChild child is named TestIncludeNodeGrandchild.`, results)
        assert(child.parent === includeNode,                                `TestIncludeNodeChild parent is TestIncludeNode.`, results)
        assert(child.children[0].parent === child,                          `Grandchild's parent is TestIncludeNodeChild.`, results)
        assert(child.hasChild(`TestIncludeNodeGrandchild`),                 `TestIncludeNodeChild has child TestIncludeNodeGrandchild.`, results)
        assert(child.getChildByName(`TestIncludeNodeGrandchild`).name === `TestIncludeNodeGrandchild`,
                                                                            `TestIncludeNodeChild can return child node object by name.`, results)
        assert(grandchild.children.length === 0,                            `TestIncludeNodeGrandchild children has no children.`, results)
        assert(grandchild.parent === child,                                 `TestIncludeNodeGrandchild parent is TestIncludeNodeChild.`, results)
        assert(grandchild.hasAncestor(`TestIncludeNodeChild`),              `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`, results)
        assert(grandchild.hasAncestor(`TestIncludeNode`),                   `TestIncludeNodeGrandchild has ancestor TestIncludeNode.`, results)
        assert(grandchild.getAncestor(`TestIncludeNode`) === includeNode,   `TestIncludeNodeGrandchild returns ancestor TestIncludeNodeChild.`, results)
        assert(grandchild.getAncestor(`TestIncludeNodeChild`) === child,    `TestIncludeNodeGrandchild returns ancestor TestIncludeNodeChild.`, results)
        assert(child.hasAncestor(`TestIncludeNode`),                        `TestIncludeNodeChild has ancestor TestIncludeNode.`, results)
        assert(child.getAncestor(`TestIncludeNode`) === includeNode,        `TestIncludeNodeChild returns ancestor TestIncludeNode.`, results)

        return results                                                                    
    }]),
    await test (`Descendants`, `Ensure descendant nodes works correctly.`, [async () => {
        let includeNode = new IncludeNode(`TestIncludeNode`)
        let results = []

        includeNode.addChild(`TestIncludeNodeChild`)
        includeNode.children[0].addChild(`TestIncludeNodeGrandchild`)
        const child = includeNode.children[0]
        const grandchild = child.children[0]

        assert(includeNode.hasDescendant(`TestIncludeNodeChild`),           `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`, results)
        assert(includeNode.hasDescendant(`TestIncludeNodeGrandchild`),      `TestIncludeNodeGrandchild has ancestor TestIncludeNode.`, results)
        assert(includeNode.getDescendant(`TestIncludeNodeChild`) === child, `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`, results)
        assert(includeNode.getDescendant(`TestIncludeNodeGrandchild`) === grandchild,  
                                                                            `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`, results)

        return results                                                                    
    }]),
])

suite(`Test IncludeTree`, `Ensure IncludeTree is working.`, [
    await test (`Create`, `Ensure IncludeTree objects are properly created.`, [async () => {
        const includeTree = new IncludeTree()
        let results = []

        assert(includeTree,                                                 `includeTree created.`, results)
        assert(includeTree.nodes !== undefined,                             `includeTree nodes not undefined.`, results)
        assert(includeTree.nodes !== null,                                  `includeTree nodes not null.`, results)
        assert(includeTree.nodes.length === 0,                              `includeTree nodes array is empty.`, results)

        return results                                                                    
    }]),
    await test (`Add nodes`, `Ensure adding nodes works correctly.`, [async () => {
        const includeTree = new IncludeTree()
        let includeNode = new IncludeNode(`TestIncludeNode`)
        let results = []

        includeTree.addNode(includeNode);
        assert(includeTree.nodes.length === 1,                              `includeTree nodes has one child.`, results)
        assert(includeTree.nodes[0].name === `TestIncludeNode`,             `includeTree node is named TestIncludeNode.`, results)
        assert(includeTree.hasNode(`TestIncludeNode`),                      `includeTree has node TestIncludeNode.`, results)
        assert(includeTree.getNodeByName(`TestIncludeNode`).name === `TestIncludeNode`,
                                                                            `includeTree can return node object by name.`, results)

        return results                                                                    
    }]),
])

suite(`Test VanillaComponentLifecycle`, `Ensure VanillaComponentLifecycle is working.`, [
    await test (`Compile`, `Ensure html is properly compiled.`, [async () => {
        let html = `<div>First Div</div><span>Parent Div<div>Child Div</div></span>`
        let frag = VanillaComponentLifecycle.compile(html)
        let results = []

        assert(frag,                                                        `DOM elements created.`, results)
        assert(frag.children.length === 2,                                  `Correct number of children.`, results)
        assert(frag.children[0].innerText === `First Div`,                  `First div inner text is correct.`, results)
        assert(frag.children[1].innerText === `Parent DivChild Div`,        `Span inner text is correct.`, results)
        assert(frag.children[1].children.length === 1,                      `Span has correct number of children.`, results)
        assert(frag.children[1].children[0].innerText === `Child Div`,      `Child div inner text is correct.`, results)

        return results                                                                    
    }]),
    await test (`Replace Node Values`, `Ensure node values are properly replaced.`, [async () => {
        let text = `Original Text {field1}`
        let textChild = `Original Text {field2}`
        let testDiv = document.createElement('div')
        let testDivText = document.createTextNode(text)
        let testDivChildText = document.createTextNode(textChild)
        let testDivChild = document.createElement('div')
        let testData = { field1: `value 1`, field2: `value 2` }
        let results = []

        testDiv.id = `testDiv`
        testDivChild.id = `testDivChild`
        testDiv.appendChild(testDivText)
        testDiv.appendChild(testDivChild)
        testDivChild.appendChild(testDivChildText)
        document.getElementById(`TestingDOM`).appendChild(testDiv)
        VanillaComponentLifecycle.replaceNodeValue(testDiv, testData, `field1`)
        VanillaComponentLifecycle.replaceNodeValue(testDiv, testData, `field2`)
        
        assert(testDivText.nodeValue === `Original Text value 1`,           `Node value replaced.`, results)
        assert(testDivText.originalNodeValue === text,                      `Original value saved.`, results)
        assert(testDivChildText.nodeValue === `Original Text value 2`,      `Node value replaced in child nodes.`, results)
        assert(testDivChildText.originalNodeValue === textChild,            `Original value saved in child nodes.`, results)

        testDiv.remove()
        testDivChild.remove()

        return results                                                                    
    }]),

    await test (`Replace Attribute Values`, `Ensure attribute values are properly replaced.`, [async () => {
        let text = `Original Text {field1}`
        let textChild = `Original Text {field2}`
        let testDiv = document.createElement('div')
        let testDivChild = document.createElement('div')
        let testDivAttr = document.createAttribute(`test`)
        let testDivChildAttr = document.createAttribute(`test`)
        let testData = { field1: `value 1`, field2: `value 2` }
        let results = []

        testDiv.id = `testDiv`
        testDivChild.id = `testDivChild`
        testDiv.setAttributeNode(testDivAttr)
        testDivChild.setAttributeNode(testDivChildAttr)
        testDivAttr.value = text
        testDivChildAttr.value = textChild
        testDiv.appendChild(testDivChild)
        testDivChild.setAttributeNode(testDivChildAttr)
        document.getElementById(`TestingDOM`).appendChild(testDiv)

        VanillaComponentLifecycle.replaceAttributeValue(testDiv, testData, `field1`)
        VanillaComponentLifecycle.replaceAttributeValue(testDiv, testData, `field2`)
        
        assert(testDivAttr.value === `Original Text value 1`,               `Attribute value replaced.`, results)
        assert(testDivAttr.originalAttributeValue === text,                 `Original value saved.`, results)
        assert(testDivChildAttr.value === `Original Text value 2`,          `Attribute value replaced in child nodes.`, results)
        assert(testDivChildAttr.originalAttributeValue === textChild,       `Original value saved in child nodes.`, results)

        testDiv.remove()
        testDivChild.remove()

        return results                                                                    
    }]),
    await test (`Wrap props`, `Ensure component props are properly wrapped.`, [async () => {
        class TestComponent{
            className(){return this.constructor.name}
            initialize() { if (window.initialized !== undefined) { window.initialized = true }}
            beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true }}
            afterMount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            beforeUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            afterUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            vars = { var1: `TestComponent`, var2: `Y` }
            props = { prop1: `value1`, prop2: `value2` }
        }
        let testComponent = new TestComponent()
        let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-grey-e border-2 border-solid border-black">My Footer</footer>`
        let frag = VanillaComponentLifecycle.compile(html)
        let results = []

        VanillaComponentLifecycle.wrapProps(testComponent, frag)
        testComponent.props.prop1 = `New Value`

        assert(testComponent.props.$propsStore,                             `Data store created.`, results)
        assert(testComponent.props.prop1 === `value1`,                      `Cannot assign value to props.`, results)

        return results                                                                    
    }]),
    await test (`Wrap vars`, `Ensure component vars are properly wrapped.`, [async () => {
        class TestComponent{
            className(){return this.constructor.name}
            initialize() { if (window.initialized !== undefined) { window.initialized = true }}
            beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true }}
            afterMount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            beforeUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            afterUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
            vars = { var1: `TestComponent`, var2: `Y` }
            props = { prop1: `value1`, prop2: `value2` }
        }
        let testComponent = new TestComponent()
        let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-grey-e border-2 border-solid border-black">My Footer</footer>`
        let frag = VanillaComponentLifecycle.compile(html)
        let results = []

        VanillaComponentLifecycle.wrapVars(testComponent, frag)
        testComponent.vars.var1 = `New Value`

        assert(testComponent.vars.$varsStore,                               `Data store created.`, results)
        assert(testComponent.vars.var1 === `New Value`,                     `Assigning value to vars works.`, results)

        return results                                                                    
    }]),
    await test (`Register DOM fragment`, `Ensure component DOM fragment is properly registered.`, [async () => {
        let html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let frag = VanillaComponentLifecycle.compile(html)
        let fragmentId = `TestComponent`
        let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        let fragmentScripts = frag.querySelectorAll(`script`)
        let fragmentTests = frag.querySelectorAll(`test`)
        let fragmentStyles = frag.querySelectorAll(`style`)
        let componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        let componentTest = document.getElementById(`TestTag${fragmentId}`)
        let componentSyle = document.getElementById(`StyleTag${fragmentId}`)
        let componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)
        let results = []
        let cleanup = () => {
            componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            componentTest = document.getElementById(`TestTag${fragmentId}`)
            componentSyle = document.getElementById(`StyleTag${fragmentId}`)
            componentScript?.remove()
            componentTest?.remove()
            componentSyle?.remove()
            window.$vanilla?.fragmentRegistry?.delete(fragmentId)    
        }

        assert(registerResult,                                              `DOM fragment registered.`, results)
        assert(componentInRegistry,                                         `DOM fragment in registry.`, results)
        assert(fragmentScripts.length === 0,                                `Component script moved out of fragment.`, results)
        assert(fragmentTests.length === 0,                                  `Component test moved out of fragment.`, results)
        assert(fragmentStyles.length === 0,                                 `Component test moved out of fragment.`, results)
        assert(componentScript,                                             `Component script still in document.`, results)
        assert(document.head.querySelector(`#ScriptTag${fragmentId}`),      `Component script moved to head.`, results)
        assert(componentTest === null,                                      `Component test not in document.`, results)
        assert(componentSyle,                                               `Component style still in document.`, results)
        assert(document.head.querySelector(`#StyleTag${fragmentId}`),       `Component style moved to head.`, results)

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
        componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        componentTest = document.getElementById(`TestTag${fragmentId}`)
        componentSyle = document.getElementById(`StyleTag${fragmentId}`)

        assert(registerResult,                                              `DOM fragment registered (include test tag).`, results)
        assert(componentInRegistry,                                         `DOM fragment in registry (include test tag).`, results)
        assert(fragmentScripts.length === 0,                                `Component script moved out of fragment (include test tag).`, results)
        assert(fragmentTests.length === 0,                                  `Component test moved out of fragment (include test tag).`, results)
        assert(fragmentStyles.length === 0,                                 `Component test moved out of fragment (include test tag).`, results)
        assert(componentScript,                                             `Component script still in document (include test tag).`, results)
        assert(document.head.querySelector(`#ScriptTag${fragmentId}`),      `Component script moved to head (include test tag).`, results)
        assert(componentTest,                                               `Component test still in document (include test tag).`, results)
        assert(document.head.querySelector(`#TestTag${fragmentId}`),        `Component test moved to head (include test tag).`, results)
        assert(componentSyle,                                               `Component style still in document (include test tag).`, results)
        assert(document.head.querySelector(`#StyleTag${fragmentId}`),       `Component style moved to head (include test tag).`, results)

        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)

        assert(!registerResult,                                             `Register DOM fragment fails when fragment is already registered.`, results)

        componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        componentTest = document.getElementById(`TestTag${fragmentId}`)
        componentSyle = document.getElementById(`StyleTag${fragmentId}`)
        componentScript?.remove()
        componentTest?.remove()
        componentSyle?.remove()
        window.$vanilla.fragmentRegistry.delete(fragmentId)
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(null, frag, false)

        assert(!registerResult,                                             `Register DOM fragment fails when no fragment id is provided.`, results)

        cleanup()
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, null, false)

        assert(!registerResult,                                             `Register DOM fragment fails when no fragment is provided.`, results)

        html = `<component><test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's no script tag.`, results)

        html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <script>const f = () => {}</script>
            <test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        
        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's two script tags.`, results)
    
        html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            </component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's no markup tag.`, results)

        html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup>
            <markup><div></div></markup>
            </component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's two markup tags.`, results)

        html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup>
            </component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
    
        assert(registerResult,                                              `Register DOM fragment succeeds when including test tag, but there's no test tag.`, results)

        html = `<component><script>
        class TestComponent{
            className() { return this.constructor.name }
            initialize() { if (window.initialized !== undefined) { window.initialized = true } }
            beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
            afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
            beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
            afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
            vars = { var1: 'value1', var2: 'value2' } 
            props = { prop1: 'value3', prop2: 'value4' }
        }</script>
        <test>const myTest = function() { return 42; }</test>
        <test>const myOtherTest = function() { return 42; }</test>
        <style>.buttonStyle { color: green; background-color: red; }</style>
        <markup>
            <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
            <div id='test-div-1'>{var2}</div>
            <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
        </markup></component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's two test tags.`, results)

        html = `<component><script>
        class TestComponent{
            className() { return this.constructor.name }
            initialize() { if (window.initialized !== undefined) { window.initialized = true } }
            beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
            afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
            beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
            afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
            vars = { var1: 'value1', var2: 'value2' } 
            props = { prop1: 'value3', prop2: 'value4' }
        }</script>
        <test>const myTest = function() { return 42; }</test>
        <style>.buttonStyle { color: green; background-color: red; }</style>
        <style>.checkboxStyle { color: green; background-color: red; }</style>
        <markup>
            <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
            <div id='test-div-1'>{var2}</div>
            <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
        </markup></component>`

        cleanup()
        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
    
        assert(!registerResult,                                             `Register DOM fragment fails when there's two style tags.`, results)

        cleanup()
        return results                                                                    
    }]),
    await test (`Unregister DOM fragment`, `Ensure component DOM fragment is properly unregistered.`, [async () => {
        let html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test>const myTest = function() { return 42; }</test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let frag = VanillaComponentLifecycle.compile(html)
        let fragmentId = `TestComponent`
        let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        let unregisterResult = VanillaComponentLifecycle.unregisterDOMFragment(fragmentId)
        let componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        let componentTest = document.getElementById(`TestTag${fragmentId}`)
        let componentSyle = document.getElementById(`StyleTag${fragmentId}`)
        let componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)
        let results = []

        assert(unregisterResult,                                            `DOM fragment unregistered.`, results)
        assert(!componentInRegistry,                                        `DOM fragment not in registry.`, results)
        assert(componentScript === null,                                    `Component script not in document.`, results)
        assert(componentTest === null,                                      `Component test not in document.`, results)
        assert(componentSyle === null,                                      `Component style still in document.`, results)

        frag = VanillaComponentLifecycle.compile(html)
        registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
        unregisterResult = VanillaComponentLifecycle.unregisterDOMFragment(fragmentId)
        componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        componentTest = document.getElementById(`TestTag${fragmentId}`)
        componentSyle = document.getElementById(`StyleTag${fragmentId}`)
        componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)

        assert(registerResult,                                              `DOM fragment registers successfully after an unregistered.`, results)
        assert(unregisterResult,                                            `DOM fragment unregistered (include test tag).`, results)
        assert(!componentInRegistry,                                        `DOM fragment not in registry (include test tag).`, results)
        assert(componentScript === null,                                    `Component script not in document (include test tag).`, results)
        assert(componentTest === null,                                      `Component test not in document (include test tag).`, results)
        assert(componentSyle === null,                                      `Component style still in document (include test tag).`, results)

        return results                                                                    
    }]),
    await test (`Create component object`, `Ensure a component's object can be successfully created.`, [async () => {
        let html = `<component><script>
            class TestComponent {
                className() { return this.constructor.name }
                initialize() { window.initialized = true }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let includeTagHTML = `<include-component id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-component>`
        let frag = VanillaComponentLifecycle.compile(html)
        let componentClass = `TestComponent`
        let registerResult = VanillaComponentLifecycle.registerDOMFragment(componentClass, frag, false)
        let testingDOMElement = document.getElementById(`TestingDOM`)
        let results = []

        window.initialized = false
        testingDOMElement.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)

        let componentObject = VanillaComponentLifecycle.createComponentObject(componentClass, `TestComponent1`, componentClass, document.getElementById(`TestIncludeTag`))

        VanillaComponentLifecycle.unregisterDOMFragment(componentClass)

        let objectInRegistry = window.$vanilla?.objectRegistry?.has(componentClass)
        let hasIncludeTag = document.getElementById(`TestIncludeTag`)
        let hasMarkerTag = document.getElementById(`-VanillaComponentMarkerTestComponent1`)

        componentObject.props.prop1 = "Some value"

        assert(componentObject,                                             `Component object successfully created.`, results)
        assert(!objectInRegistry,                                           `Creating a component does not register it.`, results)
        assert(!hasIncludeTag,                                              `Include tag removed from document after object creation.`, results)
        assert(hasMarkerTag,                                                `Marker tag added to document after object creation.`, results)
        assert(window.initialized,                                          `Component has been initialized.`, results)
        assert(componentObject.vars.$varsStore,                             `Vars are wrapped.`, results)
        assert(componentObject.props.$propsStore,                           `Props are wrapped.`, results)
        assert(componentObject.props.prop1 === `value3`,                    `Props cannot be changed.`, results)
        
        return results                                                                    
    }]),
    await test (`Register component object`, `Ensure a component's object can be successfully registered.`, [async () => {
        let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestObject`, { test: `test` }, `fragment`)
        let objectInRegistry = window.$vanilla?.objectRegistry?.has(`TestObject`)
        let results = []

        assert(registerComponentObjectResult,                               `Component object registered successfully.`, results)
        assert(objectInRegistry,                                            `Component object in registry.`, results)

        registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestObject`, { test: `test` }, `fragment`)

        assert(!registerComponentObjectResult,                              `Registering an object fails when it is already registered.`, results)

        registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(null, { test: `test` }, `fragment`)

        assert(!registerComponentObjectResult,                              `Registering an object fails when no id is provided.`, results)

        registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestObject`, null, `fragment`)

        assert(!registerComponentObjectResult,                              `Registering an object fails when no object is provided.`, results)

        registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestObject`, { test: `test` }, null)

        assert(!registerComponentObjectResult,                              `Registering an object fails when no fragment id is provided.`, results)

        window.$vanilla = null

        return results                                                                    
    }]),
    await test (`Unregister component object`, `Ensure a component's object can be successfully unregistered.`, [async () => {
        let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestObject`, { test: `test` }, `fragment`)
        let unregisterComponentObjectResult = VanillaComponentLifecycle.unregisterComponentObject(`TestObject`)
        let objectInRegistry = window.$vanilla?.objectRegistry?.has(`TestObject`)
        let results = []

        assert(registerComponentObjectResult,                               `Component object registered successfully.`, results)
        assert(unregisterComponentObjectResult,                             `Component object unregistered successfully.`, results)
        assert(!objectInRegistry,                                           `Component object in registry.`, results)

        unregisterComponentObjectResult = VanillaComponentLifecycle.unregisterComponentObject(`TestObject`, { test: `test` }, `fragment`)

        assert(!unregisterComponentObjectResult,                            `Unregistering an object fails when it is already unregistered.`, results)

        unregisterComponentObjectResult = VanillaComponentLifecycle.registerComponentObject()

        assert(!unregisterComponentObjectResult,                            `Unegistering an object fails when no id is provided.`, results)

        return results                                                                    
    }]),
    await test (`Mount component`, `Ensure a component can be successfully mounted.`, [async () => {
        let html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let includeTagHTML = `<include-component id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-component>`
        let frag = VanillaComponentLifecycle.compile(html)
        let componentClass = `TestComponent`
        let registerResult = VanillaComponentLifecycle.registerDOMFragment(componentClass, frag, false)
        let testingDOMElement = document.getElementById(`TestingDOM`)
        let results = []

        window.beforeMount = false
        window.afterMount = false
        testingDOMElement.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)

        let componentObject = VanillaComponentLifecycle.createComponentObject(componentClass, `TestComponent1`, componentClass, document.getElementById(`TestIncludeTag`))
        let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestComponent1`, componentObject, componentClass)
        let mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)
        let componentObjectInfo = window.$vanilla.objectRegistry.get(`TestComponent1`)

        assert(mountResult,                                                 `Component was mounted.`, results)
        assert(window.beforeMount,                                          `Component's beforeMount() method was called.`, results)
        assert(window.afterMount,                                           `Component's afterMount() method was called.`, results)
        assert(componentObjectInfo?.mounted,                                `Component's marked as mounted.`, results)

        mountResult = VanillaComponentLifecycle.mount()

        assert(!mountResult,                                                `Mount fails when no id is provided.`, results)

        window.$vanilla.objectRegistry.delete(`TestComponent1`)
        mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)

        assert(!mountResult,                                                `Mount fails when component is not registered.`, results)

        window.$vanilla.objectRegistry.set(`TestComponent1`, componentObjectInfo)

        let framentRegisryObject = window.$vanilla.fragmentRegistry.get(componentClass)

        window.$vanilla.fragmentRegistry.delete(componentClass)
        mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)

        assert(!mountResult,                                                `Mount fails when fragment is not registered.`, results)

        window.$vanilla.fragmentRegistry.set(componentClass, framentRegisryObject)

        let markerElement = document.getElementById(`-VanillaComponentMarkerTestComponent1`)

        markerElement.remove()
        mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)

        assert(!mountResult,                                                `Mount fails when marker tag is not in DOM.`, results)

        let testingDOMNode = document.getElementById(`TestingDOM`)

        window.$vanilla = undefined
        while (testingDOMNode.firstChild) {
            testingDOMNode.removeChild(testingDOMNode.firstChild)
        }

        return results                                                                    
    }]),
    await test (`Unmount component`, `Ensure a component can be successfully unmounted.`, [async () => {
        let html = `<component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let includeTagHTML = `<include-component id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-component>`
        let frag = VanillaComponentLifecycle.compile(html)
        let componentClass = `TestComponent`
        let registerResult = VanillaComponentLifecycle.registerDOMFragment(componentClass, frag, false)
        let testingDOMElement = document.getElementById(`TestingDOM`)
        let results = []

        window.beforeUnmount = false
        window.afterUnmount = false
        testingDOMElement.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)

        let componentObject = VanillaComponentLifecycle.createComponentObject(componentClass, `TestComponent1`, componentClass, document.getElementById(`TestIncludeTag`))
        let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`TestComponent1`, componentObject, componentClass)
        let mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)
        let unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)
        let componentObjectInfo = window.$vanilla.objectRegistry.get(`TestComponent1`)

        assert(unmountResult,                                               `Component was unmounted.`, results)
        assert(window.beforeUnmount,                                        `Component's beforeUnmount() method was called.`, results)
        assert(window.afterUnmount,                                         `Component's afterUnmount() method was called.`, results)
        assert(!componentObjectInfo?.mounted,                               `Component marked as unmounted.`, results)

    
        unmountResult = VanillaComponentLifecycle.unmount()

        assert(!unmountResult,                                              `Unmount fails when no id is provided.`, results)

        window.$vanilla.objectRegistry.delete(`TestComponent1`)
        unmountResult = VanillaComponentLifecycle.unmount()

        assert(!unmountResult,                                              `Unmount fails when component is not registered.`, results)

        window.$vanilla.objectRegistry.set(`TestComponent1`, componentObjectInfo)

        let framentRegisryObject = window.$vanilla.fragmentRegistry.get(componentClass)

        window.$vanilla.fragmentRegistry.delete(componentClass)
        unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)

        assert(!unmountResult,                                              `Unmount fails when fragment is not registered.`, results)

        window.$vanilla.fragmentRegistry.set(componentClass, framentRegisryObject)

        let markerElement = document.getElementById(`-VanillaComponentMarkerTestComponent1`)

        markerElement.remove()
        unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)

        assert(!unmountResult,                                              `Unmount fails when marker tag is not in DOM.`, results)

        let testingDOMNode = document.getElementById(`TestingDOM`)

        window.$vanilla = undefined
        while (testingDOMNode.firstChild) {
            testingDOMNode.removeChild(testingDOMNode.firstChild)
        }

        return results                                                                    
    }]),
])
suite(`Test Vanilla`, `Ensure Vanilla utility class is working.`, [
    await test (`Get component fragment`, `Ensure component fragments can be retrieved from the component fragment registry.`, [async () => {
        window.$vanilla = {}
        window.$vanilla.fragmentRegistry = new Map()
        window.$vanilla.fragmentRegistry.set(`TestFragment`, { data: 'data'})

        let fragment =  Vanilla.getComponentFragment(`TestFragment`)
        let results = []

        assert(fragment,                                                    `An object was retrieved from the component fragment registry.`, results)
        assert(fragment.data === 'data',                                    `Correct object retrieved from the component fragment registry.`, results)

        fragment =  Vanilla.getComponentFragment()

        assert(!fragment,                                                   `Get component fragment fails when no id is provided.`, results)

        window.$vanilla.fragmentRegistry.delete(`TestFragment`)
        fragment =  Vanilla.getComponentFragment(`TestFragment`)

        assert(!fragment,                                                   `Get component fragment fails when object not in the component fragment registry.`, results)

        return results                                                                    
    }]),
    await test (`Get component object`, `Ensure component objects can be retrieved from the component object registry.`, [async () => {
        window.$vanilla = {}
        window.$vanilla.objectRegistry = new Map()
        window.$vanilla.objectRegistry.set(`TestObject`, { componentObject: { data: 'data'}})

        let object =  Vanilla.getComponentObject(`TestObject`)
        let results = []

        assert(object,                                                      `An object was retrieved from the component object registry.`, results)
        assert(object.data === 'data',                                      `Correct object retrieved from the component object registry.`, results)

        object =  Vanilla.getComponentObject()

        assert(!object,                                                     `Get component object fails when no id is provided.`, results)

        window.$vanilla.objectRegistry.delete(`TestObject`)
        object =  Vanilla.getComponentFragment(`TestObject`)

        assert(!object,                                                     `Get component object fails when object not in the component object registry.`, results)

        return results                                                                    
    }]),
])
suite(`Test load file`, `Ensure files can be loaded.`, [
    await test (`Load file`, `Ensure files can be loaded.`, [async () => {
        let file = `./support-files/text.txt`
        let results = []

        let text = await loadFile(file, (text) => {
        })
        assert(text === `Text`,                                             `Text read from file.`, results)

        return results                                                                    
    }]),
])
})
