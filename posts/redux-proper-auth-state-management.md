---
title: Properly Managing Auth State With Redux
excerpt: Redux is a powerful state management tool, but it requires a few considerations. In this post, we'll look at how to properly manage auth state with Redux.
image: redux-proper-auth-state-management.png
isFeatured: true
date: "2023-7-02"
---

- [Introduction ](#introduction-)
- [What I Had Before ](#what-i-had-before-)
- [CreateSlice From Scratch ](#createslice-from-scratch-)
- [Registering a User ](#registering-a-user-)
- [Logging in a User ](#logging-in-a-user-)
- [AuthApi ](#authapi-)
- [Instant State Update on DB Change ](#instant-state-update-on-db-change-)
- [Conclusion ](#conclusion-)

## Introduction <a id="introduction-"></a>

So, I've been using Redux here and there for my projects for a while, but it didn't occur to me until now that I wasn't using it properly. A more senior dev friend of mine kept telling me that ALL state needs to be managed from Redux, that's where all the API calls should be coming from, and that's where all the state should be stored. I didn't really understand why, and I ignored the advice until I ran into some big problems. See my NestJS post for context on the problem I kept running into- none of my protected routes were fetching data. I was getting a 401 error, and I couldn't figure out why. I tried a half dozen different auth methods but kept running into the same error. When I showed it to my friend he identified the problem immediately, I was trying to fetch the protected data before the component was mounted, so the auth token wasn't being sent with the request. I was trying to fetch the data in the component, not in Redux. I finally decided to tear it all down and try to build it up correctly, and here are the steps I took to do that.

## What I Had Before <a id="what-i-had-before"></a>

This was my original userSlice:

```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "./api";

export const fetchUserDetails = createAsyncThunk(
  "users/fetchUserDetails",
  async () => {
    const token = getToken();
    console.log("Got token?: ", token);

    API.defaults.headers["Authorization"] = `Bearer ${token}`;
    console.log("api", await API.defaults.headers);
    if (!token) {
      getUser();
      const response = await fetch("http://localhost:3001/profile", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(response.headers, data);
      return data;
    } else {
      const token = getToken();
      API.defaults.headers["Authorization"] = `Bearer ${token}`;
      await getUser();
      return;
    }
  }
);

const getUser = async () => {
  const { data }: any = await API.get("profile");
  console.log(data);
  return data;
};

export const getToken = (): string => {
  const token = <string>localStorage.getItem("spanishtoken");

  console.log("getToken action", token);
  return token;
};

export const getUserDetails = createAsyncThunk(
  "users/fetchUserDetails",
  async (id: number) => {
    const response = await fetch(`http://localhost:3001/${id}`);
    const data = await response.json();
    return data;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: "",
    flashcards: [],
    stats: [],
    isLoggedIn: false,
    isLoading: false,
    error: undefined,
  },
  reducers: {
    setState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.flashcards = action.payload.flashcards;
      state.stats = action.payload.stats;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.error = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        console.log(action.payload);
        state.user = action.payload.user;
        state.token, (state.flashcards = action.payload.flashcards);
        state.stats = action.payload.stats;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.error = undefined;
      })
      .addCase(fetchUserDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchUserDetails.rejected, (state, action: any) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
    .addCase(getUserDetails.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token, (state.flashcards = action.payload.flashcards);
      state.stats = action.payload.stats;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.error = undefined;
    })
    .addCase(getUserDetails.pending, (state, action) => {
      state.isLoading = true;
    })
    .addCase(getUserDetails.rejected, (state, action: any) => {
      state.error = action.error.message;
      state.isLoading = false;
    });
  },
});

export const { setState } = userSlice.actions;

export default userSlice.reducer;
```

The above is a bit of a mess becuase it includes the method that did not work as well as my workaround- yes I reverted to numerous workarounds to make the app work. I was able to get the app work, but I lost a lot of server-side functionality in the process. I wasn't able to have protected routes, and I wasn't able to link entities in the database- of course there were workarounds, I was storing the userData in localStorage and submitting the userId by hand and using that as a reference, but I lost a lot of the advantages offered by PostGres and NestJS with regard to linking entities and having data serialized and linked in a tidy and convenient way. Of course this also amounted to more legwork, taking extra steps on both ends to make sure the data was being sent and recieved properly without any shortcuts or security.

## CreateSlice From Scratch <a id="createslice-from-scratch"></a>

I decided to create a new authSlice from scratch that more or less conformed to the state that I was using before. Not much to explain here, it's a naked slice to which I will be adding the reducers and extraReducers as I go along.

-/features/auth/authSlice.ts-

```ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  user: null,
  flashcards: null,
  stats: null,
  token,
  error: null,
  success: false,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default authSlice.reducer;
```

Then I went ahead and wrote the first action, for registering a user. Note that before I was doing this from the compoenent, but with the new approach I am handling all auth with Redux, adhering to their tenet of a 'single source of Truth'. I am also using the createAsyncThunk method, which is a wrapper for the Redux Thunk middleware. This allows me to write async code in the action creator, and it will dispatch the pending, fulfilled, and rejected actions for me. There are about a million ways to write Redux, but the method I like best is with slice and thunk.

-/features/auth/authActions.ts-

```ts
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const backendUrl = "http://localhost:3001";

interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

export const registerUser = createAsyncThunk<User, RegistrationData>(
  "auth/registerUser",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      await axios.post(
        `${backendUrl}/auth/signup`,
        { username, email, password },
        config
      );
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
```

I was also advised to create an axios instance to re-use, but I didn't want to get bogged down doing too much at once, I'll do that later.

Configuring the Store:

-/store/configureStore.ts-

```ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSilce";

export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

This is all very straightforward. I already had my components wrapped in the Provider, but if anyone needs to see that:

-/pages/app.tsx-

```tsx
import React from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Layout from "@/components/layout/layout";
import store from "../store/configureStore";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Layout>
        <main className="container">
          <Component {...pageProps} />
        </main>
      </Layout>
    </Provider>
  );
}
```

Note that most people do it at the Index, but for whatever reason I decided to go straight to the top.

## Registering a User <a id="registering-a-user"></a>

Here I went ahead and added reducers for the async action:

-/features/auth/authSlice.ts-

```ts
import { createSlice } from "@reduxjs/toolkit";
import { registerUser } from "@/features/auth/authActions";
import User from "@/types/User";
import Flashcard from "@/types/Flashcard";
import Stats from "@/types/Stats";

interface AuthState {
  loading: boolean;
  user: User | null;
  flashcards: Flashcard[] | null;
  stats: Stats[] | null;
  userToken: string | null;
  error: string | null | unknown;
  success: boolean;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  flashcards: null,
  stats: null,
  userToken: null,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, { payload }: PayloadAction<User>) => {
          console.log("payload", payload);
          state.loading = false;
          state.success = true;
          state.user = payload;
          state.isLoggedIn = true;
        }
      )
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default authSlice.reducer;
```

Then I went ahead and updated my component to use the new action:

-/pages/auth/login.tsx-

```tsx
const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const enteredEmail = signupEmailInputRef.current?.value;
  const enteredPassword = signupPasswordInputRef.current?.value;
  const enteredPasswordConfirm = signupPasswordConfirmInputRef.current?.value;
  const enteredUsername = usernameInputRef.current?.value;

  if (enteredPassword !== enteredPasswordConfirm) {
    setError("Passwords do not match");
    return;
  }

  const packageData: RegistrationData = {
    email: enteredEmail,
    password: enteredPassword,
    username: enteredUsername,
  };

  const dispatchTyped = dispatch as ThunkDispatch<RootState, null, AnyAction>;
  dispatchTyped(registerUser(packageData));

  resetForm();
};
```

This is already much tidier than making the request from the component. I tested the route, and it worked like a charm.

## Logging in a User <a id="logging-in-a-user"></a>

This is very much the same deal. First, the async action:

-/features/auth/authActions.ts-

```ts
export const loginUser = createAsyncThunk<LoginRes, LoginData>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${backendUrl}/auth/login`,
        { email, password },
        config
      );

      const { data } = response;
      localStorage.setItem("spanishtoken", data.access_token);

      console.log(data);

      return data;
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
```

Then we add the reducer:

-/features/auth/authSlice.ts-

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { registerUser, loginUser } from "@/features/auth/authActions";
import User from "@/types/User";
import AuthState from "@/types/AuthState";

let token;
if (typeof localStorage !== "undefined") {
  token = localStorage.getItem("spanishtoken") ?? null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  flashcards: null,
  stats: null,
  token,
  error: null,
  success: false,
  isLoggedIn: false,
  isNewData: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("spanishtoken");
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.stats = null;
      state.flashcards = null;
      state.isLoggedIn = false;
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.flashcards = payload.flashcards;
      state.stats = payload.stats;
      state.isLoggedIn = true;
    },
    setNewData: (state, { payload }) => {
      state.isNewData = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, { payload }: PayloadAction<User>) => {
          console.log("payload", payload);
          state.loading = false;
          state.success = true;
          state.user = payload;
          state.isLoggedIn = true;
        }
      )
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.user = payload.currentUser;
        state.flashcards = payload.flashcards;
        state.stats = payload.stats;
        state.token = payload.access_token;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {});
  },
});

export const { logout, setCredentials, setNewData } = authSlice.actions;
export default authSlice.reducer;
```

And finally, the component:

-/pages/auth/login.tsx-

```tsx
const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const enteredEmail = loginEmailInputRef.current?.value;
  const enteredPassword = loginPasswordInputRef.current?.value;

  if (enteredEmail && enteredPassword) {
    const packageData: LoginData = {
      email: enteredEmail,
      password: enteredPassword,
    };

    dispatchTyped(loginUser(packageData));

    resetForm();
    router.push("/");
  } else {
    setError("Invalid login credentials");
  }
};
```

At this point, everything was working perfectly but I got lost in rabbit hole trying to get a token dispatched upon registration, but then I realized that it was unneccesary because I could just login the user manually after the registration without getting the server dependencies angry.

## AuthApi <a id="authapi"></a>

This was the bit of the puzzle I'd really been missing. I was still just making plain requests with user credentials, I still hadn't broke any new ground, thus far I had just moved the API requests from the component to the store. But THIS step is what I had never gotten around to, and it's the crucial one- creating a middleware that will automatically add the token to the request headers. I was trying to do this before, but the token kept getting attached as undefined because the action was executing before the component had fully mounted.

Here is the big whammy:

-/services/auth/authService.ts-

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
    prepareHeaders: (headers, { getState }: { getState: any }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserDetails: builder.query({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUserDetailsQuery } = authApi;
```

This was all new to me, I basically step by step followed the docs to get here. It essentially sets up an easily referencable hook for network requests that have the URL and headers all set.

Then, we plug the middleware into the store:

-/store/configureStore.ts-

```ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSilce";
import { authApi } from "@/services/auth/authService";

export type RootState = ReturnType<typeof authReducer>;

export default configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleWare) =>
    getDefaultMiddleWare().concat(authApi.middleware),
});
```

Then, in the navbar I can call the hook:

-/components/Navbar.tsx-

```tsx
import styles from "./navbar.module.css";
import Link from "next/link";
import { useGetUserDetailsQuery } from "@/services/auth/authService";
import { useSelector, useDispatch } from "react-redux";
import { setState } from "../../store/userSlice";

function Navbar(): JSX.Element {
  const state = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<any>();

  // automatically authenticate user if token is found
  const { data, isFetching } = useGetUserDetailsQuery("userDetails", {
    // perform a refetch every 15mins
    pollingInterval: 10000,
  });

  console.log(data)
```

I could see with this that the data was being fetched. But we weren't persisitng it to the store just yet, so we write a reducer for that:

-/store/userSlice.ts-

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { registerUser, loginUser } from "@/features/auth/authActions";
import User from "@/types/User";
import AuthState from "@/types/AuthState";

let token;
if (typeof localStorage !== "undefined") {
  token = localStorage.getItem("spanishtoken") ?? null;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  flashcards: null,
  stats: null,
  token,
  error: null,
  success: false,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // ...logout reducer
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.flashcards = payload.flashcards;
      state.stats = payload.stats;
      state.isLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, { payload }: PayloadAction<User>) => {
          console.log("payload", payload);
          state.loading = false;
          state.success = true;
          state.user = payload;
          state.isLoggedIn = true;
        }
      )
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.user = payload.currentUser;
        state.flashcards = payload.flashcards;
        state.stats = payload.stats;
        state.token = payload.access_token;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {});
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
```

Notice that in the above code, we are setting the token to the store. This is important because it means that the token will be available to the middleware, which will then add it to the request headers.

Very straightforward, we just set the user credentials to the store. Now, we can set the user data in the navbar:

```tsx
function Navbar(): JSX.Element {
  const state = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<any>();

  const { data, isFetching } = useGetUserDetailsQuery("userDetails", {
    pollingInterval: 60000,
  });

  useEffect(() => {
    if (data) dispatch(setCredentials(data));
  }, [data, dispatch]);
```

And boom! This got it set up. However, I noticed that when new data was sent to the database the state wasn't rendering immediately, so I made a few changes to get the state to react immediately.

## Instant State Update on DB Change <a name="instant-state-update"></a>

First, I added a new value in the authState, 'isNewData', which is set to false by default:

```ts
const initialState: AuthState = {
  loading: false,
  user: null,
  flashcards: null,
  stats: null,
  token,
  error: null,
  success: false,
  isLoggedIn: false,
  isNewData: false,
};
```

Then, I added a new reducer to set the isNewData value to true:

```ts
  reducers: {
    logout: (state) => {
      localStorage.removeItem("spanishtoken");
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.stats = null;
      state.flashcards = null;
      state.isLoggedIn = false;
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.flashcards = payload.flashcards;
      state.stats = payload.stats;
      state.isLoggedIn = true;
    },
    setNewData: (state, { payload }) => {
      state.isNewData = payload;
    },
  },
```

Then, whenever I make a change to the database, I dispatch the setNewData action:

```ts
const submitScore = async () => {
  "submitting";
  // get total correct answers
  const score = inputValues.filter(
    (item: string, index: number) =>
      item.trim().toLowerCase() ===
      thisExercise.answers[index].trim().toLowerCase()
  ).length;

  //get max score
  const outOf = thisExercise.answers.length;
  const formatExerciseId = (currentExercise: number) => {
    return parseInt(`${unit}${nextLesson}${currentExercise}`);
  };
  const lessonId = formatExerciseId(currentExercise);

  if (state.stats.some((stat: Stats) => stat.lessonId === lessonId)) {
    const { id } = state.stats.filter(
      (stat: Stats) => stat.lessonId === lessonId
    )[0];
    const res = await fetch(`http://localhost:3001/stats/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        lessonId,
        score,
        outOf,
        userId,
      }),
    });

    if (!res.ok) {
      setError("Error submitting score. Please try again later.");
    }

    dispatch(setNewData(true));
  } else {
    const res = await fetch("http://localhost:3001/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId,
        score,
        outOf,
        userId,
      }),
    });

    if (!res.ok) {
      setError("Error submitting score. Please try again later.");
    }

    dispatch(setNewData(true));
  }
};
```

The app is a spanish language learning app with interactive quizzes and activities, when you complete one the score is sent to the database, and here as soon as the request is sent I dispatch a flag to the store to let it know that there is new data. Then, in our navbar where we are fetching the userData we just adjust the dependencies of the useEffect hook to include the isNewData flag:

```tsx
function Navbar(): JSX.Element {
const state = useSelector((state: any) => state.auth);
const isNewData = useSelector((state: any) => state.auth.isNewData);
const dispatch = useDispatch<any>();
const router = useRouter();

const { data, error, refetch } = useGetUserDetailsQuery("userDetails", {
  pollingInterval: isNewData ? 0 : 60000, // Refetch immediately if isNewData is true
});

useEffect(() => {
  if (data) {
    dispatch(setCredentials(data));
    dispatch(setNewData(false));
  }
}, [data, dispatch, state]);

useEffect(() => {
  if (isNewData) {
    refetch(); // Trigger a refetch immediately if isNewData is true
  }
}, [isNewData, refetch]);

useEffect(() => {
  if (error) {
    console.error("No token found");
  }
}, [error]);

const logoutButtonHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  dispatch(logout());
  router.push("/");
};
```

And that was it! The state now updates immediately when new data is sent to the database. I'm sure there is a better way to do this, but this is what I came up with and it works well.

## Conclusion <a name="conclusion"></a>

That concludes my first correct implementation of Redux auth, and it was like a lightbulbs flashing in my head all over the place. My dev friend was laughing, saying everyone goes through this, but in the end you need to do everything from Redux, once you are managing the store from your components it's a mess.

With that said, I'm sure there are better ways to do this, but this is what I came up with and it works well. I'm sure I'll be back to update this as I learn more. Thanks for reading! Until then,

Code On!
