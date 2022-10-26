import { IState } from '../app/types';
import { getToolbarButtons } from '../base/config/functions.web';
import { hasAvailableDevices } from '../base/devices/functions';
import { isScreenMediaShared } from '../screen-share/functions';
import { isWhiteboardVisible } from '../whiteboard/functions';

import { TOOLBAR_TIMEOUT } from './constants';

export * from './functions.any';

/**
 * Helper for getting the height of the toolbox.
 *
 * @returns {number} The height of the toolbox.
 */
export function getToolboxHeight() {
    const toolbox = document.getElementById('new-toolbox');

    return toolbox?.clientHeight || 0;
}

/**
 * Indicates if a toolbar button is enabled.
 *
 * @param {string} name - The name of the setting section as defined in
 * interface_config.js.
 * @param {IState} state - The redux state.
 * @returns {boolean|undefined} - True to indicate that the given toolbar button
 * is enabled, false - otherwise.
 */
export function isButtonEnabled(name: string, state: IState) {
    const toolbarButtons = getToolbarButtons(state);

    return toolbarButtons.indexOf(name) !== -1;
}

/**
 * Indicates if the toolbox is visible or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean} - True to indicate that the toolbox is visible, false -
 * otherwise.
 */
export function isToolboxVisible(state: IState) {
    const { iAmRecorder, iAmSipGateway, toolbarConfig } = state['features/base/config'];
    const { alwaysVisible } = toolbarConfig || {};
    const {
        timeoutID,
        visible
    } = state['features/toolbox'];
    const { audioSettingsVisible, videoSettingsVisible } = state['features/settings'];
    const whiteboardVisible = isWhiteboardVisible(state);

    return Boolean(!iAmRecorder && !iAmSipGateway
            && (
                timeoutID
                || visible
                || alwaysVisible
                || audioSettingsVisible
                || videoSettingsVisible
                || whiteboardVisible
            ));
}

/**
 * Indicates if the audio settings button is disabled or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function isAudioSettingsButtonDisabled(state: IState) {

    return !(hasAvailableDevices(state, 'audioInput')
        || hasAvailableDevices(state, 'audioOutput'))
        || state['features/base/config'].startSilent;
}

/**
 * Indicates if the desktop share button is disabled or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function isDesktopShareButtonDisabled(state: IState) {
    const { muted, unmuteBlocked } = state['features/base/media'].video;
    const videoOrShareInProgress = !muted || isScreenMediaShared(state);

    return unmuteBlocked && !videoOrShareInProgress;
}

/**
 * Indicates if the video settings button is disabled or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function isVideoSettingsButtonDisabled(state: IState) {
    return !hasAvailableDevices(state, 'videoInput');
}

/**
 * Indicates if the video mute button is disabled or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function isVideoMuteButtonDisabled(state: IState) {
    const { muted, unmuteBlocked } = state['features/base/media'].video;

    return !hasAvailableDevices(state, 'videoInput') || (unmuteBlocked && Boolean(muted));
}

/**
 * If an overflow drawer should be displayed or not.
 * This is usually done for mobile devices or on narrow screens.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function showOverflowDrawer(state: IState) {
    return state['features/toolbox'].overflowDrawer;
}

/**
 * Indicates whether the toolbox is enabled or not.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {boolean}
 */
export function isToolboxEnabled(state: IState) {
    return state['features/toolbox'].enabled;
}

/**
 * Returns the toolbar timeout from config or the default value.
 *
 * @param {IState} state - The state from the Redux store.
 * @returns {number} - Toolbar timeout in milliseconds.
 */
export function getToolbarTimeout(state: IState) {
    const { toolbarConfig } = state['features/base/config'];

    return toolbarConfig?.timeout || TOOLBAR_TIMEOUT;
}
