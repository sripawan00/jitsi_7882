import { IState, IStore } from '../../app/types';
import StateListenerRegistry from '../redux/StateListenerRegistry';


declare let APP: any;

/**
 * Notifies when the local audio mute state changes.
 */
StateListenerRegistry.register(
    /* selector */ (state: IState) => state['features/base/media'].audio.muted,
    /* listener */ (muted: boolean, store: IStore, previousMuted: boolean) => {
        if (typeof APP !== 'object') {
            return;
        }

        if (muted !== previousMuted) {
            APP.API.notifyAudioMutedStatusChanged(muted);
        }
    }
);
