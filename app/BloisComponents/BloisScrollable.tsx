import { Component, ReactNode } from "react";
import {
    LayoutRectangle,
    ScrollView,
    ScrollViewProps,
    Text,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import { colors, styleValues, textStyles } from "../HelperFiles/StyleSheet";

type BloisScrollableProps = {
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    scrollViewProps?: ScrollViewProps;
    children: ReactNode;
};

type State = {
    enableScroll: boolean;
};

export default class BloisScrollable extends Component<
    BloisScrollableProps,
    State
> {
    layout: LayoutRectangle | null = null;

    constructor(props: BloisScrollableProps) {
        super(props);
        this.state = {
            enableScroll: false,
        };
    }

    private checkShouldScroll = (width: number, height: number) => {
        const contentSize = this.props.scrollViewProps?.horizontal ? width : height
        const layoutSize = this.props.scrollViewProps?.horizontal ? this.layout?.width : this.layout?.height
        if (layoutSize && layoutSize <= contentSize) {
            this.setState({ enableScroll: true });
        } else {
            this.setState({ enableScroll: false });
        }
        
    };

    render() {
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                {...this.props.scrollViewProps}
                style={{
                    overflow: 'visible',
                    ...this.props.style,
                }}
                contentContainerStyle={{
                    ...this.props.contentContainerStyle,
                }}
                scrollEnabled={this.state.enableScroll}
                onLayout={(event) => {
                    this.layout = event.nativeEvent.layout;
                    this.props.scrollViewProps?.onLayout?.(event)
                }}
                onContentSizeChange={(w, h) => {
                    this.checkShouldScroll(w, h)
                    this.props.scrollViewProps?.onContentSizeChange?.(w, h)
                }}
            >
                <TouchableWithoutFeedback>
                    <View>
                        {this.props.children}
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    }
}
