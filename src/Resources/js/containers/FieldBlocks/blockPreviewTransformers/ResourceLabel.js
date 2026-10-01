// @flow
import React, {useEffect, useState} from 'react';
import {ResourceRequester} from 'sulu-admin-bundle/services';
import userStore from 'sulu-admin-bundle/stores/userStore';
import {translate} from 'sulu-admin-bundle/utils/Translator';

const CACHE_TTL = 30000;
const FALLBACK_PROPERTIES = ['title', 'name', 'fullName'];
const cache: {[string]: {promise: Promise<?string>, time: number}} = {};

function load(resourceKey: string, id: string | number, displayProperty: string, locale: ?string): Promise<?string> {
    const key = [resourceKey, id, locale].join('|');
    const entry = cache[key];

    if (entry && Date.now() - entry.time < CACHE_TTL) {
        return entry.promise;
    }

    const promise = ResourceRequester.get(resourceKey, {id, locale})
        .then((response) => {
            for (const property of [displayProperty, ...FALLBACK_PROPERTIES]) {
                if (response && typeof response[property] === 'string' && response[property]) {
                    return response[property];
                }
            }

            return null;
        })
        .catch(() => null);

    cache[key] = {promise, time: Date.now()};

    return promise;
}

type Props = {|
    displayProperty: string,
    id: string | number,
    resourceKey: string,
|};

export default function ResourceLabel({displayProperty, id, resourceKey}: Props) {
    // undefined = still loading, null = could not be loaded
    const [label, setLabel] = useState<?string>(undefined);
    const locale = userStore.contentLocale;

    useEffect(() => {
        let active = true;

        load(resourceKey, id, displayProperty, locale).then((result) => {
            if (active) {
                setLabel(result);
            }
        });

        return () => {
            active = false;
        };
    }, [resourceKey, id, displayProperty, locale]);

    if (label === undefined) {
        return <>…</>;
    }

    return <>{label || translate('sulu_admin_extras.block_preview_selected')}</>;
}
