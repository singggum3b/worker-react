import * as React from "react";
import {IndexStore} from "../store-ui";

export interface IMobxRouterIntegrationProps {
    location: Location;
    store: IndexStore;
}

export class MobxRouterIntegration extends React.PureComponent<IMobxRouterIntegrationProps> {

    public static updateLocation(props: IMobxRouterIntegrationProps) {
        props.store.routerStore.updateLocation(props.location);
    }

    public componentWillMount() {
        MobxRouterIntegration.updateLocation(this.props);
    }

    public componentWillUpdate(props: IMobxRouterIntegrationProps) {
        MobxRouterIntegration.updateLocation(props);
    }

    public render() {
        return null;
    }
}
