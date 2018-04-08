import * as React from "react";
import {IndexStore} from "../store-ui";

export interface IMobxRouterIntegrationProps {
    location: Location;
    store: IndexStore;
}

export class MobxRouterIntegration extends React.PureComponent<IMobxRouterIntegrationProps> {

    public static updateLocation(props: IMobxRouterIntegrationProps): void {
        props.store.routerStore.updateLocation(props.location);
    }

    public static getDerivedStateFromProps(nextProps: IMobxRouterIntegrationProps): null {
        MobxRouterIntegration.updateLocation(nextProps);
        console.log("sdcdscsd");
        return null;
    }

    public state = {};

    public render(): React.ReactNode {
        return null;
    }
}
