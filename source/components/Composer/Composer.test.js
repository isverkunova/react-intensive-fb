// Core
import React from 'react';
import { mount, render } from 'enzyme';
import { Composer } from './';

const _createPostMock = jest.fn();
const _preventDefaultMock = jest.fn();

const avatar = 'https://www.avatar.com';
const currentUserFirstName = 'Brad';

const props = {
    _createPost: _createPostMock,
    currentUserFirstName,
    avatar,
};

const comment = 'Merry Christmas!';

const initialState = {
    comment: '',
};

const updatedState = {
    comment,
};

const result = mount(<Composer { ...props } />);
const markup = render(<Composer { ...props } />);

const _submitCommentSpy = jest.spyOn(result.instance(), '_submitComment');
const _handleFormSubmitSpy = jest.spyOn(result.instance(), '_handleFormSubmit');
const _submitOnEnterSpy = jest.spyOn(result.instance(), '_submitOnEnter');

describe('Composer component:', () => {
    // Markup existence
    test('should have 1 <section> element', () => {
        expect(result.find('section')).toHaveLength(1);
    });

    test('should have 1 <form> element', () => {
        expect(result.find('form')).toHaveLength(1);
    });

    test('should have 1 <textarea> element', () => {
        expect(result.find('textarea')).toHaveLength(1);
    });

    test('should have 1 <input> element', () => {
        expect(result.find('input')).toHaveLength(1);
    });

    test('should have 1 <img> element', () => {
        expect(result.find('img')).toHaveLength(1);
    });

    // State
    test('should have valid initial state', () => {
        expect(result.state()).toEqual(initialState);
    });

    test('textarea value should be empty initially', () => {
        expect(result.find('textarea').text()).toBe('');
    });

    test('should respond to state change properly', () => {
        result.setState({
            comment,
        });

        expect(result.state()).toEqual(updatedState);
        expect(result.find('textarea').text()).toBe(comment);

        result.setState({
            comment: '',
        });

        expect(result.state()).toEqual(initialState);
        expect(result.find('textarea').text()).toBe('');
    });

    // Events
    test('should handle textarea "change" event>', () => {
        result.find('textarea').simulate('change', {
            target: {
                value: comment,
            },
        });

        expect(result.find('textarea').text()).toBe(comment);
        expect(result.state()).toEqual(updatedState);
    });

    test('should handle form "submit" event>', () => {
        result.find('form').simulate('submit');

        expect(result.state()).toEqual(initialState);
    });

    test('_createPost prop should be invoked once after form submission', () => {
        expect(props._createPost).toHaveBeenCalledTimes(1);
    });

    test('_submitCommentSpy and _handleFormSubmitSpy class methods should be invoked once after form is submitted', () => {
        expect(_submitCommentSpy).toHaveBeenCalledTimes(1);
        expect(_handleFormSubmitSpy).toHaveBeenCalledTimes(1);
    });

    test('_submitOnEnterSpy class method should be invoked once after form is submitted on Enter', () => {
        result.find('textarea').simulate('keyPress');

        expect(_submitOnEnterSpy).toHaveBeenCalledTimes(1);
    });

    test('should respond to textarea placeholder properly', () => {
        expect(markup.find('textarea').attr('placeholder')).toEqual(
            `What's on your mind, ${props.currentUserFirstName}?`,
        );
    });

    test('should respond to img src properly', () => {
        expect(markup.find('img').attr('src')).toBe(props.avatar);
    });

    test('"!comment" should return null', () => {
        expect(_submitCommentSpy(!comment)).toBeNull();
    });

    test('event.preventDefault() should be called after form is submitted on Enter', () => {
        result.find('textarea').simulate('keyPress', {
            preventDefault: _preventDefaultMock,
            key:            'Enter',
        });
        expect(_preventDefaultMock).toHaveBeenCalledTimes(1);
        expect(_submitOnEnterSpy).toHaveBeenCalledTimes(2);
    });
});
