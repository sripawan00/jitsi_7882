/* eslint-disable lines-around-comment */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// @ts-ignore
import { endConference } from '../../../base/conference';
// @ts-ignore
import { isLocalParticipantModerator } from '../../../base/participants';
import Button from '../../../base/ui/components/web/Button';
import { BUTTON_TYPES } from '../../../base/ui/constants';
// @ts-ignore
import { isInBreakoutRoom } from '../../../breakout-rooms/functions';

/**
 * Button to end the conference for all participants.
 *
 * @returns {JSX.Element} - The end conference button.
 */
export const EndConferenceButton = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const _isLocalParticipantModerator = useSelector(isLocalParticipantModerator);
    const _isInBreakoutRoom = useSelector(isInBreakoutRoom);

    const onEndConference = useCallback(() => {
        dispatch(endConference());
    }, [ dispatch ]);

    return (<>
        { !_isInBreakoutRoom && _isLocalParticipantModerator && <Button
            accessibilityLabel = { t('toolbar.accessibilityLabel.endConference') }
            fullWidth = { true }
            label = { t('toolbar.endConference') }
            onClick = { onEndConference }
            type = { BUTTON_TYPES.DESTRUCTIVE } /> }
    </>);
};
