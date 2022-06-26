import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { View, ViewStyle } from "react-native";
import { defaultStyles, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type DateScrollPickerProps = {
    containerStyle?: ViewStyle,
    pickerStyle?: ViewStyle,
    shadow?: boolean,
    onDateChange?: (date: Date) => void,
    pickerProps?: Partial<(typeof DateTimePicker)['defaultProps']>,
}

type State = {
    value: Date
}

export default class DateScrollPicker extends CustomComponent<DateScrollPickerProps, State> {

    constructor(props: DateScrollPickerProps) {
        super(props)
        this.state = {
            value: new Date()
        }
    }

    render() {
        return (
            <View
                style={{
                    ...(this.props.shadow !== false ? shadowStyles.small : undefined),
                    width: "100%",
                    ...this.props.containerStyle
                }}
            >
                <DateTimePicker
                    style={{
                        ...defaultStyles.roundedBox,
                        height: styleValues.largerHeight,
                        overflow: "hidden",
                        ...this.props.pickerStyle
                    }}
                    value={this.state.value}
                    mode={"date"}
                    display={"spinner"}
                    onChange={(_: any, date?: Date) => {
                        this.setState({value: date}, () => {
                            if (date && this.props.onDateChange) {
                                this.props.onDateChange(date)
                            }
                        })
                    }}
                    {...this.props.pickerProps}
                />
            </View>
            )
    }
}
