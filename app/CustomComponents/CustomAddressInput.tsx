import React from "react";
import { Animated, GestureResponderEvent, KeyboardAvoidingView, Pressable, PressableProps, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import { colors, defaultStyles, fonts, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import LoadingCover from "./LoadingCover";
import { DefaultAddressData, AddressData } from "../HelperFiles/DataTypes";
import CustomModal from "./CustomModal";
import BloisPressable from "../BloisComponents/BloisPressable";
import User from "../HelperFiles/User";
import { BloisTextButton, BloisTextInput, TextButton } from "../HelperFiles/CompIndex";
import { AntDesign } from "@expo/vector-icons";
import Address from "../HelperFiles/Address";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Config from "react-native-config";

type Props = {
    defaultAddress?: AddressData
    showValidity?: boolean,
    onSave?: (address: AddressData) => void
}

type State = {
    currentAddress: AddressData,
    isQuery: boolean,
    validityFlag: boolean,
    errorMessage?: string
}


export default class CustomAddressInput extends CustomComponent<Props, State> {

    inputHeight = styleValues.smallHeight;

    constructor(props: Props) {
        super(props)
        this.state = {
            currentAddress: {
                ...DefaultAddressData,
                ...props.defaultAddress,
                userID: User.getCurrent().uid
            },
            isQuery: false,
            validityFlag: false,
            errorMessage: undefined
        }
    }

    render() {
        const validAddress = Address.validate({
            ...this.state.currentAddress,
            name: 'valid-name'
        })
        return (
            <View style={{
                width: '100%'
            }}>
                {this.state.errorMessage ?
                    <Text style={{...textStyles.smaller, color: colors.invalid}}>{this.state.errorMessage}</Text>
                : undefined}
                <BloisTextInput
                    checkValidity={(text) => Address.validateProperty('name', text)}
                    indicatorType={'shadowSmall'}
                    placeholder={"Address Name"}
                    maxLength={Address.maxNameLength}
                    defaultValue={this.state.currentAddress.name || undefined}
                    ignoreInitialValidity={!this.state.validityFlag}
                    onChangeText={(text) => this.setState({
                        currentAddress: {
                            ...this.state.currentAddress,
                            name: text
                        }
                    })}
                />
                <View
                    style={{
                        height: this.state.isQuery ? styleValues.largestHeight*2 : this.inputHeight + styleValues.mediumPadding*2,
                        //minHeight: this.inputHeight + styleValues.mediumPadding*3
                    }}
                >
                    <GooglePlacesAutocomplete
                        placeholder={'Search address...'}
                        query={{
                            key: Config.GOOGLE_MAPS_API_KEY,
                            //location: this.state.searchQuery,
                            language: 'en'
                        }}
                        styles={{
                            container: {
                                justifyContent: 'flex-start',
                                paddingBottom: 0
                            },
                            textInput: {
                                ...defaultStyles.roundedBox,
                                ...shadowStyles.small,
                                height: this.inputHeight,
                                ...textStyles.smaller,
                                overflow: 'visible',
                                marginBottom: -styleValues.mediumPadding,
                                shadowColor: validAddress || !this.state.validityFlag ? colors.black : colors.invalid,
                                shadowOpacity: validAddress || !this.state.validityFlag ? shadowStyles.small.shadowOpacity : 1,
                                elevation: 10,
                                zIndex: 10
                                
                            },
                            listView: {
                                ...shadowStyles.small,
                                paddingTop: styleValues.mediumPadding*2,
                                padding: styleValues.mediumPadding,
                                marginHorizontal: -styleValues.mediumPadding,
                                elevation: -1,
                                zIndex: -1,
                            },
                            row: {
                                ...defaultStyles.roundedBox,
                                backgroundColor: colors.background
                            },
                            description: textStyles.smaller,
                            separator: {height: 0, opacity: 0}
                        }}
                        isRowScrollable={false}
                        fetchDetails={true}
                        keepResultsAfterBlur={true}
                        keyboardShouldPersistTaps={'handled'}
                        enablePoweredByContainer={false}
                        preProcess={(text) => {
                            if (text.length === 0) {
                                this.setState({isQuery: false})
                            } else if (!this.state.isQuery) {
                                this.setState({isQuery: true})
                            }
                            return text
                        }}
                        onPress={(data, details) => {
                            const newAddress: AddressData = {
                                ...this.state.currentAddress
                            }
                            let streetNumber: string | null = null;
                            let streetName: string | null = null;
                            
                            if (details && details.address_components.length > 0) {
                                // Collect parts of address
                                for (const comp of details.address_components) {
                                    if (comp.types.includes('subpremise')) {
                                        newAddress.apartment = comp.long_name
                                    } else if (comp.types.includes('route')) {
                                        streetName = comp.long_name
                                    } else if (comp.types.includes('street_number')) {
                                        streetNumber = comp.long_name
                                    } else if (comp.types.includes('street_address')) {
                                        newAddress.streetAddress = comp.long_name
                                    } else if (comp.types.includes('locality')) {
                                        newAddress.city = comp.long_name
                                    } else if (comp.types.includes('administrative_area_level_1')) {
                                        newAddress.region = comp.long_name
                                    } else if (comp.types.includes('country')) {
                                        newAddress.country = comp.long_name
                                    } else if (comp.types.includes('postal_code')) {
                                        newAddress.postalCode = comp.long_name
                                    }
                                }
                                // Get lat/long
                                newAddress.lat = details.geometry.location.lat
                                newAddress.long = details.geometry.location.lng
                            }
                            if (streetNumber && streetName) {
                                newAddress.streetAddress = `${streetNumber} ${streetName}`
                            } 
                            this.setState({currentAddress: newAddress, isQuery: false})
                        }}
                        onFail={error => console.log(error)}
                    />
                </View>
                <TextInput
                    style={{
                        ...defaultStyles.roundedBox,
                        ...shadowStyles.small,
                        ...textStyles.smaller,
                        textAlign: 'left',
                        marginTop: -styleValues.mediumPadding
                    }}    
                    placeholder={"Address Notes"}
                    maxLength={Address.maxValueLength}
                    defaultValue={this.state.currentAddress.message || undefined}
                    numberOfLines={1}
                    onChangeText={(text) => this.setState({
                        currentAddress: {
                            ...this.state.currentAddress,
                            message: text
                        }
                    })}
                />
                <TextButton
                    text={`Save address`}
                    textStyle={{color: Address.validate(this.state.currentAddress) ? colors.black : colors.lightGrey}}
                    buttonStyle={{
                        height: styleValues.smallHeight
                    }}
                    showLoading={true}
                    onPress={async () => {
                        this.setState({errorMessage: undefined})
                        if (Address.validate(this.state.currentAddress) && this.props.onSave) {
                            const prevAddressNames = (await Address.getAddresses()).map((address) => address.name)
                            if (prevAddressNames.includes(this.state.currentAddress.name)) {
                                this.setState({errorMessage: 'This address name already exists.'})
                            }
                            await this.props.onSave(this.state.currentAddress)
                        } else {
                            this.setState({validityFlag: true})
                        }
                    }}
                />
            </View>
        )
    }
}