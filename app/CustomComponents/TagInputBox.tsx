import React from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TextInputSubmitEditingEventData,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import {
    colors,
    defaultStyles,
    icons,
    shadowStyles,
    styVals,
    textStyles,
} from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImageButton from "./CustomImageButton";
import ScrollContainer from "./ScrollContainer";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import Item from "../HelperFiles/Item";

type TagInputBoxProps = {
    boxStyle?: ViewStyle;
    textStyle?: TextStyle;
    boxProps?: KeyboardAvoidingView["props"];
    textProps?: TextInput["props"];
    defaultValue?: string[];
    avoidKeyboard?: boolean;
    focusOnStart?: boolean;
    shadow?: boolean;
    onChange?: (tags: string[]) => void;
    onSubmit?: (
        e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
    ) => void;
};

type State = {
    text: string;
    tags: string[];
    shouldAvoid: boolean;
};

export default class TagInputBox extends CustomComponent<
    TagInputBoxProps,
    State
> {
    textInput: TextInput | null = null;

    constructor(props: TagInputBoxProps) {
        super(props);
        this.state = {
            text: "",
            tags: props.defaultValue ? props.defaultValue : [],
            shouldAvoid: false,
        };
    }

    renderTag(text: string) {
        return (
            <View
                style={{
                    flexDirection: "row",
                    marginHorizontal: styVals.minorPadding,
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.small,
                    padding: styVals.minorPadding,
                    width: undefined,
                    height: styVals.smallHeight,
                }}
                key={text}
            >
                <Text
                    style={{
                        ...textStyles.medium,
                        marginHorizontal: styVals.minorPadding,
                        ...this.props.textStyle,
                    }}
                >
                    {text}
                </Text>
                <BloisIconButton
                    icon={{
                        name: "close",
                        type: "MaterialIcons",
                    }}
                    style={{
                        width: styVals.iconSmallSize,
                        height: styVals.iconSmallSize,
                        marginHorizontal: styVals.minorPadding,
                    }}
                    animType="opacity"
                    onPress={() => this.removeTag(text)}
                />
            </View>
        );
    }

    addTag(text: string) {
        if (
            this.state.tags.includes(text) ||
            this.state.tags.length >= Item.maxNumStyles
        ) {
            return;
        } else {
            const newTags = this.state.tags;
            newTags.push(text);
            this.setState({ tags: newTags }, () => {
                if (this.props.onChange) {
                    this.props.onChange(this.state.tags);
                }
            });
        }
    }

    removeTag(text: string) {
        const tagIndex = this.state.tags.indexOf(text);
        if (tagIndex > -1) {
            const newTags = this.state.tags;
            newTags.splice(tagIndex, 1);
            this.setState({ tags: newTags }, () => {
                if (this.props.onChange) {
                    this.props.onChange(this.state.tags);
                }
            });
        }
    }

    render() {
        return (
            <Pressable
                onPress={() => {
                    if (this.textInput !== null) {
                        this.textInput?.focus();
                    }
                }}
            >
                <KeyboardAvoidingView
                    {...this.props.boxProps}
                    style={{
                        width: "100%",
                        ...(this.props.shadow !== false
                            ? shadowStyles.small
                            : undefined),
                    }}
                    contentContainerStyle={{
                        ...defaultStyles.roundedBox,
                        padding: styVals.minorPadding,
                        paddingBottom: styVals.mediumPadding,
                        height: undefined,
                        overflow: "hidden",
                        ...this.props.boxStyle,
                    }}
                    behavior={"position"}
                    enabled={
                        this.state.shouldAvoid &&
                        this.props.avoidKeyboard === true
                    }
                >
                    {this.state.tags.length > 0 ? (
                        <ScrollView
                            style={{
                                width: "100%",
                                height: styVals.smallHeight,
                                margin: styVals.minorPadding,
                                overflow: "visible",
                                marginBottom: styVals.mediumPadding,
                            }}
                            contentContainerStyle={{
                                padding: 0,
                                //paddingHorizontal: styVals.minorPadding,
                                overflow: "visible",
                            }}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            horizontal
                        >
                            <Pressable style={{ flexDirection: "row" }}>
                                {this.state.tags.map((tag) =>
                                    this.renderTag(tag)
                                )}
                            </Pressable>
                        </ScrollView>
                    ) : undefined}
                    <TextInput
                        style={[
                            defaultStyles.inputText,
                            { marginTop: styVals.minorPadding },
                            this.props.textStyle,
                        ]}
                        disableFullscreenUI={true}
                        focusable={true}
                        textAlign={"center"}
                        textAlignVertical={"center"}
                        autoCorrect={false}
                        clearButtonMode={"while-editing"}
                        ref={(textInput) => {
                            this.textInput = textInput;
                        }}
                        onLayout={() => {
                            if (
                                this.props.focusOnStart === true &&
                                this.textInput !== null
                            ) {
                                this.textInput.focus();
                            }
                        }}
                        {...this.props.textProps}
                        maxLength={20}
                        value={this.state.text}
                        onFocus={(e) => {
                            this.setState({ shouldAvoid: true });
                            if (this.props.textProps?.onFocus) {
                                this.props.textProps.onFocus(e);
                            }
                        }}
                        onEndEditing={(e) => {
                            if (e.nativeEvent.text.length > 0) {
                                let newText = e.nativeEvent.text.split(" ")[0];
                                newText = newText.split("\n")[0];
                                newText = newText.split("\t")[0];
                                newText = newText
                                    .replaceAll(/[^a-zA-Z]/g, "")
                                    .toLowerCase();
                                if (newText.length > 0) {
                                    this.addTag(newText);
                                    this.setState({ text: "" });
                                }
                            }
                            this.setState({ shouldAvoid: false });
                            if (this.props.textProps?.onEndEditing) {
                                this.props.textProps.onEndEditing(e);
                            }
                        }}
                        onChangeText={(text) => {
                            if (
                                text.includes(" ") ||
                                text.includes("\n") ||
                                text.includes("\t")
                            ) {
                                let newText = text.split(" ")[0];
                                newText = newText.split("\n")[0];
                                newText = newText.split("\t")[0];
                                newText = newText
                                    .replaceAll(/[^a-zA-Z]/g, "")
                                    .toLowerCase();
                                if (newText.length > 0) {
                                    this.addTag(newText);
                                    this.setState({ text: "" });
                                }
                            } else {
                                this.setState({ text: text });
                            }
                            if (this.props.textProps?.onChangeText) {
                                this.props.textProps.onChangeText(text);
                            }
                        }}
                    >
                        {this.props.children}
                    </TextInput>
                </KeyboardAvoidingView>
            </Pressable>
        );
    }
}
