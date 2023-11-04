import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, View } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import ViewLikesPage from "./LikesPages/ViewLikesPage";
import { ExchangesStack, UserMainStackParamList } from "./HelperFiles/Navigation";
import ViewExchangesPage from "./LikesPages/ViewExchangesPage";
import { colors, fonts, screenWidth, shadowStyles, styVals, topInset } from "./HelperFiles/StyleSheet";
import BloisTextButton from "./BloisComponents/BloisTextButton";

type ExchangesNavigationProp = StackNavigationProp<UserMainStackParamList, "exchanges">;

type ExchangesRouteProp = RouteProp<UserMainStackParamList, "exchanges">;

type ExchangesProp = {
    navigation: ExchangesNavigationProp,
    route: ExchangesRouteProp
}

type State = {
}

export default class ExchangesScreen extends CustomComponent<ExchangesProp, State> {

    constructor(props: ExchangesProp) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
        console.log('likes page')
        super.componentDidMount()
    }

  render() {
    return (
            <ExchangesStack.Navigator
                screenOptions={{
                    header: (props) => (
                        <View
                            style={{
                                ...shadowStyles.medium,
                                width: screenWidth,
                                paddingTop: topInset + styVals.mediumPadding,
                                paddingHorizontal: styVals.mediumPadding,
                                flexDirection: 'row',
                                justifyContent: 'space-evenly',
                                backgroundColor: colors.background
                            }}
                        >
                            <BloisTextButton
                                text={'Liked items'}
                                wrapperStyle={{marginRight: styVals.mediumPadding, flex: 1}}
                                textStyle={{
                                    color: props.route.name === 'exchanges' ? colors.main : colors.black,
                                    fontFamily: props.route.name === 'exchanges' ? fonts.medium : fonts.regular
                                }}
                                onPress={() => {
                                    if (props.route.name !== 'exchanges') {
                                        props.navigation.navigate('exchanges')
                                    }
                                }}
                            />
                            <BloisTextButton
                                text={'Exchanges'}
                                wrapperStyle={{flex: 1}}
                                textStyle={{
                                    color: props.route.name === 'main' ? colors.main : colors.black,
                                    fontFamily: props.route.name === 'main' ? fonts.medium : fonts.regular
                                }}
                                onPress={() => {
                                    if (props.route.name !== 'main') {
                                        props.navigation.navigate('main')
                                    }
                                }}
                            />
                        </View>
                    )}}
                initialRouteName="main"
            >
                <ExchangesStack.Screen
                    name={"main"}
                    component={ViewExchangesPage}
                    options={{
                        animationEnabled: false
                    }}
                />
                <ExchangesStack.Screen
                    name={"likes"}
                    component={ViewLikesPage}
                    options={{
                        animationEnabled: false
                    }}
                />
            </ExchangesStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({

})