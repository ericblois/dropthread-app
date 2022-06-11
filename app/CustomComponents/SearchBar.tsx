import React from "react";
import { Image, ImageStyle, KeyboardAvoidingView, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { colors, defaults, icons, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type SearchBarProps = {
    barStyle?: ViewStyle,
    textStyle?: TextStyle,
    iconStyle?: ImageStyle,
    barProps?: KeyboardAvoidingView['props'],
    textProps?: TextInput['props'],
    iconProps?: Image["props"],
    avoidKeyboard?: boolean,
    onClearText?: () => void
}

type State = {
    searchText: string,
    shouldAvoid: boolean
}

export default class SearchBar extends CustomComponent<SearchBarProps, State> {

    constructor(props: SearchBarProps) {
        super(props)
        this.state = {
            searchText: "",
            shouldAvoid: false
        }
    }

    render() {
        return (
            <View
                {...this.props.barProps}
                style={{
                    ...defaults.inputBox,
                    ...shadowStyles.medium,
                    position: "absolute",
                    top: styleValues.mediumPadding,
                    elevation: 10,
                    flexDirection: "row",
                    padding: styleValues.minorPadding,
                    borderWidth: 0,
                    ...this.props.barStyle
                }}
            >
                <Image
                    source={icons.search}
                    style={{
                        height: "80%",
                        flex: 0.1,
                        tintColor: colors.lightGrey,
                        marginRight: styleValues.minorPadding,
                        ...this.props.iconStyle,
                    }}
                    resizeMethod={"scale"}
                    resizeMode={"contain"}
                    {...this.props.iconProps}
                ></Image>
                <TextInput
                    style={{
                        ...defaults.inputText,
                        textAlign: "left",
                        ...this.props.textStyle
                    }}
                    disableFullscreenUI={true}
                    focusable={true}
                    textAlign={"left"}
                    textAlignVertical={"center"}
                    autoCorrect={false}
                    autoCapitalize={"none"}
                    clearButtonMode={"while-editing"}
                    returnKeyType={"search"}
                    {...this.props.textProps}
                    onChangeText={(text) => {
                        if (text === "" && this.props.onClearText) {
                            this.props.onClearText()
                        }
                        if (this.props.textProps?.onChangeText) {
                            this.props.textProps?.onChangeText(text)
                        }
                    }}
                    onFocus={(e) => {
                        this.setState({shouldAvoid: true})
                        if (this.props.textProps?.onFocus) {
                            this.props.textProps.onFocus(e)
                        }
                    }}
                    onEndEditing={(e) => {
                        this.setState({shouldAvoid: false})
                        if (this.props.textProps?.onEndEditing) {
                            this.props.textProps.onEndEditing(e)
                        }
                    }}
                >
                    {this.props.children}
                </TextInput>
            </View>
            )
    }
}
