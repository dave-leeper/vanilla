suite(`Test IncludeNode`, `Ensure that include and component tags are working.`, [
    test (`Create`, `Ensure that IncludeNode objects can be properly created.`, [() => {
        const includeNode = new IncludeNode(`TestIncludeNode`)
        assert(includeNode,                                                 `includeNode created.`)
        assert(includeNode.name == `TestIncludeNode`,                       `includeNode name set.`)
        assert(includeNode.children !== undefined,                          `includeNode children not undefined.`)
        assert(includeNode.children !== null,                               `includeNode children not null.`)
        assert(includeNode.children.length === 0,                           `includeNode children array is empty.`)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`)
    }]),
    test (`Add child nodes`, `Ensure that adding child nodes works correctly.`, [() => {
        const includeNode = new IncludeNode(`TestIncludeNode`)
        includeNode.addChild(`TestIncludeNodeChild`)
        assert(includeNode.children.length === 1,                           `includeNode children has one child.`)
        assert(includeNode.children[0].name ===                             `TestIncludeNodeChild`, `includeNode child is named TestIncludeNodeChild.`)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`)
        assert(includeNode.children[0].parent === includeNode,              `Child's parent is includeNode.`)
        assert(includeNode.hasChild(`TestIncludeNodeChild`),                `includeNode has child TestIncludeNodeChild.`)
        assert(includeNode.getChildByName(`TestIncludeNodeChild`).name === `TestIncludeNodeChild`,
                                                                            `includeNode can return child node object by name.`)
    }]),
    test (`Ancestors`, `Ensure that ancestor nodes works correctly.`, [() => {
        const includeNode = new IncludeNode(`TestIncludeNode`)
        includeNode.addChild(`TestIncludeNodeChild`)
        includeNode.children[0].addChild(`TestIncludeNodeGrandchild`)
        const child = includeNode.children[0]
        const grandchild = child.children[0]
        assert(includeNode.children.length === 1,                           `includeNode children has one child.`)
        assert(includeNode.children[0].name ===                             `TestIncludeNodeChild`, `includeNode child is named TestIncludeNodeChild.`)
        assert(includeNode.parent === null,                                 `includeNode has no parent.`)
        assert(includeNode.children[0].parent === includeNode,              `Child's parent is includeNode.`)
        assert(includeNode.hasChild(`TestIncludeNodeChild`),                `includeNode has child TestIncludeNodeChild.`)
        assert(includeNode.getChildByName(`TestIncludeNodeChild`).name === `TestIncludeNodeChild`,
                                                                            `includeNode can return child node object by name.`)
        assert(child.children.length === 1,                                 `TestIncludeNodeChild children has one child.`)
        assert(child.children[0].name ===                                   `TestIncludeNodeGrandchild`, `TestIncludeNodeChild child is named TestIncludeNodeGrandchild.`)
        assert(child.parent === includeNode,                                `TestIncludeNodeChild parent is TestIncludeNode.`)
        assert(child.children[0].parent === child,                          `Grandchild's parent is TestIncludeNodeChild.`)
        assert(child.hasChild(`TestIncludeNodeGrandchild`),                 `TestIncludeNodeChild has child TestIncludeNodeGrandchild.`)
        assert(child.getChildByName(`TestIncludeNodeGrandchild`).name === `TestIncludeNodeGrandchild`,
                                                                            `TestIncludeNodeChild can return child node object by name.`)
        assert(grandchild.children.length === 0,                            `TestIncludeNodeGrandchild children has no children.`)
        assert(grandchild.parent === child,                                 `TestIncludeNodeGrandchild parent is TestIncludeNodeChild.`)
        assert(grandchild.hasAncestor(`TestIncludeNodeChild`),              `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`)
        assert(grandchild.hasAncestor(`TestIncludeNode`),                   `TestIncludeNodeGrandchild has ancestor TestIncludeNode.`)
        assert(grandchild.getAncestor(`TestIncludeNode`) === includeNode,   `TestIncludeNodeGrandchild returns ancestor TestIncludeNodeChild.`)
        assert(grandchild.getAncestor(`TestIncludeNodeChild`) === child,    `TestIncludeNodeGrandchild returns ancestor TestIncludeNodeChild.`)
        assert(child.hasAncestor(`TestIncludeNode`),                        `TestIncludeNodeChild has ancestor TestIncludeNode.`)
        assert(child.getAncestor(`TestIncludeNode`) === includeNode,        `TestIncludeNodeChild returns ancestor TestIncludeNode.`)
    }]),
    test (`Descendants`, `Ensure that descendant nodes works correctly.`, [() => {
        const includeNode = new IncludeNode(`TestIncludeNode`)
        includeNode.addChild(`TestIncludeNodeChild`)
        includeNode.children[0].addChild(`TestIncludeNodeGrandchild`)
        const child = includeNode.children[0]
        const grandchild = child.children[0]
        assert(includeNode.hasDescendant(`TestIncludeNodeChild`),           `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`)
        assert(includeNode.hasDescendant(`TestIncludeNodeGrandchild`),      `TestIncludeNodeGrandchild has ancestor TestIncludeNode.`)
        assert(includeNode.getDescendant(`TestIncludeNodeChild`) === child, `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`)
        assert(includeNode.getDescendant(`TestIncludeNodeGrandchild`) === grandchild,  
                                                                            `TestIncludeNodeGrandchild has ancestor TestIncludeNodeChild.`)
    }]),
])
