import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { capitalizeWords } from "./HelperFiles/ClientFunctions";
import { DateScrollPicker, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton, TextDropdownAnimated, TextInputBox } from "./HelperFiles/CompIndex";
import { geofire } from "./HelperFiles/Constants";
import { countriesList, Country, DefaultUserData, UserData, UserGender, UserGenders } from "./HelperFiles/DataTypes";
import { RootStackParamList } from "./HelperFiles/Navigation";
import { colors, icons, styleValues, textStyles } from "./HelperFiles/StyleSheet";
import User from "./HelperFiles/User";

type UserSignupNavigationProp = StackNavigationProp<RootStackParamList, "userSignup">

type UserSignupRouteProp = RouteProp<RootStackParamList, "userSignup">;

type UserSignupProps = {
    navigation: UserSignupNavigationProp,
    route: UserSignupRouteProp
}

type State = {
    userData: Partial<UserData>,
    password?: string,
    passwordConfirm?: string,
    isLoading: boolean,
}


export default class UserSignupPage extends CustomComponent<UserSignupProps, State> {

    defaultTextProps: TextInput['props']

    constructor(props: UserSignupProps) {
        super(props)
        this.defaultTextProps = {
            autoCorrect: false,
            autoCapitalize: "none",
            clearButtonMode: "while-editing",
        }

        this.state = {
            userData: {},
            password: undefined,
            passwordConfirm: undefined,
            isLoading: false,
        }
    }

    refreshData() {
        navigator.geolocation.getCurrentPosition((pos) => {
            this.setState({userData: {
                ...this.state.userData,
                lat: pos.coords.latitude,
                long: pos.coords.longitude
            }})
        }, (e) => console.error(e))
    }

    validateName() {
        return this.state.userData.name !== undefined && this.state.userData.name.length > 0
    }
    validateEmail() {
        return this.state.userData.email !== undefined && /^[a-z0-9\.\_\-]+@[a-z0-9\.\-]+\.[a-z0-9]+$/m.test(this.state.userData.email.toLowerCase())
    }
    validatePass() {
        return this.state.password !== undefined && this.state.password.length > 6
    }
    validateConfirm() {
        return this.state.passwordConfirm !== undefined && this.state.passwordConfirm === this.state.password
    }
    validateBirthday() {
        if (this.state.userData.birthYear === undefined ||
            this.state.userData.birthMonth === undefined || 
            this.state.userData.birthDay === undefined) {
                return false
        }
        const date = Date.parse(`${this.state.userData.birthYear}-${this.state.userData.birthMonth}-${this.state.userData.birthDay}`)
        // Get number of days between today and birthday
        const timeDiff = ((new Date()).getTime() - date)/(86400000);
        // Check if this birthday is more than 13 years old (365.24*13=4748.12)
        return timeDiff >= 4748.12
    }

    validateCoords() {
        if (this.state.userData.lat === undefined || this.state.userData.long === undefined) {
            return false
        }
        try {
            geofire.validateLocation([
                this.state.userData.lat,
                this.state.userData.long
            ])
            return true
        } catch (e) {
            return false
        }
    }

    validateInputs() {
        for (const key of Object.keys(DefaultUserData) as (keyof UserData)[]) {
            if (key === "userID" || key == 'region') {
                continue
            }
            if (this.state.userData[key] === undefined || this.state.userData[key] === "") {
                return false
            }
        }
        return (
            this.validateName() &&
            this.validateEmail() &&
            this.validatePass() &&
            this.validateConfirm() &&
            this.validateBirthday() &&
            this.validateCoords()
        )
    }

    async enter() {
        if (!this.validateInputs()) {
            throw new Error("Tried to create an account with invalid inputs.")
        }
        this.setState({isLoading: true})
        const userData: UserData = {
            ...DefaultUserData,
            ...this.state.userData,
        }
        // Create an account
        User.create(
            userData,
            this.state.password!
        ).then((cred) => {
            this.setState({isLoading: false}, () => {
                this.props.navigation.navigate("userMain")
            })
        }).catch((e) => {
            this.setState({isLoading: false})
            throw e
        })
    }

    renderInputs() {
        return (
            <ScrollContainer>
                {/* Name */}
                <TextInputBox
                    validateFunc={() => this.validateName()}
                    textProps={{...this.defaultTextProps, ...{
                        onChangeText: async (text) => this.setState({userData: {...this.state.userData, name: text} as UserData}),
                        placeholder: "Name",
                        autoCapitalize: "words",
                        textContentType: "name",
                        autoCompleteType: "name"
                    }}}
                />
                {/* Email */}
                <TextInputBox
                    validateFunc={() => this.validateEmail()}
                    textProps={{...this.defaultTextProps, ...{
                        onChangeText: (text) => this.setState({userData: {...this.state.userData, email: text} as UserData}),
                        placeholder: "Email",
                        textContentType: "emailAddress",
                        autoCompleteType: "email",
                    }}}
                />
                <Text style={styles.inputDescription}>
                    Use at least 6 characters in your password.
                </Text>
                {/* Password */}
                <TextInputBox
                    validateFunc={() => this.validatePass()}
                    textProps={{...this.defaultTextProps, ...{
                        onChangeText: (text) => this.setState({password: text}),
                        placeholder: "Password",
                        textContentType: "newPassword",
                        secureTextEntry: true,
                    }}}
                />
                {/* Confirm password */}
                <TextInputBox
                    validateFunc={() => this.validateConfirm()}
                    textProps={{...this.defaultTextProps, ...{
                        onChangeText: (text) => this.setState({passwordConfirm: text}),
                        placeholder: "Confirm password",
                        textContentType: "newPassword",
                        secureTextEntry: true,
                    }}}
                />
                <Text style={styles.inputDescription}>
                    You must be 13 years of age or older to use this service.
                </Text>
                {/* Birth date */}
                <DateScrollPicker
                    pickerStyle={{
                        borderColor: this.validateBirthday() ? colors.valid : colors.invalid,
                        borderWidth: styleValues.minorBorderWidth
                    }}
                    onDateChange={(date) => this.setState({userData: {
                            ...this.state.userData,
                            birthDay: date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2}),
                            birthMonth: (date.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}),
                            birthYear: date.getFullYear().toLocaleString('en-US', {minimumIntegerDigits: 4, useGrouping: false})
                    }})}
                ></DateScrollPicker>
                {/* Gender */}
                <TextDropdownAnimated
                    items={UserGenders.map((gender) => ({
                        text: capitalizeWords(gender),
                        value: gender
                    }))}
                    placeholderText={"Gender"}
                    enableMultiple={false}
                    showValidSelection={true}
                    onSelect={(selections) => this.setState({userData: {...this.state.userData, gender: selections[0].value as UserGender} as UserData})}
                />
                { /* Country */}
                <TextDropdownAnimated
                    items={countriesList.map((country) => ({
                        text: capitalizeWords(country),
                        value: country
                    }))}
                    placeholderText={"Country"}
                    enableMultiple={false}
                    showValidSelection={true}
                    onSelect={(selections) => this.setState({userData: {...this.state.userData, country: selections[0].value as Country} as UserData})}
                />
                <Text style={styles.inputDescription}>Your location is required to view items near you. Location data is never shared with other users.</Text>
                <TextButton
                    text={"Location"}
                    buttonStyle={{
                        borderColor: this.validateCoords() ? colors.valid : colors.invalid,
                        borderWidth: styleValues.minorBorderWidth
                    }}
                    rightIconSource={icons.crosshair}
                    rightIconStyle={{
                        tintColor: this.validateCoords() ? colors.valid : colors.invalid
                    }}
                    buttonFunc={() => this.refreshData()}
                />
                <Text style={styles.inputDescription}>Terms of Service</Text>
            </ScrollContainer>
        )
    }

    renderLoading() {
        if (this.state.isLoading) {
            return (
                <LoadingCover size={"large"}/>
            )
        }
    }
    
    render() {
        return (
        <PageContainer>
            <Text style={textStyles.larger}>
                Sign Up
            </Text>
            {this.renderInputs()}
            {this.renderLoading()}
            <MenuBar
                buttonProps={[
                    {
                        iconSource: icons.chevron,
                        buttonFunc: () => this.props.navigation.goBack(),
                    },
                    {
                        iconSource: icons.enter,
                        iconStyle: {tintColor: this.validateInputs() ? colors.darkGrey : colors.lighterGrey},
                        showLoading: true,
                        buttonFunc: () => this.enter(),
                        buttonProps: {
                            // When enter is disabled, don't change opacity when pressed
                            disabled: !this.validateInputs(),
                        }
                    }
                ]}
            ></MenuBar>
        </PageContainer>
        );
    }
}

const styles = StyleSheet.create({
    inputDescription: {
        ...textStyles.smallerHeader,
        color: colors.grey,
        width: "100%",
        textAlign: "left",
    },
})