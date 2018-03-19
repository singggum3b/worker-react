import * as React from 'react';
import {IndexStore} from '../store-ui';

export interface MobxRouterIntegrationProps {
    location: Location;
    store: IndexStore;
}

export class MobxRouterIntegration extends React.PureComponent<MobxRouterIntegrationProps> {

    public static updateLocation(props: MobxRouterIntegrationProps) {
        props.store.routerStore.updateLocation(props.location);
    }

    public componentWillMount() {
        MobxRouterIntegration.updateLocation(this.props);
    }

    public componentWillUpdate(props: MobxRouterIntegrationProps) {
        MobxRouterIntegration.updateLocation(props);
    }

    public render() {
        return null;
    }
}