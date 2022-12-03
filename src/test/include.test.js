suite(`Test include.js`, `Ensure that include and component tags are working.`, 
    it (`createIncludeNode`, `Ensure that IncludeNode objects can be properly created.`, [() => {
        const includeNode = new IncludeNode(`TestIncludeNode`)
        assert(includeNode, `IncludeNode created.`)
        assert(includeNode.name == `TestIncludeNode`, `IncludeNode name set.`)
        assert(includeNode.children !== undefined, `IncludeNode children not undefined.`)
        assert(includeNode.children !== null, `IncludeNode children not null.`)
        assert(includeNode.children.length === 0, `IncludeNode children array is empty.`)
        assert(includeNode.parent === null, `IncludeNode has no parent.`)
    }])
)
