/* eslint-disable lines-around-comment */
import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
    ACTION_SHORTCUT_PRESSED as PRESSED,
    ACTION_SHORTCUT_RELEASED as RELEASED,
    createShortcutEvent
} from '../../../../analytics/AnalyticsEvents';
import { sendAnalytics } from '../../../../analytics/functions';
import { IState } from '../../../../app/types';
// @ts-ignore
import { AUDIO_MUTE_BUTTON_ENABLED, getFeatureFlag } from '../../../../base/flags';
import Icon from '../../../../base/icons/components/Icon';
import { IconMicrophone, IconMicrophoneEmptySlash } from '../../../../base/icons/svg';
import { MEDIA_TYPE } from '../../../../base/media/constants';
// @ts-ignore
import { isLocalTrackMuted } from '../../../../base/tracks';
// @ts-ignore
import { isAudioMuteButtonDisabled } from '../../../../toolbox/functions.any';
// @ts-ignore
import { muteLocal } from '../../../../video-menu/actions';

// @ts-ignore
import styles from './styles';

const LONG_PRESS = 'long.press';

/**
 * Implements a round audio mute/unmute button of a custom size.
 *
 * @returns {JSX.Element} - The audio mute round button.
 */
const MicrophoneButton = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const audioMuted = useSelector((state: IState) => isLocalTrackMuted(state['features/base/tracks'],
        MEDIA_TYPE.AUDIO));
    const disabled = useSelector(isAudioMuteButtonDisabled);
    const enabledFlag = useSelector(state => getFeatureFlag(state, AUDIO_MUTE_BUTTON_ENABLED, true));
    const [ longPress, setLongPress ] = useState(false);

    if (!enabledFlag) {
        return null;
    }

    const onPressIn = useCallback(() => {
        !disabled && dispatch(muteLocal(!audioMuted, MEDIA_TYPE.AUDIO));
    }, [ audioMuted, disabled ]);

    const onLongPress = useCallback(() => {
        if (!disabled && !audioMuted) {
            sendAnalytics(createShortcutEvent(
                'push.to.talk',
                PRESSED,
                {},
                LONG_PRESS));
            setLongPress(true);
        }
    }, [ audioMuted, disabled, setLongPress ]);

    const onPressOut = useCallback(() => {
        if (longPress) {
            setLongPress(false);
            sendAnalytics(createShortcutEvent(
                'push.to.talk',
                RELEASED,
                {},
                LONG_PRESS
            ));
            dispatch(muteLocal(true, MEDIA_TYPE.AUDIO));
        }
    }, [ longPress, setLongPress ]);

    return (
        <TouchableOpacity
            onLongPress = { onLongPress }
            onPressIn = { onPressIn }
            onPressOut = { onPressOut } >
            <View
                style = { [
                    styles.microphoneStyles.container,
                    !audioMuted && styles.microphoneStyles.unmuted
                ] }>
                <View
                    style = { styles.microphoneStyles.iconContainer }>
                    <Icon
                        src = { audioMuted ? IconMicrophoneEmptySlash : IconMicrophone }
                        style = { styles.microphoneStyles.icon } />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MicrophoneButton;
