document.addEventListener('DOMContentLoaded', () => {
suite(`Test IncludeNode`, `Ensure IncludeNode is working.`, [
    test (`Create`, `Ensure IncludeNode objects are properly created.`, [() => {
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
    test (`Add child nodes`, `Ensure adding child nodes works correctly.`, [() => {
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
    test (`Ancestors`, `Ensure ancestor nodes works correctly.`, [() => {
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
    test (`Descendants`, `Ensure descendant nodes works correctly.`, [() => {
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
    test (`Create`, `Ensure IncludeTree objects are properly created.`, [() => {
        const includeTree = new IncludeTree()
        let results = []

        assert(includeTree,                                                 `includeTree created.`, results)
        assert(includeTree.nodes !== undefined,                             `includeTree nodes not undefined.`, results)
        assert(includeTree.nodes !== null,                                  `includeTree nodes not null.`, results)
        assert(includeTree.nodes.length === 0,                              `includeTree nodes array is empty.`, results)

        return results                                                                    
    }]),
    test (`Add nodes`, `Ensure adding nodes works correctly.`, [() => {
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

suite(`Test VanillaComponent`, `Ensure VanillaComponent is working.`, [
    test (`Replace Node Values`, `Ensure node values are properly replaced.`, [() => {
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
        testDiv.nodeValue = text
        testDivChild.nodeValue = textChild
        testDiv.appendChild(testDivText)
        testDiv.appendChild(testDivChild)
        testDivChild.appendChild(testDivChildText)
        document.getElementById(`TestingDOM`).appendChild(testDiv)
        VanillaComponent.replaceNodeValue(testDiv, testData, `field1`)
        VanillaComponent.replaceNodeValue(testDiv, testData, `field2`)
        
        assert(testDivText.nodeValue === `Original Text value 1`,           `Node value replaced.`, results)
        assert(testDivText.originalNodeValue === text,                      `Original value saved.`, results)
        assert(testDivChildText.nodeValue === `Original Text value 2`,      `Node value replaced.`, results)
        assert(testDivChildText.originalNodeValue === textChild,            `Node value replaced.`, results)

        testDiv.remove()
        testDivChild.remove()

        return results                                                                    
    }]),

    test (`Replace Attribute Values`, `Ensure attribute values are properly replaced.`, [() => {
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

        VanillaComponent.replaceAttributeValue(testDiv, testData, `field1`)
        VanillaComponent.replaceAttributeValue(testDiv, testData, `field2`)
        
        assert(testDivAttr.value === `Original Text value 1`,               `Node value replaced.`, results)
        assert(testDivAttr.originalAttributeValue === text,                 `Original value saved.`, results)
        assert(testDivChildAttr.value === `Original Text value 2`,          `Node value replaced.`, results)
        assert(testDivChildAttr.originalAttributeValue === textChild,       `Node value replaced.`, results)

        testDiv.remove()
        testDivChild.remove()

        return results                                                                    
    }]),
    test (`Wrap props`, `Ensure component props are properly wrapped.`, [() => {
        class TestComponent{
            className(){return this.constructor.name}
            initialize() { console.log(`Initialize.`)}
            beforeMount() { console.log(`Before mount.`)}
            afterMount() { console.log(`After mount.`)}
            beforeUnmount() { console.log(`Before unmount.`)}
            afterUnmount() { console.log(`After unmount.`)}
            vars = { var1: `TestComponent`, var2: `Y` }
            props = { prop1: `value1`, prop2: `value2` }
        }
        let testComponent = new TestComponent()
        let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-grey-e border-2 border-solid border-black">My Footer</footer>`
        let frag = document.createDocumentFragment()
        let results = []

        frag.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        VanillaComponent.wrapProps(testComponent, frag)
        testComponent.props.prop1 = `New Value`

        assert(testComponent.props.$propsStore,                             `Data store created.`, results)
        assert(testComponent.props.prop1 === `value1`,                      `Cannot assign value to props.`, results)

        return results                                                                    
    }]),
    test (`Wrap vars`, `Ensure component vars are properly wrapped.`, [() => {
        class TestComponent{
            className(){return this.constructor.name}
            initialize() { console.log(`Initialize.`)}
            beforeMount() { console.log(`Before mount.`)}
            afterMount() { console.log(`After mount.`)}
            beforeUnmount() { console.log(`Before unmount.`)}
            afterUnmount() { console.log(`After unmount.`)}
            vars = { var1: `TestComponent`, var2: `Y` }
            props = { prop1: `value1`, prop2: `value2` }
        }
        let testComponent = new TestComponent()
        let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-grey-e border-2 border-solid border-black">My Footer</footer>`
        let frag = document.createDocumentFragment()
        let results = []

        frag.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        VanillaComponent.wrapVars(testComponent, frag)
        testComponent.vars.var1 = `New Value`

        assert(testComponent.vars.$varsStore,                               `Data store created.`, results)
        assert(testComponent.vars.var1 === `New Value`,                     `Assigning value to vars works.`, results)

        return results                                                                    
    }]),
    test (`Unpack Component Fragment`, `Ensure components vars are properly unpacked from html text.`, [() => {
        let html = `<component><script>
            class TestComponent{
                className() {return this.constructor.name}
                initialize() { console.log('Initialize.')}
                beforeMount() { console.log('Before mount.')}
                afterMount() { console.log('After mount.')}
                beforeUnmount() { console.log('Before unmount.')}
                afterUnmount() { console.log('After unmount.')}
                vars = { x: 'var1', y: 'var2' } 
                props = { prop1: 'value1', prop2: 'value2' }
            }</script>
            <test></test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{y}" class="buttonStyle" onclick="console.log('clicked')">{x}</button>
                <div id='test-div-1'>{y}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let frag = document.createDocumentFragment()
        let marker = document.createElement('script')
        let results = []

        frag.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        marker.id = `-UnpackComponentFragmentMarker`
        marker.type = 'text/javascript'
        document.getElementById(`TestingDOM`).appendChild(marker)

        let newElements = VanillaComponent.unpackComponentFragment(frag, marker)
        let markerParent = document.getElementById(`TestingDOM`)
        let markup = document.querySelectorAll('markup')
        let buttons = markerParent.querySelectorAll('button')
        let divs = markerParent.querySelectorAll('div')
        let styles = markerParent.querySelectorAll('style')
        let scripts = markerParent.querySelectorAll('script')
        let components = markerParent.querySelectorAll('component')

        assert(newElements.length === 3,                                    `HTML components unpacked from fragment.`, results)
        assert(newElements[0].tagName === `BUTTON`,                         `Button unpacked.`, results)
        assert(newElements[1].tagName === `DIV`,                            `First div unpacked.`, results)
        assert(newElements[2].tagName === `DIV`,                            `Second div unpacked.`, results)
        assert(newElements[2].querySelectorAll('div').length === 1,         `Third div unpacked.`, results)
        assert(markup.length === 0,                                         `No markup node in html.`, results)
        assert(buttons.length === 1,                                        `Button placed in html.`, results)
        assert(buttons[0].id === 'test-button',                             `Button id is correct.`, results)
        assert(divs.length === 3,                                           `Divs placed in html.`, results)
        assert(divs[0].id === 'test-div-1',                                 `First div id is correct.`, results)
        assert(divs[1].id === 'test-div-2',                                 `Second div id is correct.`, results)
        assert(divs[2].id === 'test-div-3',                                 `Third div id is correct.`, results)
        assert(styles.length === 1,                                         `Style placed in html.`, results)
        assert(scripts.length === 2,                                        `Marker script still in html. Component script added to html`, results)
        assert(scripts[0].id === `-UnpackComponentFragmentMarker`,          `Marker script still in html.`, results)
        assert(scripts[0].nextSibling === styles[0],                        `Style correctly placed in html.`, results)
        assert(styles[0].nextSibling === buttons[0],                        `Button correctly placed in html.`, results)
        assert(buttons[0].nextSibling === divs[0],                          `First div correctly placed in html.`, results)
        assert(divs[0].nextSibling === divs[1],                             `Second div correctly placed in html.`, results)
        assert(divs[1].querySelectorAll('div')[0] === divs[2],              `Third div correctly placed in html.`, results)

        buttons[0].remove()
        divs[0].remove()
        divs[1].remove()
        styles[0].remove()
        scripts[0].remove()
        scripts[1].remove()
        components[0].remove()

        return results                                                                    
    }]),
    test (`Register Component`, `Ensure components are properly registered.`, [() => {
        class TestComponent{
            className(){return this.constructor.name}
            initialize() { console.log(`Initialize.`)}
            beforeMount() { console.log(`Before mount.`)}
            afterMount() { console.log(`After mount.`)}
            beforeUnmount() { console.log(`Before unmount.`)}
            afterUnmount() { console.log(`After unmount.`)}
            vars = { x: 'var1', y: 'var2' } 
            props = { prop1: 'value1', prop2: 'value2' }
        }
        let html = `<component><script>
            class TestComponent{
                className() {return this.constructor.name}
                initialize() { console.log('Initialize.')}
                beforeMount() { console.log('Before mount.')}
                afterMount() { console.log('After mount.')}
                beforeUnmount() { console.log('Before unmount.')}
                afterUnmount() { console.log('After unmount.')}
                vars = { x: 'var1', y: 'var2' } 
                props = { prop1: 'value1', prop2: 'value2' }
            }</script>
            <test></test>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <markup>
                <button id='test-button' name="{y}" class="buttonStyle" onclick="console.log('clicked')">{x}</button>
                <div id='test-div-1'>{y}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </markup></component>`
        let includeHTML = document.createElement('include-component')
        let frag = document.createDocumentFragment()
        let testingDOMNode = document.getElementById(`TestingDOM`)
        let marker = document.createElement('script')
        let testComponent = new TestComponent()
        let results = []

        includeHTML.setAttribute(`src`, `./no-such-file.html`)
        includeHTML.setAttribute(`component`, `TestComponent`)
        includeHTML.setAttribute(`component-id`, `TestComponent`)
        testingDOMNode.appendChild(includeHTML)
        marker.id = `-UnpackComponentFragmentMarker`
        marker.type = 'text/javascript'
        testingDOMNode.appendChild(marker)
        frag.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)

        let componentNodes = VanillaComponent.unpackComponentFragment(frag, marker)
        let result = VanillaComponent.registerComponent(`TestComponent`, testComponent, componentNodes)

        console.log(`${result}`)
        assert(result,                                                      `Component registered successfully.`, results)
        assert(window.$vanilla.registry,                                    `Component registery exists.`, results)
        
        let registryInfo = window.$vanilla.registry.get(`TestComponent`)

        assert(registryInfo,                                                `Entry for component is in registry.`, results)
        assert(registryInfo.componentObject === testComponent,              `Component object is in registry.`, results)
        assert(registryInfo.nodes === componentNodes,                       `Component DOM nodes are in registry.`, results)
        result = VanillaComponent.registerComponent(`TestComponent`, testComponent, componentNodes)
        assert(result,                                                      `Re-registering component should work.`, results)
        result = VanillaComponent.registerComponent(null, testComponent, componentNodes)
        assert(!result,                                                     `Registering without an id should not work.`, results)
        result = VanillaComponent.registerComponent(`TestComponent`, null, componentNodes)
        assert(!result,                                                     `Registering without a component object should not work.`, results)
        result = VanillaComponent.registerComponent(`TestComponent`, testComponent, null)
        assert(!result,                                                     `Registering without component nodes should not work.`, results)

        window.$vanilla = undefined
        while (testingDOMNode.firstChild) {
            testingDOMNode.removeChild(testingDOMNode.firstChild);
        }

        return results                                                                    
    }]),
])
})
