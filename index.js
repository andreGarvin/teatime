Math.range = (i, j) => {
    const arr = []
    for (i = i; i <= j; i++) {
        arr.push(i)
    }
    return arr
}

class teatime {

    createElement(nodeName, atr, children) {
        atr = isFalsey(atr) ? {} : atr
        children = isFalsey(children) ? [] : Array.isArray(children) ? children : [ children ]

        if (nodeName !== undefined && typeof nodeName === 'string') {
            const newElement = {
                nodeName,
                children,
                attributes: atr,
            }
            
            return this.stringify(newElement)
        }
        throw new Error('No nodeName name was given.')

    }
    
    // stringifies the element object
    stringify(obj, indentation = 3) {
        obj.children = Array.isArray(obj.children) ? obj.children : [obj.children]
        
        if (isObject(obj)) {

            const attributes = createAttributeString(obj.attributes)
            const children = obj.children
                .map(child => {
                    if ( isObject(child) ) {
                        return this.stringify(child, (indentation * indentation))
                    } else if (typeof child === 'string') {
                        return child
                    }
                }).join('\n')

            // const childernStr = childern.length !== 0 ? `${ childern[0] === '<' ? ' '.repeat(indentation) : '' }${ childern }` : ''
            return [
                `<${obj.nodeName}${isFalsey(attributes) ? '' : ' ' + attributes}>`,
                `${children}`,
                `</${obj.nodeName}>`
            ].join('')
        }
    }

    parse(str, parsed) {
        let deconstructedNode;

        if (!parsed) {
            str = cleanNodeString(str)
            deconstructedNode = removeAngleBrackets(str)
        } else {
            deconstructedNode = str
        }

        const DOM = {};
        const node = {
            nodeName: null,
            children: [],
            attributes: {}
        }

        deconstructedNode
            .forEach((line, i) => {

                if (line.includes('=')) {
                    if (node.nodeName === null) {
                        const [nodeName, attributes] = splitnth(line, ' ', 1)

                        node.nodeName = nodeName
                        node.attributes = getAttributes(attributes)
                    } else {
                        if (ishtml(line[0])) {
                            const child = deconstructedNode.slice(i, deconstructedNode.indexOf(`/${line[0]}`) + 1)
                            node.children.push(
                                this.parse(
                                    child,
                                    true
                                )
                            )
                            deconstructedNode.splice(i, deconstructedNode.indexOf(`/${line[0]}`) + 1)
                        }
                    }
                } else if (parsed && ishtml(line)) {
                    node.nodeName = line
                } else {
                    if (node.nodeName !== line) {
                        if (ishtml(line) && node.nodeName === null) {
                            node.nodeName = line
                        } else if (ishtml(line)) {
                            const child = deconstructedNode.slice(i, deconstructedNode.indexOf(`/${line}`) + 1)
                            node.children.push(
                                this.parse(
                                    child,
                                    true
                                )
                            )
                            deconstructedNode.splice(i, deconstructedNode.indexOf(`/${line}`) - 1)
                        } else if (line[0] !== '/') {
                            node.children.push(line.trim())
                        }
                    }
                }
            })
        return node
    }
    
    appendChild(trg, entity, convert = true) {

        // If one is a object and one is a string or viceversa
        if (isObject(trg) && typeof entity === 'string') {
            entity = convert ? this.parse(entity) : entity
            
            trg.children = trg.children || []
            
            trg.children.push(entity)
            return trg
        } else if (typeof trg === 'string' && isObject(entity)) {
            entity = this.stringify(entity)

            return [
                trg.split('>').slice(0, -2).join('>') +  '>',
                entity,
                trg.split('>').slice(-2).join('>')
            ].join('')
        }
        
        if (typeof trg === 'string' && typeof entity === 'string') {
            return [
                trg.split('>').slice(0, -2).join('>') + '>',
                entity,
                trg.split('>').slice(-2).join('>')
            ].join('')
        } else if (isObject(trg) && isObject(entity)) {
            trg.children = trg.children || []
            trg.children.push(entity)
            return trg
        }
    }

    innerHtml(element, text) {
        if (isFalsey(text)) {
            throw new Error('NO new insert data was given')
            return; 
        } else if (isObject(text)) {
            text = this.stringify(text)
        }

        const indexRight = returnIndexies(element, '>')
        const indexLeft = returnIndexies(element, '<')


        if (indexLeft.length !== indexRight.length) {
            throw new Error('Both sides are no the same length')
            return;
        }

        const splitedElement = [];
        for (let i = 0; i < indexLeft.length; i++) {
            if (indexRight[i - 1] && indexLeft[i]) {
                if (indexLeft[i] - indexRight[i - 1] !== 1) {
                    splitedElement.push(
                        element.slice(indexRight[i - 1] + 1, indexLeft[i])
                    )
                }
            }
            splitedElement.push(
                element.slice(indexLeft[i], indexRight[i] + 1)
            )
        }
        return [
            splitedElement[0],
            text,
            splitedElement.slice(-1)[0]
        ].join('')
    }
}


module.exports = teatime


function createAttributeString(attributes, sep) {
    let str = '';

    for (let i in attributes) {
        const attribute = attributes[i];

        if (isObject(attribute)) {
            str += 'style="'

            JSON.parse(JSON.stringify(attribute), (k, v) => {
                if (!isObject(v)) {
                    str += `${k}: ${v};`
                }
            })

            str += '"'
        } else {
            str += `${i}="${(attributes[i] || '')}`

            if (sep) {
                str += (sep || '')
            }

            str += i === Object.keys(attributes)[Object.keys(attributes).length - 1] ? '"' : '" '
        }
    }
    return str;
}


const removeAngleBrackets = (str) => {
    const indexies = returnIndexies(str, ['<', '>'])
    const strippedNodeArray = []


    for (let i = 0; i < indexies.length; i++) {
        if (i % 2 !== 0) {
            let _str = str.slice(indexies[i] + 1, indexies[i + 1])
            if (!['<', '>', ''].includes(_str) && _str.trim().length !== 0) {
                strippedNodeArray.push(_str)
            }
        } else {
            strippedNodeArray.push(
                str.slice(indexies[i] + 1, indexies[i + 1])
            )
        }
    }
    return strippedNodeArray
}

const getAttributes = (str) => {
    const attributes = {}

    const arr = str.split('"')
        .map(i => {
            if (i.includes('=')) {
                return strip(i, '=').trim()
            }
            return i;
        }).filter(i => i !== '')

    for (let i = 0; i < arr.length; i += 2) {
        if (arr[i] === 'style') {
            const style = {}

            arr[i + 1].split(';')
                .forEach(e => {
                    if (e !== '') {
                        const [prop, value] = e.split(':')
                        style[prop] = value.trim()
                    }
                })
            attributes.style = style
        } else {
            attributes[arr[i]] = strip(arr[i + 1], '"')
        }
    }
    return attributes
}

const returnIndexies = (str, symbol) => {
    symbol = Array.isArray(symbol) ? symbol : [symbol]

    return str.split('')
        .map((char, i) => symbol.includes(char) ? i : -1)
        .filter(i => i !== -1)
}

const cleanNodeString = (str) => {
    ['\n', '\t']
        .forEach(i => {
            str = strip(str, i)
        })
    return str
}

const strip = (x, sep) => x.split(sep).join('')
const isObject = (x) => typeof x === 'object' && !Array.isArray(x)
const isFalsey = (x) => [undefined, null, false, 0, ''].includes(x)
const splitnth = (x, s, n) => n < x.split(s).length ? [ x.split(s).slice(0, n).join(s), x.split(s).slice(n).join(s) ] : [ x ]
const ishtml = (s) => ['div', 'footer', 'p', ...Math.range(1, 6).map(i => `h${i}`), 'span', 'img', 'i', 'ol', 'ul', 'li', 'svg', 'script', 'link', 'head', 'body', 'title', 'strong', 'i', 'a', 'canvas'].includes(s)