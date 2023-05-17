import { Component } from "react";
import AppUtils from "../HelperFiles/AppUtils";
import { auth } from "../HelperFiles/Constants";
import { EventListenerCallback, NavigationProp } from "@react-navigation/native";

type Props = {
    navigation?: {[key: string]: any},
    route?: {[key: string]: any},
    refreshOnNavigate?: boolean
}

type State = {
    errorMessage?: string
}

export default class CustomComponent<P, S, SS = any> extends Component<P & Props, S & State, SS> {

    constructor(props: P & Props) {
        super(props)
        this.state = {
            errorMessage: undefined
        } as Readonly<S & State>
        if (props.refreshOnNavigate !== false && props.navigation && props.navigation.addListener && props.route && props.route.name) {
            // This component has a navigation and route prop
            // Ensure this component refreshes its data when navigated to
            props['navigation']!['addListener']!('state', (e: {[key: string]: any}) => {
                const routes = e.data.state.routes
                if (routes[routes.length - 1].name === props.route!.name) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true
                        this.refreshData().then(() => {this.isRefreshing = false})
                    }
                }
            })
        }
    }

    isRefreshing = false
    componentMounted = false

    waitingStateUpdate: (S & State) | ((prevState: Readonly<(S & State)>, props: Readonly<P & Props>) => (S & State) | Pick<(S & State), never> | null) | Pick<(S & State), never> | null = null

    componentDidMount() {
        this.componentMounted = true
        if (super.componentDidMount) {
            super.componentDidMount()
        }
        if (this.waitingStateUpdate !== null) {
            this.setState(this.waitingStateUpdate, () => {
                this.isRefreshing = true
                this.refreshData().then(() => {this.isRefreshing = false})
            })
        } else {
            this.isRefreshing = true
            this.refreshData().then(() => {this.isRefreshing = false})
        }
    }

    componentWillUnmount() {
        this.componentMounted = false
        if (super.componentWillUnmount) {
            super.componentWillUnmount()
        }
    }

    setState(state: (S & State) | ((prevState: Readonly<S & State>, props: Readonly<P & Props>) => (S & State) | Pick<(S & State), never> | null) | Pick<(S & State), never> | null, callback?: (() => void) | undefined) {
        if (this.componentMounted) {
            super.setState(state, callback)
        } else {
            this.waitingStateUpdate = state
        }
    }
    
    forceUpdate(callback?: (() => void) | undefined): void {
        if (this.componentMounted) {
            super.forceUpdate(callback)
        }
    }
    // Will always get run on mount
    async refreshData() {}

    handleError(e: any) {
        let errorMessage = 'An error occurred.'
        if (Object.hasOwn(e, 'code')) {
          errorMessage = AppUtils.errorMessage(e.code);
        } else if (Object.hasOwn(e, 'message')) {
          errorMessage = AppUtils.errorMessage(e.message);
        }
        this.setState({errorMessage: errorMessage});
    }
}