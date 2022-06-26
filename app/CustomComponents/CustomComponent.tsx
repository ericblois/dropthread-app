import { Component } from "react";

export default class CustomComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
    
    componentMounted = false

    waitingStateUpdate: S | ((prevState: Readonly<S>, props: Readonly<P>) => S | Pick<S, never> | null) | Pick<S, never> | null = null

    componentDidMount() {
        this.componentMounted = true
        if (super.componentDidMount) {
            super.componentDidMount()
        }
        if (this.waitingStateUpdate !== null) {
            this.setState(this.waitingStateUpdate, () => {
                this.refreshData()
            })
        } else {
            this.refreshData()
        }
    }

    componentWillUnmount() {
        this.componentMounted = false
        if (super.componentWillUnmount) {
            super.componentWillUnmount()
        }
    }

    setState(state: S | ((prevState: Readonly<S>, props: Readonly<P>) => S | Pick<S, never> | null) | Pick<S, never> | null, callback?: (() => void) | undefined) {
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

    refreshData() {}
}