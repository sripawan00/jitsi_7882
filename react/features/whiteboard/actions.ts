import {
    RESET_WHITEBOARD,
    SETUP_WHITEBOARD,
    SET_WHITEBOARD_OPEN
} from './actionTypes';
import { WhiteboardAction } from './reducer';

/**
 * Configures the whiteboard collaboration details.
 *
 * @param {Object} payload - The whiteboard settings.
 * @returns {{
 *     type: SETUP_WHITEBOARD,
 *     collabDetails: { roomId: string, roomKey: string }
 * }}
 */
export const setupWhiteboard = ({ collabDetails }: {
    collabDetails: { roomId: string; roomKey: string; };
}): WhiteboardAction => {
    return {
        type: SETUP_WHITEBOARD,
        collabDetails
    };
};

/**
 * Cleans up the whiteboard collaboration settings.
 * To be used only on native for cleanup in between conferences.
 *
 * @returns {{
 *     type: RESET_WHITEBOARD
 * }}
 */
export const resetWhiteboard = (): WhiteboardAction => {
    return { type: RESET_WHITEBOARD };
};

/**
 * Sets the whiteboard visibility status.
 *
 * @param {boolean} isOpen - The whiteboard visibility flag.
 * @returns {{
 *      type: SET_WHITEBOARD_OPEN,
 *      isOpen
 * }}
 */
export const setWhiteboardOpen = (isOpen: boolean): WhiteboardAction => {
    return {
        type: SET_WHITEBOARD_OPEN,
        isOpen
    };
};
