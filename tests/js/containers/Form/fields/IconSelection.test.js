// @flow
import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: (key) => key,
}));

jest.mock('sulu-admin-bundle/stores/userStore', () => ({
    contentLocale: 'en',
}));

jest.mock('sulu-admin-bundle/components', () => ({
    Icon: function Icon({name}) {
        return <i data-icon={name} />;
    },
}));

// Sulu core's own SingleListOverlay does the actual REST loading/search/pagination and is covered by Sulu's
// own test suite; this bundle only replaces IconSelection's preview and IconAdapter's tiles (see index.js), so
// the overlay itself is faked here to keep this test focused and independent of Sulu's list-store internals.
jest.mock('sulu-admin-bundle/containers/SingleListOverlay', () => function SingleListOverlay({onClose, onConfirm, open}) {
    return open
        ? (
            <div data-testid="overlay">
                <button onClick={() => onConfirm({id: 'house-door'})} type="button">confirm house-door</button>
                <button onClick={onClose} type="button">close</button>
            </div>
        )
        : null;
});

jest.mock('../../../../../src/Resources/js/stores/iconContentStore', () => ({
    load: jest.fn(),
}));

import IconSelection from '../../../../../src/Resources/js/containers/Form/fields/IconSelection';
import iconContentStore from '../../../../../src/Resources/js/stores/iconContentStore';

beforeEach(() => {
    iconContentStore.load.mockReset();
    iconContentStore.load.mockResolvedValue('<svg viewBox="0 0 16 16"><path d="M1 2"/></svg>');
});

const schemaOptions = {icon_set: {name: 'icon_set', value: 'bootstrap-icons'}};

describe('IconSelection', () => {
    test('renders the resolved icon content next to its name', async() => {
        const {container} = render(
            <IconSelection {...fieldTypeDefaultProps} schemaOptions={schemaOptions} value="calendar-heart" />
        );

        expect(iconContentStore.load).toHaveBeenCalledWith('bootstrap-icons', 'calendar-heart');
        expect(await screen.findByText('calendar-heart')).toBeInTheDocument();
        await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
        // exactly two buttons: the left "open picker" button and the remove button, like single_media_selection
        expect(container.querySelectorAll('button')).toHaveLength(2);
    });

    test('renders the empty text without value', () => {
        render(<IconSelection {...fieldTypeDefaultProps} schemaOptions={schemaOptions} />);

        expect(screen.getByText('sulu_admin.single_icon_selection.select')).toBeInTheDocument();
        expect(iconContentStore.load).not.toHaveBeenCalled();
    });

    test('shows a warning icon while the content is missing', async() => {
        iconContentStore.load.mockResolvedValue(undefined);

        const {container} = render(
            <IconSelection {...fieldTypeDefaultProps} schemaOptions={schemaOptions} value="does-not-exist" />
        );

        await screen.findByText('does-not-exist');
        expect(container.querySelector('[data-icon="su-exclamation-triangle"]')).not.toBeNull();
    });

    test('removes the icon', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = render(
            <IconSelection
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                schemaOptions={schemaOptions}
                value="house"
            />
        );

        fireEvent.click(container.querySelectorAll('button')[1]);

        expect(onChange).toHaveBeenCalledWith(undefined);
        expect(onFinish).toHaveBeenCalled();
    });

    test('selects an icon in the overlay', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = render(
            <IconSelection
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                schemaOptions={schemaOptions}
            />
        );

        fireEvent.click(container.querySelector('button'));
        fireEvent.click(screen.getByText('confirm house-door'));

        expect(onChange).toHaveBeenCalledWith('house-door');
        expect(onFinish).toHaveBeenCalled();
        expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });

    test('does not open the overlay without a configured icon_set', () => {
        const {container} = render(<IconSelection {...fieldTypeDefaultProps} value={undefined} />);

        fireEvent.click(container.querySelector('button'));

        expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });
});
