// @flow
import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import Header from '../../../../src/Resources/js/containers/Drawer/Header';

describe('Header', () => {
    test('Should render children', () => {
        const {container} = render(
            <Header>My Title</Header>
        );

        expect(container.textContent).toContain('My Title');
    });

    test('Should render close button when onClose is provided', () => {
        const onClose = jest.fn();
        const {container} = render(
            <Header onClose={onClose}>Title</Header>
        );

        const button = container.querySelector('button');
        expect(button).toBeTruthy();
        expect(button.textContent).toBe('\u00D7');
    });

    test('Should NOT render close button when onClose is not provided', () => {
        const {container} = render(
            <Header>Title</Header>
        );

        const button = container.querySelector('button');
        expect(button).toBeNull();
    });

    test('Should call onClose when close button is clicked', () => {
        const onClose = jest.fn();
        const {container} = render(
            <Header onClose={onClose}>Title</Header>
        );

        fireEvent.click(container.querySelector('button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
