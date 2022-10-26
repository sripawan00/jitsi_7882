/* eslint-disable lines-around-comment */
import { withStyles } from '@mui/styles';
import React, { Component } from 'react';
import { WithTranslation } from 'react-i18next';
import { batch } from 'react-redux';

import { IState } from '../../../app/types';
import { isMobileBrowser } from '../../../base/environment/utils';
// @ts-ignore
import { translate } from '../../../base/i18n';
import { IconHorizontalPoints } from '../../../base/icons/svg';
import { getLocalParticipant, getParticipantById } from '../../../base/participants/functions';
import { Participant } from '../../../base/participants/types';
// @ts-ignore
import { Popover } from '../../../base/popover';
import { connect } from '../../../base/redux/functions';
// @ts-ignore
import { setParticipantContextMenuOpen } from '../../../base/responsive-ui/actions';
import Button from '../../../base/ui/components/web/Button';
import ConnectionIndicatorContent from
// @ts-ignore
    '../../../connection-indicator/components/web/ConnectionIndicatorContent';
import { THUMBNAIL_TYPE } from '../../../filmstrip/constants';
// @ts-ignore
import { renderConnectionStatus } from '../../actions.web';

import FakeParticipantContextMenu from './FakeParticipantContextMenu';
import ParticipantContextMenu from './ParticipantContextMenu';
// @ts-ignore
import { REMOTE_CONTROL_MENU_STATES } from './RemoteControlButton';

/**
 * The type of the React {@code Component} props of
 * {@link RemoteVideoMenuTriggerButton}.
 */
interface Props extends WithTranslation {

    /**
     * Whether the remote video context menu is disabled.
     */
    _disabled: Boolean;

    /**
     * Shared video local participant owner.
     */
    _localVideoOwner?: boolean;

    /**
     * The position relative to the trigger the remote menu should display
     * from. Valid values are those supported by AtlasKit
     * {@code InlineDialog}.
     */
    _menuPosition: string;

    /**
     * Whether to display the Popover as a drawer.
     */
    _overflowDrawer: boolean;

    /**
     * Participant reference.
     */
    _participant: Participant;

    /**
     * The ID for the participant on which the remote video menu will act.
     */
    _participantDisplayName: string;

    /**
     * The current state of the participant's remote control session.
     */
    _remoteControlState: number;

    /**
     * Whether the popover should render the Connection Info stats.
     */
    _showConnectionInfo: Boolean;

    /**
     * Whether or not the button should be visible.
     */
    buttonVisible: boolean;

    /**
     * An object containing the CSS classes.
     */
    classes: any;

    /**
     * The redux dispatch function.
     */
    dispatch: Function;

    /**
     * Hides popover.
     */
    hidePopover: Function;

    /**
     * The ID for the participant on which the remote video menu will act.
     */
    participantID: string;

    /**
     * Whether the popover is visible or not.
     */
    popoverVisible: boolean;

    /**
     * Shows popover.
     */
    showPopover: Function;

    /**
     * The type of the thumbnail.
     */
    thumbnailType: string;
}

const styles = () => {
    return {
        triggerButton: {
            padding: '3px !important',
            borderRadius: '4px'
        },

        contextMenu: {
            position: 'relative' as const,
            marginTop: 0,
            right: 'auto',
            padding: '0',
            marginRight: '4px',
            marginBottom: '4px'
        }
    };
};

/**
 * React {@code Component} for displaying an icon associated with opening the
 * the {@code VideoMenu}.
 *
 * @augments {Component}
 */
class RemoteVideoMenuTriggerButton extends Component<Props> {

    /**
     * Initializes a new RemoteVideoMenuTriggerButton instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._onPopoverClose = this._onPopoverClose.bind(this);
        this._onPopoverOpen = this._onPopoverOpen.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _disabled,
            _overflowDrawer,
            _showConnectionInfo,
            _participantDisplayName,
            buttonVisible,
            classes,
            participantID,
            popoverVisible
        } = this.props;
        let content;

        if (_showConnectionInfo) {
            content = <ConnectionIndicatorContent participantId = { participantID } />;
        } else if (!_disabled) {
            content = this._renderRemoteVideoMenu();
        }

        if (!content) {
            return null;
        }

        const username = _participantDisplayName;

        return (
            <Popover
                content = { content }
                id = 'remote-video-menu-trigger'
                onPopoverClose = { this._onPopoverClose }
                onPopoverOpen = { this._onPopoverOpen }
                position = { this.props._menuPosition }
                visible = { popoverVisible }>
                {!_overflowDrawer && buttonVisible && !_disabled && (
                    !isMobileBrowser() && <Button
                        accessibilityLabel = { this.props.t('dialog.remoteUserControls', { username }) }
                        className = { classes.triggerButton }
                        icon = { IconHorizontalPoints }
                        size = 'small' />
                )}
            </Popover>
        );
    }

    /**
     * Disable and hide toolbox while context menu is open.
     *
     * @returns {void}
     */
    _onPopoverOpen() {
        const { dispatch, showPopover } = this.props;

        showPopover();
        dispatch(setParticipantContextMenuOpen(true));
    }

    /**
     * Render normal context menu next time popover dialog opens.
     *
     * @returns {void}
     */
    _onPopoverClose() {
        const { dispatch, hidePopover } = this.props;

        hidePopover();
        batch(() => {
            dispatch(setParticipantContextMenuOpen(false));
            dispatch(renderConnectionStatus(false));
        });
    }

    /**
     * Creates a new {@code VideoMenu} with buttons for interacting with
     * the remote participant.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderRemoteVideoMenu() {
        const { _localVideoOwner, _participant, _remoteControlState, classes } = this.props;

        const props = {
            className: classes.contextMenu,
            onSelect: this._onPopoverClose,
            participant: _participant,
            thumbnailMenu: true
        };

        if (_participant?.isFakeParticipant) {
            return (
                <FakeParticipantContextMenu
                    { ...props }
                    localVideoOwner = { _localVideoOwner } />
            );
        }

        return (
            <ParticipantContextMenu
                { ...props }
                remoteControlState = { _remoteControlState } />
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code RemoteVideoMenuTriggerButton}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state: IState, ownProps: Partial<Props>) {
    const { participantID, thumbnailType } = ownProps;
    let _remoteControlState = null;
    const localParticipantId = getLocalParticipant(state)?.id;
    const participant = getParticipantById(state, participantID ?? '');
    const _participantDisplayName = participant?.name;
    const _isRemoteControlSessionActive = participant?.remoteControlSessionStatus ?? false;
    const _supportsRemoteControl = participant?.supportsRemoteControl ?? false;
    const { active, controller } = state['features/remote-control'];
    const { requestedParticipant, controlled } = controller;
    const activeParticipant = requestedParticipant || controlled;
    const { overflowDrawer } = state['features/toolbox'];
    const { showConnectionInfo } = state['features/base/connection'];
    const { remoteVideoMenu } = state['features/base/config'];
    const { ownerId } = state['features/shared-video'];

    if (_supportsRemoteControl
            && ((!active && !_isRemoteControlSessionActive) || activeParticipant === participantID)) {
        if (requestedParticipant === participantID) {
            _remoteControlState = REMOTE_CONTROL_MENU_STATES.REQUESTING;
        } else if (controlled) {
            _remoteControlState = REMOTE_CONTROL_MENU_STATES.STARTED;
        } else {
            _remoteControlState = REMOTE_CONTROL_MENU_STATES.NOT_STARTED;
        }
    }

    let _menuPosition;

    switch (thumbnailType) {
    case THUMBNAIL_TYPE.TILE:
        _menuPosition = 'left-start';
        break;
    case THUMBNAIL_TYPE.VERTICAL:
        _menuPosition = 'left-end';
        break;
    case THUMBNAIL_TYPE.HORIZONTAL:
        _menuPosition = 'top';
        break;
    default:
        _menuPosition = 'auto';
    }

    return {
        _disabled: remoteVideoMenu?.disabled,
        _localVideoOwner: Boolean(ownerId === localParticipantId),
        _menuPosition,
        _overflowDrawer: overflowDrawer,
        _participant: participant ?? { id: '' },
        _participantDisplayName: _participantDisplayName ?? '',
        _remoteControlState,
        _showConnectionInfo: showConnectionInfo
    };
}

export default translate(connect(_mapStateToProps)(
    withStyles(styles)(RemoteVideoMenuTriggerButton)));
