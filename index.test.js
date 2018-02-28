const { test } = require('ava')

const teatime = require('./index.js')
const DOM = new teatime()

test('Creates and returns a <h1> tag', t => {
    t.plan(2)
    const h1 =  DOM.createElement('h1', null, null)

    t.is(h1, '<h1></h1>')

    const h2 = DOM.createElement('h2')

    t.is(h2, '<h2></h2>')
})

test('Turns node object to stringified node element', t => {
    const nodeObject = {
        nodeName: 'div',
        attributes: {
            class: 'box'
        }
    }

    const div = DOM.stringify(nodeObject)
    
    t.is(div, '<div class="box"></div>')
})

test('Creates a <div> tag with a child node element <a> tag: Stringify', t => {
    const div = DOM.createElement('div', undefined,
        [
            DOM.createElement('a', { href: 'https://google.com' }, 'google')
        ]
    )

    t.is(div, '<div><a href="https://google.com">google</a></div>')
})

test('Creates a <div> tag with a child node element <p> tag: Objects', t => {
    const p = {
        nodeName: 'p',
        childern: 'Hello there'
    }, h1 = {
        nodeName: 'h1',
        attributes: {
            class: 'header',
            style: {
                color: 'blue'
            }
        },
        childern: [ p ]
    }

    t.is(
        DOM.stringify(h1),
        '<h1 class="header" style="color: blue;"><p>Hello there</p></h1>'
    )
})

test('Parse the string element to a node object', t => {
    const div = '<div><div>'
    t.deepEqual(
        DOM.parse(div),
        { nodeName: 'div', attributes: {}, childern: [] }
    )
})


test('Parses a nested string element to a ndoe object', t => {
    const divNode = DOM.parse(`
        <div class="header" id="special" style="color: red;">
            <p>Hello, World!</p>
            <a href="https://google.com">
                google link
            </a>
        </div>
    `)

    t.deepEqual(divNode, {
        nodeName: 'div',
        childern: [
            {
                nodeName: "p",
                childern: ["Hello, World!"],
                attributes: {}
            },
            {
                nodeName: "a",
                childern: ["google link"],
                attributes: {
                    href: "https://google.com"
                }
            }
        ],
        attributes: {
            class: "header",
            id: "special",
            style: {
                color: "red"
            }
        }
    })
})

test('appends a html element string that is either a to targeted node object', t => {
    
    t.deepEqual(
        DOM.appendChild({ nodeName: 'div' }, '<div></div>'),
        {
            nodeName: 'div',
            childern: [
                {
                    nodeName: 'div',
                    childern: [],
                    attributes: {}
                }
            ]
        })
})


test('appends a node object into a targeted string html element', t => {
    t.is(
        DOM.appendChild('<div></div>', {
            nodeName: 'div',
            attributes: {
                style: {
                    color: 'red',
                    'font-family': 'sans-serif'
                }
            }
        }),
        '<div><div style="color: red;font-family: sans-serif;"></div></div>'
    )
})


test('appending a string html element into another targeted html string element', t => {
    t.is(
        DOM.appendChild('<div></div>', '<a href="https://github.com/andreGarvin/teatime"><h1>TeaTime</h1></a>'),
        '<div><a href="https://github.com/andreGarvin/teatime"><h1>TeaTime</h1></a></div>'
    )
})


test('appending a node object into another nodeobject', t => {
    t.deepEqual(
        DOM.appendChild({
            nodeName: 'div'
        }, {
            nodeName: 'p',
            attributes: {
                id: 'username'
            }
        }),
        {
            nodeName: 'div',
            childern: [
                {
                    nodeName: 'p',
                    attributes: {
                        id: 'username'
                    }
                }
            ]
        }
    )
})

test('appending a string html element into a node object but not converting the string into a node object', t => {
    t.deepEqual(
        DOM.appendChild({ nodeName: 'div' }, DOM.createElement('div'), false),
        { nodeName: 'div', childern: ['<div></div>'] }
    )
})