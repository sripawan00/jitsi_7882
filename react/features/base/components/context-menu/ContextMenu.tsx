/* eslint-disable lines-around-comment */

import { Theme } from '@mui/material';
import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import { getComputedOuterHeight } from '../../../participants-pane/functions';
// @ts-ignore
import { Drawer, JitsiPortal } from '../../../toolbox/components/web';
// @ts-ignore
import { showOverflowDrawer } from '../../../toolbox/functions.web';
import { withPixelLineHeight } from '../../styles/functions.web';
import participantsPaneTheme from '../themes/participantsPaneTheme.json';

type Props = {

    /**
     * Accessibility label for menu container.
     */
    accessibilityLabel?: string;

    /**
     * Children of the context menu.
     */
    children: ReactNode;

    /**
     * Class name for context menu. Used to overwrite default styles.
     */
    className?: string;

    /**
     * The entity for which the context menu is displayed.
     */
    entity?: Object;

    /**
     * Whether or not the menu is hidden. Used to overwrite the internal isHidden.
     */
    hidden?: boolean;

    /**
     * Whether or not the menu is already in a drawer.
     */
    inDrawer?: boolean;

    /**
     * Whether or not drawer should be open.
     */
    isDrawerOpen?: boolean;

    /**
     * Target elements against which positioning calculations are made.
     */
    offsetTarget?: HTMLElement;

    /**
     * Callback for click on an item in the menu.
     */
    onClick?: (e?: React.MouseEvent) => void;

    /**
     * Callback for drawer close.
     */
    onDrawerClose?: (e?: React.MouseEvent) => void;

    /**
     * Keydown handler.
     */
    onKeyDown?: (e?: React.KeyboardEvent) => void;

    /**
     * Callback for the mouse entering the component.
     */
    onMouseEnter?: (e?: React.MouseEvent) => void;

    /**
     * Callback for the mouse leaving the component.
     */
    onMouseLeave?: (e?: React.MouseEvent) => void;
};

const MAX_HEIGHT = 400;

const useStyles = makeStyles()((theme: Theme) => {
    return {
        contextMenu: {
            backgroundColor: theme.palette.ui02,
            borderRadius: `${Number(theme.shape.borderRadius) / 2}px`,
            boxShadow: '0px 3px 16px rgba(0, 0, 0, 0.6), 0px 0px 4px 1px rgba(0, 0, 0, 0.25)',
            color: theme.palette.text01,
            ...withPixelLineHeight(theme.typography.bodyShortRegular),
            marginTop: `${(participantsPaneTheme.panePadding * 2) + theme.typography.bodyShortRegular.fontSize}px`,
            position: 'absolute',
            right: `${participantsPaneTheme.panePadding}px`,
            top: 0,
            zIndex: 2,
            maxHeight: `${MAX_HEIGHT}px`,
            overflowY: 'auto'
        },

        contextMenuHidden: {
            pointerEvents: 'none',
            visibility: 'hidden'
        },

        drawer: {

            '& > div': {
                ...withPixelLineHeight(theme.typography.bodyShortRegularLarge),

                '& svg': {
                    fill: theme.palette.icon01
                }
            },

            '& > *:first-child': {
                paddingTop: '15px!important'
            }
        }
    };
});

const ContextMenu = ({
    accessibilityLabel,
    children,
    className,
    entity,
    hidden,
    inDrawer,
    isDrawerOpen,
    offsetTarget,
    onClick,
    onKeyDown,
    onDrawerClose,
    onMouseEnter,
    onMouseLeave
}: Props) => {
    const [ isHidden, setIsHidden ] = useState(true);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { classes: styles, cx } = useStyles();
    const _overflowDrawer = useSelector(showOverflowDrawer);

    useLayoutEffect(() => {
        if (_overflowDrawer) {
            return;
        }
        if (entity && offsetTarget
            && containerRef.current
            && offsetTarget?.offsetParent
            && offsetTarget.offsetParent instanceof HTMLElement
        ) {
            const { current: container } = containerRef;
            const { offsetTop, offsetParent: { offsetHeight, scrollTop } } = offsetTarget;
            const outerHeight = getComputedOuterHeight(container);
            const height = Math.min(MAX_HEIGHT, outerHeight);

            container.style.top = offsetTop + height > offsetHeight + scrollTop
                ? `${offsetTop - outerHeight}`
                : `${offsetTop}`;

            setIsHidden(false);
        } else {
            hidden === undefined && setIsHidden(true);
        }
    }, [ entity, offsetTarget, _overflowDrawer ]);

    useEffect(() => {
        if (hidden !== undefined) {
            setIsHidden(hidden);
        }
    }, [ hidden ]);

    if (_overflowDrawer && inDrawer) {
        return (<div
            className = { styles.drawer }
            onClick = { onDrawerClose }>
            {children}
        </div>);
    }

    return _overflowDrawer
        ? <JitsiPortal>
            <Drawer
                isOpen = { isDrawerOpen && _overflowDrawer }
                onClose = { onDrawerClose }>
                <div
                    className = { styles.drawer }
                    onClick = { onDrawerClose }>
                    {children}
                </div>
            </Drawer>
        </JitsiPortal>
        : <div
            aria-label = { accessibilityLabel }
            className = { cx(participantsPaneTheme.ignoredChildClassName,
                styles.contextMenu,
                isHidden && styles.contextMenuHidden,
                className
            ) }
            onClick = { onClick }
            onKeyDown = { onKeyDown }
            onMouseEnter = { onMouseEnter }
            onMouseLeave = { onMouseLeave }
            ref = { containerRef }>
            {children}
        </div>;
};

export default ContextMenu;
