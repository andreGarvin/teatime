# TeaTime: Server side rendering JS framework for building display only application.

### I named it teatime because I was eating these bajan ( origin from Barbados ) cookies called teatime at the same time I was creating this project. They are really goooooood. ;)

### This package is not on npm or yarn right at the moment, I am trying to polish the code up a bit and writing test for v2 launch.

## Basic ways to use teatime:
#### *If you want to learn more look at the test I wrote. There are more examples look at.
```js
const teatime = require('./')
const DOM = new teatime()

let div = DOM.createElement('div') // '<div></div>'

div = DOM.appendChild(div, {
    nodeName: 'p',
    childern: [
        'Hello, World!'
    ]
})
/*
    result: '<div><p>Hello, World!</p></div>'

    You can also append:
        - string into another sting.
        - object into another object.
        - string into object, but the
        string with be parsed into node
        object.
*/

// To not parse a appending string into a object just do this
DOM.appendChild({
    nodeName: 'span'
}, '<p>still a string</p>', false)

// create a string html element/tag '<div class="box"></div>'
const p = DOM.stringify({
    nodeName: 'div',
    attributes: {
        class: 'box'
    }
})


const nodeObject = DOM.parse(`
    <div class="header" id="special" style="color: red;">
        <p>Hello, World!</p>
        <a href="https://google.com">
            google link
        </a>
    </div>
`)
/*
{
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
}
*/
```