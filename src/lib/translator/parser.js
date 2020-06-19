import {
    tagNode,
    textNode,
    isNode,
    placeholderNode,
} from './nodes';

const STATE = {
    TEXT: 'text',
    TAG: 'tag',
    PLACEHOLDER: 'placeholder',
};

export const parser = (str) => {
    const stack = [];
    const result = [];

    let i = 0;
    let currentState = STATE.TEXT;
    let tag = '';
    let text = '';
    let placeholder = '';

    while (i < str.length) {
        const currChar = str[i];
        switch (currentState) {
            case STATE.TEXT: {
                // switch to the tag state
                if (currChar === '<') {
                    currentState = STATE.TAG;
                    // save text in the node
                    if (text.length > 0) {
                        const node = textNode(text);
                        // if stack is not empty add text to the result
                        if (stack.length > 0) {
                            // if last node was text node, append text
                            if (stack[stack.length - 1].type === 'text') {
                                stack[stack.length - 1].value += text;
                            } else {
                                stack.push(node);
                            }
                        } else if (result.length > 0) {
                            // if last node was text node, append text
                            if (result[result.length - 1].type === 'text') {
                                result[result.length - 1].text += text;
                            } else {
                                result.push(node);
                            }
                        } else {
                            result.push(node);
                        }
                        text = '';
                    }
                } else if (currChar === '{') {
                    currentState = STATE.PLACEHOLDER;
                    // TODO extract into method
                    // save text in the node
                    if (text.length > 0) {
                        const node = textNode(text);
                        // if stack is not empty add text to the result
                        if (stack.length > 0) {
                            // if last node was text node, append text
                            if (stack[stack.length - 1].type === 'text') {
                                stack[stack.length - 1].value += text;
                            } else {
                                stack.push(node);
                            }
                        } else if (result.length > 0) {
                            // if last node was text node, append text
                            if (result[result.length - 1].type === 'text') {
                                result[result.length - 1].text += text;
                            } else {
                                result.push(node);
                            }
                        } else {
                            result.push(node);
                        }
                        text = '';
                    }
                } else {
                    text += currChar;
                }
                break;
            }
            case STATE.TAG: {
                // if found tag end
                if (currChar === '>') {
                    // if the tag is close tag
                    if (tag.indexOf('/') === 0) {
                        tag = tag.substring(1);
                        let children = [];
                        // search for the opening tag
                        // eslint-disable-next-line no-constant-condition
                        while (true) {
                            const lastFromStack = stack.pop();
                            if (lastFromStack === tag) {
                                const node = tagNode(tag, children);
                                if (stack.length > 0) {
                                    stack.push(node);
                                } else {
                                    result.push(node);
                                }
                                children = [];
                                break;
                            } else if (isNode(lastFromStack)) {
                                // add nodes between close tag and open tag to the children
                                children.unshift(lastFromStack);
                            } else {
                                throw new Error('String has unbalanced tags');
                            }
                            if (stack.length === 0 && children.length > 0) {
                                throw new Error('String has unbalanced tags');
                            }
                        }
                    } else {
                        stack.push(tag);
                    }
                    currentState = STATE.TEXT;
                    tag = '';
                } else if (currChar === '<') {
                    // Seems like we wrongly moved into tag state,
                    // return to the text state with accumulated tag string
                    currentState = STATE.TEXT;
                    text += currChar;
                    text += tag;
                    tag = '';
                    i -= 1;
                } else {
                    tag += currChar;
                }
                break;
            }
            case STATE.PLACEHOLDER: {
                if (currChar === '}') {
                    currentState = STATE.TEXT;
                    const node = placeholderNode(placeholder);
                    // if stack is not empty add placeholder to the stack
                    if (stack.length > 0) {
                        stack.push(node);
                    } else {
                        result.push(node);
                    }
                    placeholder = '';
                } else {
                    placeholder += currChar;
                }
                break;
            }
            default: {
                throw new Error(`There is no such state ${currentState}`);
            }
        }

        i += 1;
    }

    if (text.length > 0) {
        result.push(textNode(text));
    }

    if (stack.length > 0) {
        throw new Error('String has unbalanced tags');
    }

    return result;
};