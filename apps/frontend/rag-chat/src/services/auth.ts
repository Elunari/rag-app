import { Amplify } from "aws-amplify";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  type SignUpInput,
  type SignInInput,
} from "@aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
        phone: false,
        username: true,
      },
    },
  },
});

export const login = async (username: string, password: string) => {
  try {
    const signInInput: SignInInput = {
      username,
      password,
      options: {
        authFlowType: "USER_SRP_AUTH",
      },
    };
    const result = await signIn(signInInput);
    console.log("Login result:", result);

    if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
      throw new Error("Please confirm your email address before logging in.");
    }

    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const confirmSignup = async (username: string, code: string) => {
  try {
    const result = await confirmSignUp({
      username,
      confirmationCode: code,
    });
    console.log("Confirm signup result:", result);
    return result;
  } catch (error) {
    console.error("Confirm signup error:", error);
    throw error;
  }
};

export const register = async (
  username: string,
  password: string,
  email: string
) => {
  try {
    const signUpInput: SignUpInput = {
      username,
      password,
      options: {
        userAttributes: {
          email,
        },
        autoSignIn: true,
      },
    };
    const result = await signUp(signUpInput);
    console.log("Register result:", result);
    return result;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut({ global: true });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const session = await fetchAuthSession();
    console.log("Session:", session);
    const tokens = session.tokens;
    return tokens?.idToken ? session : null;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    console.log("Current user:", user);
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

const auth = {
  configureAuth: () => {},
  getCurrentUser: getCurrentUserInfo,
  getSession,
  signIn: login,
  signUp: register,
  signOut: logout,
  confirmSignup,
};

export default auth;
